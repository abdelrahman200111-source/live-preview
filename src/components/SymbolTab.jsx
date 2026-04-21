import React, { useState } from 'react'

const SYMBOLS = [
  '♥', '★', '✦', '☽', '♾', '✿',
  '⟡', '◇', '∞', '✝', '☮', '⚘',
  '❀', '☀', '⚓', '☯', '⚜', '♔',
  '♛', '❋', '◈', '✈', '☁', '❁',
]

const SIZE_MIN = 24
const SIZE_MAX = 90
const SIZE_DEFAULT = 52

export default function SymbolTab({ setSymbol, updateSymbolSize, clearSymbol }) {
  const [active, setActive] = useState(null)
  const [size, setSize] = useState(SIZE_DEFAULT)

  const handleSymbol = (sym) => {
    setActive(sym)
    setSymbol(sym, size)
    if (navigator.vibrate) navigator.vibrate(8)
  }

  const handleSize = (val) => {
    const num = Number(val)
    setSize(num)
    if (active) updateSymbolSize(num)
  }

  const handleClear = () => {
    setActive(null)
    clearSymbol()
  }

  return (
    <div className="space-y-5">

      {/* ── Symbol grid ── */}
      <div>
        <label className="block text-[10px] tracking-[0.22em] text-gray-400 uppercase mb-3">
          Choose a Symbol
        </label>
        <div className="grid grid-cols-6 gap-2">
          {SYMBOLS.map(sym => (
            <button
              key={sym}
              onClick={() => handleSymbol(sym)}
              className={`
                h-12 rounded border text-xl transition-all btn-press
                ${active === sym
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-border bg-white text-gray-700 hover:border-gold/40 hover:text-gold'}
              `}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      {/* ── Size slider ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] tracking-[0.22em] text-gray-400 uppercase">Size</label>
          <span className="text-xs text-gray-400">{size}px</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">A</span>
          <input
            type="range"
            min={SIZE_MIN}
            max={SIZE_MAX}
            value={size}
            onChange={e => handleSize(e.target.value)}
            className="flex-1"
          />
          <span className="text-xl text-gray-500" style={{ fontFamily: 'Playfair Display' }}>A</span>
        </div>
      </div>

      {active && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">
            Selected: <span className="text-xl align-middle">{active}</span>
          </span>
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-brand transition-colors underline underline-offset-2"
          >
            Remove
          </button>
        </div>
      )}

      <p className="text-[11px] text-gray-400 text-center" style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}>
        Tap a symbol to place it · adjust size with slider
      </p>
    </div>
  )
}
