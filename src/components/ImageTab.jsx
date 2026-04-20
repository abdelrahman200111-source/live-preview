import React, { useState, useRef } from 'react'
import { addImageToCanvas, IMAGE_CLIP_SHAPES } from '../utils/canvasHelpers'

export default function ImageTab({ canvas, shape, canvasSize }) {
  const [clipShape, setClipShape] = useState('none')
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState('')
  const inputRef = useRef(null)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !canvas) return
    setUploading(true)
    setFileName(file.name)

    const url = URL.createObjectURL(file)
    try {
      await addImageToCanvas(canvas, url, clipShape, shape, canvasSize, canvasSize)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-5 px-1">
      <div>
        <label className="block text-xs tracking-widest text-gray-400 uppercase mb-2" style={{ fontFamily: 'Montserrat' }}>
          Upload Image
        </label>
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full border border-dashed border-border rounded py-4 px-4 flex flex-col items-center gap-1.5 hover:border-gold transition-colors bg-white"
        >
          {uploading ? (
            <div className="spinner" />
          ) : (
            <>
              <span className="text-2xl text-gold">+</span>
              <span className="text-sm text-gray-500" style={{ fontFamily: 'Montserrat' }}>
                {fileName || 'Choose image'}
              </span>
              <span className="text-xs text-gray-400">PNG, JPG, SVG</span>
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      <div>
        <label className="block text-xs tracking-widest text-gray-400 uppercase mb-3" style={{ fontFamily: 'Montserrat' }}>
          Image Shape
        </label>
        <div className="grid grid-cols-4 gap-2">
          {IMAGE_CLIP_SHAPES.map(s => (
            <button
              key={s.id}
              title={s.title}
              onClick={() => setClipShape(s.id)}
              className={`
                h-12 rounded border text-xl transition-all
                ${clipShape === s.id
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-border bg-white text-gray-500 hover:border-gold/50'}
              `}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center" style={{ fontFamily: 'Montserrat' }}>
        Images are auto-converted to grayscale for realistic engraving
      </p>
    </div>
  )
}
