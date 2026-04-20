import React, { useState, useEffect, useRef } from 'react'
import { fabric } from 'fabric'
import { buildClipPath, getZoneBounds } from '../utils/shapes'
import { ENGRAVING_FONTS, ENGRAVING_COLOR } from '../utils/canvasHelpers'

const MAX_CHARS = 30

export default function TextTab({ canvas, shape, canvasSize, activeText, setActiveText }) {
  const [text, setText] = useState('')
  const [font, setFont] = useState('Playfair Display')
  const [size, setSize] = useState(28)
  const textObjRef = useRef(null)

  const syncText = (t, f, s) => {
    const fc = canvas
    if (!fc) return

    const { zX, zY, zW, zH } = getZoneBounds(shape, canvasSize, canvasSize)

    if (textObjRef.current && fc.contains(textObjRef.current)) {
      // Update existing
      textObjRef.current.set({
        text: t || ' ',
        fontFamily: f,
        fontSize: s,
      })
      // Auto fit
      let fs = s
      while (textObjRef.current.width > zW * 0.9 && fs > 8) {
        fs -= 1
        textObjRef.current.set('fontSize', fs)
      }
      fc.renderAll()
    } else if (t.trim()) {
      // Create new
      const clip = buildClipPath(shape, canvasSize, canvasSize)
      const obj = new fabric.IText(t, {
        left: zX + zW / 2,
        top: zY + zH / 2,
        originX: 'center',
        originY: 'center',
        fontFamily: f,
        fontSize: s,
        fill: ENGRAVING_COLOR,
        textAlign: 'center',
        selectable: true,
        editable: false,
        clipPath: clip,
        lockScalingFlip: true,
      })
      // Auto fit
      let fs = s
      while (obj.width > zW * 0.9 && fs > 8) {
        fs -= 1
        obj.set('fontSize', fs)
      }
      fc.add(obj)
      fc.setActiveObject(obj)
      textObjRef.current = obj
      fc.renderAll()
    }
  }

  const handleTextChange = (val) => {
    if (val.length > MAX_CHARS) return
    setText(val)
    syncText(val, font, size)
  }

  const handleFontChange = (f) => {
    setFont(f)
    syncText(text, f, size)
  }

  const handleSizeChange = (s) => {
    const num = Number(s)
    setSize(num)
    syncText(text, font, num)
  }

  // Remove text object when tab unmounts / text cleared
  useEffect(() => {
    return () => {
      // Keep the object on canvas when tab switches
    }
  }, [])

  return (
    <div className="space-y-5 px-1">
      <div>
        <label className="block text-xs tracking-widest text-gray-400 uppercase mb-2" style={{ fontFamily: 'Montserrat' }}>
          Your Message
        </label>
        <div className="relative">
          <input
            type="text"
            value={text}
            onChange={e => handleTextChange(e.target.value)}
            placeholder="e.g. Forever &amp; Always"
            maxLength={MAX_CHARS}
            className="w-full bg-white border border-border rounded px-4 py-3 text-sm outline-none focus:border-gold transition-colors"
            style={{ fontFamily: 'Montserrat', letterSpacing: '0.03em' }}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {text.length}/{MAX_CHARS}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs tracking-widest text-gray-400 uppercase mb-2" style={{ fontFamily: 'Montserrat' }}>
            Font
          </label>
          <div className="relative">
            <select
              value={font}
              onChange={e => handleFontChange(e.target.value)}
              className="w-full appearance-none bg-white border border-border rounded px-3 py-2.5 text-sm pr-8 outline-none focus:border-gold cursor-pointer"
              style={{ fontFamily: font }}
            >
              {ENGRAVING_FONTS.map(f => (
                <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                  {f.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gold text-xs">▾</span>
          </div>
          {/* Font preview */}
          <div
            className="mt-2 text-center text-base text-gray-600 truncate"
            style={{ fontFamily: font, minHeight: '1.5rem' }}
          >
            {text || 'Preview'}
          </div>
        </div>

        <div>
          <label className="block text-xs tracking-widest text-gray-400 uppercase mb-2" style={{ fontFamily: 'Montserrat' }}>
            Size — {size}px
          </label>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400">A</span>
            <input
              type="range"
              min={10}
              max={52}
              value={size}
              onChange={e => handleSizeChange(e.target.value)}
              className="flex-1 accent-gold h-1 cursor-pointer"
            />
            <span className="text-lg text-gray-500" style={{ fontFamily: 'Playfair Display' }}>A</span>
          </div>
          <div className="text-center text-xs text-gray-400 mt-1">{size}px</div>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center" style={{ fontFamily: 'Montserrat' }}>
        Tap the preview to reposition your text
      </p>
    </div>
  )
}
