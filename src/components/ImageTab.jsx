import React, { useState, useRef } from 'react'

const CUT_SHAPES = [
  { id: 'none',     label: '■',  title: 'No cut' },
  { id: 'circle',   label: '●',  title: 'Circle' },
  { id: 'oval-v',   label: '⬬',  title: 'Oval' },
  { id: 'rect-sharp',label: '▬', title: 'Rectangle' },
  { id: 'rect-round',label: '▭', title: 'Rounded rect' },
  { id: 'rect-oct', label: '⬠',  title: 'Octagon' },
  { id: 'square',   label: '◼',  title: 'Square' },
  { id: 'heart',    label: '♥',  title: 'Heart' },
  { id: 'star',     label: '★',  title: 'Star' },
]

export default function ImageTab({ setImage, clearImage }) {
  const [cutShape, setCutShape] = useState('none')
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [hasImage, setHasImage] = useState(false)
  const inputRef = useRef(null)
  const currentUrlRef = useRef(null)

  const loadImage = async (url, shape) => {
    setUploading(true)
    try {
      await setImage(url, shape)
      setHasImage(true)
    } finally {
      setUploading(false)
    }
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name.replace(/\.[^.]+$/, ''))
    const url = URL.createObjectURL(file)
    currentUrlRef.current = url
    loadImage(url, cutShape)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const handleCutShape = (id) => {
    setCutShape(id)
    if (currentUrlRef.current) {
      loadImage(currentUrlRef.current, id)
    }
  }

  const handleRemove = () => {
    clearImage()
    setHasImage(false)
    setFileName('')
    currentUrlRef.current = null
  }

  return (
    <div className="space-y-5">

      {/* ── Upload zone ── */}
      <div>
        <label className="block text-[10px] tracking-[0.22em] text-gray-400 uppercase mb-2">
          Upload Image
        </label>

        {!hasImage ? (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full border border-dashed border-border rounded-sm py-7 flex flex-col items-center gap-2 hover:border-gold transition-colors bg-white btn-press"
          >
            {uploading ? (
              <div className="spinner" />
            ) : (
              <>
                <span className="text-2xl text-gold leading-none">+</span>
                <span className="text-xs text-gray-400">Choose photo</span>
                <span className="text-[10px] text-gray-300">PNG · JPG · WEBP</span>
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-surface border border-border rounded-sm">
            <span className="text-xl text-gold">✓</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-brand truncate">{fileName || 'Image added'}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Auto-converted to grayscale</p>
            </div>
            <button
              onClick={handleRemove}
              className="text-xs text-gray-400 hover:text-brand transition-colors px-2"
            >
              Remove
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {/* ── Cut shape ── */}
      <div>
        <label className="block text-[10px] tracking-[0.22em] text-gray-400 uppercase mb-3">
          Cut Shape
        </label>
        <div className="grid grid-cols-5 gap-2">
          {CUT_SHAPES.map(s => (
            <button
              key={s.id}
              title={s.title}
              onClick={() => handleCutShape(s.id)}
              className={`
                h-11 rounded border text-lg transition-all btn-press
                ${cutShape === s.id
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-border bg-white text-gray-500 hover:border-gold/40'}
              `}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-gray-400 text-center" style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}>
        Pinch to resize · image auto-converts to grayscale
      </p>
    </div>
  )
}
