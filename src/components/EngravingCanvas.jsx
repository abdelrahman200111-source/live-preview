import React, { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import { fabric } from 'fabric'
import { buildClipPath, buildZoneOutline, getZoneBounds } from '../utils/shapes'
import { styleControls, clampObjectToZone } from '../utils/canvasHelpers'

const EngravingCanvas = forwardRef(function EngravingCanvas(
  { productImage, shape, canvasSize, onReady },
  ref
) {
  const canvasElRef = useRef(null)
  const fabricRef = useRef(null)

  useImperativeHandle(ref, () => ({
    getCanvas: () => fabricRef.current,
    exportImage: () => {
      const fc = fabricRef.current
      if (!fc) return null
      // Hide zone outline for export
      fc.getObjects().forEach(obj => { if (obj.excludeFromExport) obj.set('visible', false) })
      fc.discardActiveObject()
      fc.renderAll()
      const dataUrl = fc.toDataURL({ format: 'png', multiplier: 2 })
      fc.getObjects().forEach(obj => { if (obj.excludeFromExport) obj.set('visible', true) })
      fc.renderAll()
      return dataUrl
    },
    clearUserObjects: () => {
      const fc = fabricRef.current
      if (!fc) return
      const toRemove = fc.getObjects().filter(o => !o._isBackground && !o._isZoneOutline)
      toRemove.forEach(o => fc.remove(o))
      fc.renderAll()
    },
  }))

  const initCanvas = useCallback(() => {
    if (!canvasElRef.current) return

    // Dispose previous
    if (fabricRef.current) {
      fabricRef.current.dispose()
    }

    const fc = new fabric.Canvas(canvasElRef.current, {
      width: canvasSize,
      height: canvasSize,
      selection: false,
      preserveObjectStacking: true,
      enableRetinaScaling: true,
      backgroundColor: '#F8F6F1',
    })

    fabricRef.current = fc
    styleControls(fc)

    // Load background image
    if (productImage) {
      fabric.Image.fromURL(
        productImage,
        (img) => {
          const scale = Math.max(canvasSize / img.width, canvasSize / img.height)
          img.set({
            left: canvasSize / 2,
            top: canvasSize / 2,
            originX: 'center',
            originY: 'center',
            scaleX: scale,
            scaleY: scale,
            selectable: false,
            evented: false,
            _isBackground: true,
          })
          fc.add(img)
          fc.sendToBack(img)

          // Zone outline
          const outline = buildZoneOutline(shape, canvasSize, canvasSize)
          outline._isZoneOutline = true
          fc.add(outline)

          fc.renderAll()
          onReady && onReady(fc)
        },
        { crossOrigin: 'anonymous' }
      )
    } else {
      // No image — just show zone outline on surface
      const outline = buildZoneOutline(shape, canvasSize, canvasSize)
      outline._isZoneOutline = true
      fc.add(outline)
      fc.renderAll()
      onReady && onReady(fc)
    }

    // Clamp objects on move
    fc.on('object:moving', (e) => {
      if (e.target && !e.target._isBackground) {
        clampObjectToZone(e.target, shape, canvasSize, canvasSize)
      }
    })

    // Deselect on background click
    fc.on('mouse:down', (e) => {
      if (!e.target) fc.discardActiveObject()
      fc.requestRenderAll()
    })

    // Prevent background from being selected
    fc.on('selection:created', (e) => {
      if (e.selected?.some(o => o._isBackground)) {
        fc.discardActiveObject()
      }
    })

  }, [productImage, shape, canvasSize, onReady])

  useEffect(() => {
    initCanvas()
    return () => {
      if (fabricRef.current) fabricRef.current.dispose()
    }
  }, [initCanvas])

  return (
    <div
      className="relative"
      style={{ width: canvasSize, height: canvasSize }}
    >
      <canvas ref={canvasElRef} />
    </div>
  )
})

export default EngravingCanvas
