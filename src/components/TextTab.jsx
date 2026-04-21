import React, { useState, useEffect, useRef } from 'react'
import { FONTS, DEFAULT_FONT, isRTLText } from '../utils/fonts'

const MAX_CHARS = 30

export default function TextTab({ setText, clearText }) {
  const [text, setText_] = useState('')
  const [font, setFont] = useState(DEFAULT_FONT)
  const prevRef = useRef({ text: '', font: DEFAULT_FONT })

  // Sync to canvas whenever text or font changes
  useEffect(() => {
    const prev = prevRef.current
    if (text === prev.text && font === prev.font) return
    prevRef.current = { text, font }

    if (text.trim()) {
      setText(text, font)
    } else {
      clearText()
    }
  }, [text, font, setText, clearText])

  const handleInput = (val) => {
    if (val.length > MAX_CHARS) return
    setText_(val)
  }

  const rtl = isRTLText(text)

  return (
    <div className="space-y-5">

      {/* ── Text input ── */}
      <div>
        <label className="block text-[10px] tracking-[0.22em] text-gray-400 uppercase mb-2">
          Your Message
        </label>
        <div className="relative">
          <input
            type="text"
            value={text}
            onChange={e => handleInput(e.target.value)}
            placeholder="e.g. Forever & Always"
            maxLength={MAX_CHARS}
            dir={rtl ? 'rtl' : 'ltr'}
            className="w-full bg-white border border-border rounded-sm px-4 py-3 text-sm outline-none focus:border-gold transition-colors"
            style={{
              fontFamily: font,
              letterSpacing: '0.02em',
              textAlign: rtl ? 'right' : 'left',
            }}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-300 pointer-events-none">
            {text.length}/{MAX_CHARS}
          </span>
        </div>
        {text && (
          <p
            className="mt-2 text-center text-base text-gray-500 truncate"
            style={{ fontFamily: font, direction: rtl ? 'rtl' : 'ltr' }}
          >
            {text}
          </p>
        )}
      </div>

      {/* ── Font picker ── */}
      <div>
        <label className="block text-[10px] tracking-[0.22em] text-gray-400 uppercase mb-3">
          Font Style
        </label>

        {/* Latin fonts */}
        <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
          <div className="flex gap-2 pb-2" style={{ width: 'max-content' }}>
            {FONTS.filter(f => !f.rtl).map(f => (
              <FontCard
                key={f.id}
                font={f}
                active={font === f.value}
                onClick={() => setFont(f.value)}
              />
            ))}
          </div>
        </div>

        {/* Arabic / RTL fonts */}
        <p className="text-[10px] tracking-[0.18em] text-gray-400 uppercase mt-3 mb-2">
          Arabic · العربية
        </p>
        <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
          <div className="flex gap-2 pb-1" style={{ width: 'max-content' }}>
            {FONTS.filter(f => f.rtl).map(f => (
              <FontCard
                key={f.id}
                font={f}
                active={font === f.value}
                onClick={() => setFont(f.value)}
                arabic
              />
            ))}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 text-center" style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}>
        Text auto-sizes to fit perfectly on your piece
      </p>
    </div>
  )
}

function FontCard({ font, active, onClick, arabic }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-shrink-0 w-[72px] h-[64px] rounded border transition-all btn-press
        flex flex-col items-center justify-center gap-1
        ${active ? 'font-card-selected' : 'border-border bg-white hover:border-gold/40'}
      `}
    >
      <span
        className="text-xl leading-none text-brand"
        style={{ fontFamily: font.value }}
      >
        {arabic ? font.sampleArabic : font.sampleLatin}
      </span>
      <span className="text-[9px] text-gray-400 tracking-wide leading-none truncate w-full text-center px-1">
        {font.label}
      </span>
    </button>
  )
}
