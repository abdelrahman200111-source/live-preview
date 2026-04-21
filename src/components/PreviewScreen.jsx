import React from 'react'

export default function PreviewScreen({ previewImage, engravingInfo, productTitle, onAddToCart, onEdit }) {
  const { text, font, size } = engravingInfo || {}

  const handleDownload = () => {
    if (!previewImage) return
    const a = document.createElement('a')
    a.href = previewImage
    a.download = `am-engraving-${(productTitle || 'preview').toLowerCase().replace(/\s+/g, '-')}.png`
    a.click()
  }

  return (
    <div className="flex flex-col h-full bg-bg">

      {/* ── Header ── */}
      <div className="px-6 pt-7 pb-4 text-center border-b border-border bg-white">
        <p className="text-[10px] tracking-[0.28em] text-gold uppercase mb-1" style={{ fontFamily: 'Montserrat', fontWeight: 300 }}>
          AM Luxury Jewelry
        </p>
        <h1 className="text-xl text-brand" style={{ fontFamily: 'Playfair Display', fontWeight: 400 }}>
          Your Design
        </h1>
        {productTitle && (
          <p className="text-xs text-gray-400 mt-1 truncate">{productTitle}</p>
        )}
      </div>

      {/* ── Preview image ── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 py-6 overflow-y-auto">
        <div className="relative shadow-xl border border-border overflow-hidden rounded-sm bg-surface w-full max-w-xs aspect-square">
          {previewImage ? (
            <img src={previewImage} alt="Engraving preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gold/30 text-6xl">✦</div>
          )}
          {/* Watermark */}
          <div
            className="absolute bottom-2 right-3 text-[10px] text-gold/30 tracking-widest pointer-events-none"
            style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}
          >
            AM Luxury
          </div>
        </div>

        {/* ── Summary card ── */}
        <div className="w-full max-w-xs bg-surface border border-border rounded-sm px-5 py-4 space-y-2.5">
          <p className="text-[10px] tracking-[0.22em] text-gray-400 uppercase">Design Summary</p>

          {text ? (
            <>
              <Row label="Text">
                <span style={{ fontFamily: font || 'Playfair Display' }} className="text-sm text-brand">
                  {text}
                </span>
              </Row>
              {font && <Row label="Font"><span className="text-xs text-brand">{font}</span></Row>}
              {size && <Row label="Size"><span className="text-xs text-brand">{size}px</span></Row>}
            </>
          ) : (
            <p className="text-xs text-gray-400 italic">Custom design (image or symbol)</p>
          )}
        </div>

        {/* ── Download ── */}
        <button
          onClick={handleDownload}
          disabled={!previewImage}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-gold transition-colors disabled:opacity-30"
        >
          <span className="text-base leading-none">↓</span>
          Download preview image
        </button>
      </div>

      {/* ── CTAs ── */}
      <div className="px-5 pb-safe pb-8 pt-4 space-y-2.5 border-t border-border bg-white">
        <button
          onClick={onAddToCart}
          className="w-full py-4 bg-brand text-white text-[11px] tracking-[0.22em] uppercase transition-all hover:bg-gold-dark active:scale-[0.98] btn-press"
          style={{ fontFamily: 'Montserrat' }}
        >
          Add to Cart
        </button>
        <button
          onClick={onEdit}
          className="w-full py-3 border border-border text-[11px] tracking-[0.22em] uppercase text-gray-400 hover:border-gold hover:text-gold transition-all btn-press"
          style={{ fontFamily: 'Montserrat' }}
        >
          Edit Design
        </button>
        <p
          className="text-center text-[11px] text-gray-400 pt-1"
          style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}
        >
          Engraving is permanent — cannot be changed after ordering
        </p>
      </div>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[10px] text-gray-400 shrink-0" style={{ fontFamily: 'Montserrat' }}>{label}</span>
      <span className="text-right min-w-0">{children}</span>
    </div>
  )
}
