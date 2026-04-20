import React, { useState, useEffect, useRef, useCallback } from 'react'
import EngravingCanvas from './components/EngravingCanvas'
import TextTab from './components/TextTab'
import ImageTab from './components/ImageTab'
import SymbolTab from './components/SymbolTab'
import PreviewScreen from './components/PreviewScreen'

const TABS = ['Text', 'Image', 'Symbol']
const CANVAS_SIZE = 340

function useUrlParams() {
  const params = new URLSearchParams(window.location.search)
  return {
    img: params.get('img') || '',
    title: params.get('title') || 'Your Piece',
    shape: params.get('shape') || 'circle',
  }
}

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface z-10">
      <div className="spinner mb-4" />
      <p className="text-xs tracking-widest text-gray-400 uppercase" style={{ fontFamily: 'Montserrat' }}>
        Loading your piece…
      </p>
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface z-10 gap-3 px-8 text-center">
      <span className="text-4xl text-gold/40">✦</span>
      <p className="text-sm text-gray-500" style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}>
        {message || 'Unable to load product image'}
      </p>
      <p className="text-xs text-gray-400" style={{ fontFamily: 'Montserrat' }}>
        You can still design your engraving below
      </p>
    </div>
  )
}

export default function App() {
  const { img, title, shape } = useUrlParams()
  const [activeTab, setActiveTab] = useState(0)
  const [screen, setScreen] = useState('tool') // 'tool' | 'preview'
  const [canvasReady, setCanvasReady] = useState(false)
  const [imgLoading, setImgLoading] = useState(!!img)
  const [imgError, setImgError] = useState(false)
  const [canvasInst, setCanvasInst] = useState(null)
  const [previewData, setPreviewData] = useState(null)
  const canvasRef = useRef(null)

  // Preload image to detect error
  useEffect(() => {
    if (!img) { setImgLoading(false); return }
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => setImgLoading(false)
    image.onerror = () => { setImgLoading(false); setImgError(true) }
    image.src = img
  }, [img])

  const handleCanvasReady = useCallback((fc) => {
    setCanvasInst(fc)
    setCanvasReady(true)
  }, [])

  const handleConfirm = () => {
    if (!canvasRef.current) return
    const imageDataUrl = canvasRef.current.exportImage()

    // Gather text info from canvas objects
    const fc = canvasRef.current.getCanvas()
    let engravingText = '', engravingFont = '', engravingSize = 0
    if (fc) {
      fc.getObjects().forEach(obj => {
        if (obj.text && !obj._isBackground) {
          engravingText = obj.text
          engravingFont = obj.fontFamily || ''
          engravingSize = obj.fontSize || 0
        }
      })
    }

    const data = {
      type: 'AM_ENGRAVING_CONFIRMED',
      text: engravingText,
      font: engravingFont,
      size: engravingSize,
      imageDataUrl,
      engravingData: [
        engravingText && `Text: ${engravingText}`,
        engravingFont && `Font: ${engravingFont}`,
        engravingSize && `Size: ${engravingSize}px`,
      ].filter(Boolean).join(' | '),
    }

    setPreviewData({ ...data, imageDataUrl })
    setScreen('preview')
  }

  const handleAddToCart = () => {
    if (!previewData) return
    try {
      window.parent.postMessage(previewData, '*')
      if (window.opener) window.opener.postMessage(previewData, '*')
    } catch (e) {}
    // Graceful close
    try { window.close() } catch (e) {}
  }

  const handleStartOver = () => {
    canvasRef.current?.clearUserObjects()
  }

  const handleClose = () => {
    try { window.close() } catch (e) {}
    try { window.parent.postMessage({ type: 'AM_ENGRAVING_CLOSED' }, '*') } catch (e) {}
  }

  if (screen === 'preview') {
    return (
      <div className="min-h-screen max-w-[480px] mx-auto">
        <PreviewScreen
          previewImage={previewData?.imageDataUrl}
          engravingData={previewData}
          onAddToCart={handleAddToCart}
          onEdit={() => setScreen('tool')}
        />
      </div>
    )
  }

  return (
    <div
      className="flex flex-col min-h-screen max-w-[480px] mx-auto bg-bg"
      style={{ fontFamily: 'Montserrat' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-6 pb-3">
        <div>
          <p className="text-xs tracking-[0.25em] text-gold uppercase" style={{ fontWeight: 300 }}>
            AM Luxury Jewelry
          </p>
          <h1
            className="text-xl text-brand leading-tight mt-0.5"
            style={{ fontFamily: 'Playfair Display', fontWeight: 400 }}
          >
            Personalise Your Piece
          </h1>
          {title && title !== 'Your Piece' && (
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[240px]">{title}</p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-brand rounded-full hover:bg-surface transition-colors text-lg"
          aria-label="Close"
        >
          ×
        </button>
      </header>

      {/* Canvas Area */}
      <div className="flex items-center justify-center px-4 py-3 bg-surface border-y border-border">
        <div className="relative" style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}>
          {imgLoading && <LoadingOverlay />}
          {imgError && !imgLoading && <ErrorState />}
          <EngravingCanvas
            ref={canvasRef}
            productImage={imgError ? '' : img}
            shape={shape}
            canvasSize={CANVAS_SIZE}
            onReady={handleCanvasReady}
          />
        </div>
      </div>

      {/* Drag hint */}
      <p className="text-center text-xs text-gray-400 py-2 tracking-wide" style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}>
        ↕ Tap to select · drag to reposition
      </p>

      {/* Tabs */}
      <div className="flex border-b border-border bg-white">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`
              flex-1 py-3 text-xs tracking-widest uppercase transition-all relative
              ${activeTab === i ? 'text-brand' : 'text-gray-400 hover:text-gray-600'}
            `}
          >
            {tab}
            {activeTab === i && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gold rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide bg-bg px-4 py-5">
        {activeTab === 0 && (
          <TextTab
            canvas={canvasInst}
            shape={shape}
            canvasSize={CANVAS_SIZE}
          />
        )}
        {activeTab === 1 && (
          <ImageTab
            canvas={canvasInst}
            shape={shape}
            canvasSize={CANVAS_SIZE}
          />
        )}
        {activeTab === 2 && (
          <SymbolTab
            canvas={canvasInst}
            shape={shape}
            canvasSize={CANVAS_SIZE}
          />
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-5 pb-8 pt-3 space-y-2.5 border-t border-border bg-white">
        <button
          onClick={handleConfirm}
          disabled={!canvasReady}
          className="w-full py-4 bg-brand text-white text-xs tracking-widest uppercase transition-all hover:bg-gold-dark active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Confirm Design
        </button>
        <button
          onClick={handleStartOver}
          className="w-full py-3 border border-border text-xs tracking-widest uppercase text-gray-400 hover:border-gold hover:text-gold transition-all"
        >
          Start Over
        </button>
      </div>
    </div>
  )
}
