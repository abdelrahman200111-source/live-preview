import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useCanvasManager } from './hooks/useCanvasManager'
import TextTab from './components/TextTab'
import ImageTab from './components/ImageTab'
import SymbolTab from './components/SymbolTab'
import PreviewScreen from './components/PreviewScreen'

// ── URL params ────────────────────────────────────────────
function useUrlParams() {
  const p = new URLSearchParams(window.location.search)
  return {
    img:   p.get('img')   || '',
    title: p.get('title') || '',
    shape: p.get('shape') || 'circle',
  }
}

// ── Canvas size: responsive square, max 360 ───────────────
function useCanvasSize() {
  const [size, setSize] = useState(() => Math.min(window.innerWidth, 360))
  useEffect(() => {
    const update = () => setSize(Math.min(window.innerWidth, 360))
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return size
}

// ── Tab definitions ───────────────────────────────────────
const TABS = ['Text', 'Image', 'Symbol']

// ─────────────────────────────────────────────────────────
export default function App() {
  const { img, title, shape } = useUrlParams()
  const canvasSize = useCanvasSize()
  const [screen, setScreen]     = useState('tool') // 'tool' | 'preview'
  const [activeTab, setActiveTab] = useState(0)
  const [previewData, setPreviewData] = useState(null)
  const [drawerOpen, setDrawerOpen]   = useState(false)
  const touchStartX = useRef(0)

  const canvas = useCanvasManager({ productImage: img, shape, canvasSize })

  // Animate drawer open after mount
  useEffect(() => {
    const t = setTimeout(() => setDrawerOpen(true), 60)
    return () => clearTimeout(t)
  }, [])

  // ── Tab swipe handlers ────────────────────────────────
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd   = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) < 40) return
    if (dx < 0 && activeTab < TABS.length - 1) setActiveTab(t => t + 1)
    if (dx > 0 && activeTab > 0)               setActiveTab(t => t - 1)
  }

  // ── Confirm design ────────────────────────────────────
  const handleConfirm = useCallback(() => {
    const imageDataUrl  = canvas.exportImage()
    const engravingInfo = canvas.getEngravingInfo()
    const parts = [
      engravingInfo.text && `Text: ${engravingInfo.text}`,
      engravingInfo.font && `Font: ${engravingInfo.font}`,
      engravingInfo.size && `Size: ${engravingInfo.size}px`,
    ].filter(Boolean)

    setPreviewData({
      imageDataUrl,
      engravingInfo,
      engravingData: parts.length ? parts.join(' | ') : 'Custom design (image/symbol)',
    })
    setScreen('preview')
  }, [canvas])

  // ── Add to cart → postMessage ─────────────────────────
  const handleAddToCart = useCallback(() => {
    if (!previewData) return
    const msg = {
      type: 'AM_ENGRAVING_CONFIRMED',
      ...previewData.engravingInfo,
      imageDataUrl: previewData.imageDataUrl,
      engravingData: previewData.engravingData,
    }
    try { window.parent.postMessage(msg, '*') } catch (_) {}
    try { if (window.opener) window.opener.postMessage(msg, '*') } catch (_) {}
    try { window.close() } catch (_) {}
  }, [previewData])

  const handleClose = () => {
    try { window.parent.postMessage({ type: 'AM_ENGRAVING_CLOSED' }, '*') } catch (_) {}
    try { window.close() } catch (_) {}
  }

  // ── Preview screen ────────────────────────────────────
  if (screen === 'preview') {
    return (
      <div className="fixed inset-0 bg-bg flex items-end sm:items-center justify-center">
        <div className="w-full max-w-[480px] h-full sm:h-auto sm:max-h-[92vh] sm:rounded-t-2xl overflow-hidden flex flex-col bg-bg shadow-2xl">
          <PreviewScreen
            previewImage={previewData?.imageDataUrl}
            engravingInfo={previewData?.engravingInfo}
            productTitle={title}
            onAddToCart={handleAddToCart}
            onEdit={() => setScreen('tool')}
          />
        </div>
      </div>
    )
  }

  // ── Tool screen ───────────────────────────────────────
  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-[2px]">
      {/* Drawer / modal */}
      <div
        className={`
          w-full max-w-[480px] bg-white flex flex-col
          rounded-t-2xl sm:rounded-2xl
          shadow-2xl overflow-hidden
          transition-transform duration-[380ms] ease-[cubic-bezier(0.32,0.72,0,1)]
          ${drawerOpen ? 'translate-y-0' : 'translate-y-full sm:translate-y-8 sm:opacity-0'}
        `}
        style={{ maxHeight: '96vh' }}
      >
        {/* ── Drag handle (mobile only) ── */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* ── Header ── */}
        <header className="flex items-start justify-between px-5 pt-2 pb-3 border-b border-border shrink-0">
          <div>
            <p className="text-[10px] tracking-[0.28em] text-gold uppercase" style={{ fontWeight: 300 }}>
              AM Luxury Jewelry
            </p>
            <h1 className="text-lg text-brand mt-0.5 leading-tight" style={{ fontFamily: 'Playfair Display', fontWeight: 400 }}>
              Personalise Your Piece
            </h1>
            {title && (
              <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-[220px]">{title}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-brand hover:bg-surface rounded-full transition-colors text-xl leading-none ml-2 mt-0.5 shrink-0"
            aria-label="Close"
          >
            ×
          </button>
        </header>

        {/* ── Canvas ── */}
        <div className="bg-surface border-b border-border shrink-0 flex items-center justify-center relative"
          style={{ height: canvasSize }}>
          {canvas.imgLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface z-10 gap-3">
              <div className="spinner" />
              <p className="text-[10px] tracking-widest text-gray-400 uppercase">Loading…</p>
            </div>
          )}
          {/* The actual Fabric.js canvas element */}
          <canvas ref={canvas.canvasElRef} />
        </div>

        {/* ── Tab bar ── */}
        <div className="flex border-b border-border shrink-0 bg-white">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`
                flex-1 py-3 text-[10px] tracking-[0.22em] uppercase relative transition-colors
                ${activeTab === i ? 'text-brand' : 'text-gray-400 hover:text-gray-600'}
              `}
            >
              {tab}
              {activeTab === i && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full bg-gold" />
              )}
            </button>
          ))}
        </div>

        {/* ── Tab content (swipeable) ── */}
        <div
          className="overflow-hidden shrink-0"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="tab-track"
            style={{ transform: `translateX(${-activeTab * 100}%)` }}
          >
            {/* Text tab */}
            <div className="tab-panel px-5 py-5 overflow-y-auto scrollbar-hide" style={{ maxHeight: '38vh' }}>
              <TextTab
                setText={canvas.setText}
                clearText={canvas.clearText}
              />
            </div>

            {/* Image tab */}
            <div className="tab-panel px-5 py-5 overflow-y-auto scrollbar-hide" style={{ maxHeight: '38vh' }}>
              <ImageTab
                setImage={canvas.setImage}
                clearImage={canvas.clearImage}
              />
            </div>

            {/* Symbol tab */}
            <div className="tab-panel px-5 py-5 overflow-y-auto scrollbar-hide" style={{ maxHeight: '38vh' }}>
              <SymbolTab
                setSymbol={canvas.setSymbol}
                updateSymbolSize={canvas.updateSymbolSize}
                clearSymbol={canvas.clearSymbol}
              />
            </div>
          </div>
        </div>

        {/* ── CTAs ── */}
        <div className="px-5 pt-3 pb-7 space-y-2.5 border-t border-border bg-white shrink-0">
          <button
            onClick={handleConfirm}
            disabled={!canvas.ready}
            className="w-full py-4 bg-brand text-white text-[11px] tracking-[0.22em] uppercase transition-all hover:bg-gold-dark active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed btn-press"
            style={{ fontFamily: 'Montserrat' }}
          >
            Confirm Design
          </button>
          <button
            onClick={canvas.clearAll}
            className="w-full py-3 border border-border text-[11px] tracking-[0.22em] uppercase text-gray-400 hover:border-gold hover:text-gold transition-all btn-press"
            style={{ fontFamily: 'Montserrat' }}
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  )
}
