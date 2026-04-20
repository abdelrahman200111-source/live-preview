import React from 'react'
import { addSymbolToCanvas, SYMBOLS } from '../utils/canvasHelpers'

export default function SymbolTab({ canvas, shape, canvasSize }) {
  const handleSymbol = (sym) => {
    if (!canvas) return
    addSymbolToCanvas(canvas, sym, shape, canvasSize, canvasSize)
    if (navigator.vibrate) navigator.vibrate(10)
  }

  return (
    <div className="space-y-4 px-1">
      <label className="block text-xs tracking-widest text-gray-400 uppercase" style={{ fontFamily: 'Montserrat' }}>
        Choose a Symbol
      </label>
      <div className="grid grid-cols-4 gap-2.5">
        {SYMBOLS.map((sym) => (
          <button
            key={sym}
            onClick={() => handleSymbol(sym)}
            className="h-14 rounded border border-border bg-white text-2xl hover:border-gold hover:bg-gold/5 active:scale-95 transition-all text-gray-700 hover:text-gold"
            title={sym}
          >
            {sym}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 text-center" style={{ fontFamily: 'Montserrat' }}>
        Tap a symbol to add it · drag to reposition
      </p>
    </div>
  )
}
