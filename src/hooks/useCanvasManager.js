import { useEffect, useRef, useState, useCallback } from 'react'
import { fabric } from 'fabric'
import { buildClipPath, buildZoneOutline, getZoneBounds, buildImageCutClip } from '../utils/shapes'
import { autoFitFontSize, isRTLText, DEFAULT_FONT } from '../utils/fonts'

const ENGRAVING_FILL = 'rgba(26,18,8,0.82)'
const ENGRAVING_BLEND = 'multiply'

function styleGlobalControls() {
  fabric.Object.prototype.set({
    borderColor: '#C6A25A',
    borderScaleFactor: 1.5,
    cornerColor: '#ffffff',
    cornerStrokeColor: '#C6A25A',
    cornerSize: 11,
    cornerStyle: 'circle',
    transparentCorners: false,
    padding: 8,
  })
}

export function useCanvasManager({ productImage, shape, canvasSize }) {
  const canvasElRef = useRef(null)
  const fabricRef   = useRef(null)
  const layersRef   = useRef({ bg: null, outline: null, text: null, symbol: null, image: null })

  const [ready, setReady] = useState(false)
  const [imgLoading, setImgLoading] = useState(!!productImage)

  // ── Init ──────────────────────────────────────────────────
  useEffect(() => {
    const el = canvasElRef.current
    if (!el) return

    if (fabricRef.current) fabricRef.current.dispose()

    const fc = new fabric.Canvas(el, {
      width: canvasSize,
      height: canvasSize,
      selection: false,
      preserveObjectStacking: true,
      enableRetinaScaling: true,
      backgroundColor: '#F8F6F1',
    })
    fabricRef.current = fc
    styleGlobalControls()

    // Deselect on empty click
    fc.on('mouse:down', e => {
      if (!e.target) { fc.discardActiveObject(); fc.requestRenderAll() }
    })

    // ── Load bg image then outline ──────────────────────────
    const setupCanvas = () => {
      const { cx, cy } = getZoneBounds(shape, canvasSize, canvasSize)

      const addOutline = () => {
        const outline = buildZoneOutline(shape, canvasSize, canvasSize)
        fc.add(outline)
        layersRef.current.outline = outline
        fc.renderAll()
        setReady(true)
        setImgLoading(false)
      }

      if (productImage) {
        setImgLoading(true)
        fabric.Image.fromURL(
          productImage,
          (img) => {
            const scale = Math.max(canvasSize / img.width, canvasSize / img.height)
            img.set({
              left: cx, top: cy,
              originX: 'center', originY: 'center',
              scaleX: scale, scaleY: scale,
              selectable: false, evented: false,
              _isBg: true,
            })
            fc.add(img)
            fc.sendToBack(img)
            layersRef.current.bg = img
            addOutline()
          },
          { crossOrigin: 'anonymous' }
        )
      } else {
        addOutline()
      }
    }

    setupCanvas()

    return () => { fc.dispose(); fabricRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productImage, shape, canvasSize])

  // ── Helpers ───────────────────────────────────────────────

  const bringOutlineToFront = useCallback(() => {
    const fc = fabricRef.current
    const outline = layersRef.current.outline
    if (fc && outline) fc.bringToFront(outline)
  }, [])

  const zoneMeta = useCallback(() => {
    return getZoneBounds(shape, canvasSize, canvasSize)
  }, [shape, canvasSize])

  // ── Text ──────────────────────────────────────────────────

  const setText = useCallback((text, fontFamily = DEFAULT_FONT) => {
    const fc = fabricRef.current
    if (!fc || !ready) return

    const { cx, cy, zW } = zoneMeta()
    const maxW = zW * 0.88
    const rtl = isRTLText(text)
    const fontSize = autoFitFontSize(text || 'M', fontFamily, maxW)

    if (layersRef.current.text) {
      const obj = layersRef.current.text
      obj.set({
        text: text || '',
        fontFamily,
        fontSize: autoFitFontSize(text || 'M', fontFamily, maxW),
        textAlign: rtl ? 'right' : 'center',
        direction: rtl ? 'rtl' : 'ltr',
        left: cx,
        top: cy,
      })
      fc.renderAll()
      return
    }

    if (!text.trim()) return

    const clip = buildClipPath(shape, canvasSize, canvasSize)
    const obj = new fabric.Text(text, {
      left: cx, top: cy,
      originX: 'center', originY: 'center',
      fontFamily,
      fontSize,
      fill: ENGRAVING_FILL,
      globalCompositeOperation: ENGRAVING_BLEND,
      textAlign: rtl ? 'right' : 'center',
      direction: rtl ? 'rtl' : 'ltr',
      selectable: false,
      evented: false,
      clipPath: clip,
    })

    fc.add(obj)
    layersRef.current.text = obj
    bringOutlineToFront()
    fc.renderAll()
  }, [ready, zoneMeta, shape, canvasSize, bringOutlineToFront])

  const clearText = useCallback(() => {
    const fc = fabricRef.current
    if (!fc) return
    if (layersRef.current.text) {
      fc.remove(layersRef.current.text)
      layersRef.current.text = null
      fc.renderAll()
    }
  }, [])

  // ── Symbol ────────────────────────────────────────────────

  const setSymbol = useCallback((symbol, size = 52) => {
    const fc = fabricRef.current
    if (!fc || !ready) return

    const { cx, cy } = zoneMeta()

    // Remove old symbol
    if (layersRef.current.symbol) fc.remove(layersRef.current.symbol)

    const clip = buildClipPath(shape, canvasSize, canvasSize)
    const obj = new fabric.Text(symbol, {
      left: cx, top: cy,
      originX: 'center', originY: 'center',
      fontSize: size,
      fill: ENGRAVING_FILL,
      globalCompositeOperation: ENGRAVING_BLEND,
      selectable: false,
      evented: false,
      clipPath: clip,
    })

    fc.add(obj)
    layersRef.current.symbol = obj
    bringOutlineToFront()
    fc.renderAll()
  }, [ready, zoneMeta, shape, canvasSize, bringOutlineToFront])

  const updateSymbolSize = useCallback((size) => {
    const fc = fabricRef.current
    const obj = layersRef.current.symbol
    if (!fc || !obj) return
    obj.set('fontSize', size)
    fc.renderAll()
  }, [])

  const clearSymbol = useCallback(() => {
    const fc = fabricRef.current
    if (!fc) return
    if (layersRef.current.symbol) {
      fc.remove(layersRef.current.symbol)
      layersRef.current.symbol = null
      fc.renderAll()
    }
  }, [])

  // ── Image ─────────────────────────────────────────────────

  const setImage = useCallback((dataUrl, cutShape = 'none') => {
    return new Promise((resolve) => {
      const fc = fabricRef.current
      if (!fc || !ready) { resolve(); return }

      const { cx, cy, zW, zH } = zoneMeta()

      // Remove previous image
      if (layersRef.current.image) {
        fc.remove(layersRef.current.image)
        layersRef.current.image = null
      }

      fabric.Image.fromURL(dataUrl, (img) => {
        // Grayscale
        img.filters.push(new fabric.Image.filters.Grayscale())
        img.applyFilters()

        // Scale to fill zone
        const scale = Math.max(zW / img.width, zH / img.height) * 0.85
        img.scale(scale)

        // Apply cut shape as relative clip (before positioning)
        if (cutShape && cutShape !== 'none') {
          const clipW = img.getScaledWidth()
          const clipH = img.getScaledHeight()
          const cutClip = buildImageCutClip(cutShape, clipW, clipH)
          if (cutClip) img.clipPath = cutClip
        }

        img.set({
          left: cx, top: cy,
          originX: 'center', originY: 'center',
          // Lock movement, allow scale only
          lockMovementX: true,
          lockMovementY: true,
          lockRotation: true,
          lockSkewingX: true,
          lockSkewingY: true,
          hasControls: true,
          selectable: true,
          globalCompositeOperation: ENGRAVING_BLEND,
        })

        // Remove irrelevant control handles — keep only corners for scale
        img.setControlsVisibility({
          mt: false, mb: false, ml: false, mr: false, mtr: false,
        })

        fc.add(img)
        fc.setActiveObject(img)
        layersRef.current.image = img
        bringOutlineToFront()
        fc.renderAll()
        resolve()
      }, { crossOrigin: 'anonymous' })
    })
  }, [ready, zoneMeta, bringOutlineToFront])

  const clearImage = useCallback(() => {
    const fc = fabricRef.current
    if (!fc) return
    if (layersRef.current.image) {
      fc.remove(layersRef.current.image)
      layersRef.current.image = null
      fc.renderAll()
    }
  }, [])

  // ── Clear all user objects ────────────────────────────────

  const clearAll = useCallback(() => {
    const fc = fabricRef.current
    if (!fc) return
    const toRemove = fc.getObjects().filter(o => !o._isBg && !o._isOutline)
    toRemove.forEach(o => fc.remove(o))
    layersRef.current.text = null
    layersRef.current.symbol = null
    layersRef.current.image = null
    fc.renderAll()
  }, [])

  // ── Export ────────────────────────────────────────────────

  const exportImage = useCallback(() => {
    const fc = fabricRef.current
    if (!fc) return null
    const outline = layersRef.current.outline
    if (outline) outline.set('visible', false)
    fc.discardActiveObject()
    fc.renderAll()
    const dataUrl = fc.toDataURL({ format: 'png', multiplier: 2 })
    if (outline) outline.set('visible', true)
    fc.renderAll()
    return dataUrl
  }, [])

  // ── Engraving info for postMessage / summary ──────────────

  const getEngravingInfo = useCallback(() => {
    const obj = layersRef.current.text
    if (!obj) return {}
    return {
      text: obj.text,
      font: obj.fontFamily,
      size: Math.round(obj.fontSize),
    }
  }, [])

  return {
    canvasElRef,
    ready,
    imgLoading,
    // text
    setText,
    clearText,
    // symbol
    setSymbol,
    updateSymbolSize,
    clearSymbol,
    // image
    setImage,
    clearImage,
    // global
    clearAll,
    exportImage,
    getEngravingInfo,
  }
}
