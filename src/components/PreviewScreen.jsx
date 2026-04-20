import React from 'react'

export default function PreviewScreen({ previewImage, engravingData, onAddToCart, onEdit }) {
  return (
    <div className="flex flex-col h-full bg-bg">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 text-center border-b border-border">
        <p className="text-xs tracking-[0.25em] text-gold uppercase mb-1" style={{ fontFamily: 'Montserrat', fontWeight: 300 }}>
          AM Luxury Jewelry
        </p>
        <h1 className="text-2xl text-brand" style={{ fontFamily: 'Playfair Display', fontWeight: 400 }}>
          Your Design
        </h1>
      </div>

      {/* Preview image */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-8">
        <div className="relative rounded-lg overflow-hidden shadow-xl border border-border bg-surface">
          {previewImage ? (
            <img src={previewImage} alt="Engraving preview" className="w-full max-w-xs" />
          ) : (
            <div className="w-72 h-72 flex items-center justify-center text-gray-300">
              <span className="text-6xl">✦</span>
            </div>
          )}
          {/* Elegant overlay watermark */}
          <div className="absolute bottom-2 right-3 text-xs text-gold/40 tracking-widest" style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}>
            AM Luxury
          </div>
        </div>

        {/* Summary */}
        <div className="w-full max-w-xs bg-surface border border-border rounded-lg px-5 py-4 space-y-2">
          <p className="text-xs tracking-widest text-gray-400 uppercase" style={{ fontFamily: 'Montserrat' }}>Design Summary</p>
          {engravingData?.text && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400" style={{ fontFamily: 'Montserrat' }}>Text</span>
              <span className="text-sm text-brand" style={{ fontFamily: engravingData.font || 'Playfair Display' }}>
                {engravingData.text}
              </span>
            </div>
          )}
          {engravingData?.font && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400" style={{ fontFamily: 'Montserrat' }}>Font</span>
              <span className="text-xs text-brand" style={{ fontFamily: 'Montserrat' }}>{engravingData.font}</span>
            </div>
          )}
          {engravingData?.size && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400" style={{ fontFamily: 'Montserrat' }}>Size</span>
              <span className="text-xs text-brand" style={{ fontFamily: 'Montserrat' }}>{engravingData.size}px</span>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-10 pt-2 space-y-3 border-t border-border bg-white">
        <button
          onClick={onAddToCart}
          className="w-full py-4 bg-brand text-white text-sm tracking-widest uppercase transition-all hover:bg-gold-dark active:scale-[0.98]"
          style={{ fontFamily: 'Montserrat', fontWeight: 400 }}
        >
          Add to Cart
        </button>
        <button
          onClick={onEdit}
          className="w-full py-3 border border-border text-sm tracking-widest uppercase text-gray-500 hover:border-gold hover:text-gold transition-all"
          style={{ fontFamily: 'Montserrat' }}
        >
          Edit Design
        </button>
        <p className="text-center text-xs text-gray-400 pt-1" style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}>
          Your engraving is permanent and cannot be changed after ordering
        </p>
      </div>
    </div>
  )
}
