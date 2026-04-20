import { fabric } from 'fabric'
import { buildClipPath, getZoneBounds } from './shapes'

export const ENGRAVING_FONTS = [
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'Cormorant Garamond', value: 'Cormorant Garamond' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Great Vibes', value: 'Great Vibes' },
  { label: 'Serif (Times)', value: 'Times New Roman' },
]

export const SYMBOLS = [
  '♥', '★', '✦', '☽', '♾', '✿',
  '⟡', '◇', '∞', '✝', '☮', '⚘',
  '✸', '❋', '⊕', '✺',
]

export const IMAGE_CLIP_SHAPES = [
  { id: 'none',   label: '■', title: 'None' },
  { id: 'rect',   label: '▭', title: 'Rectangle' },
  { id: 'round',  label: '▢', title: 'Rounded' },
  { id: 'circle', label: '●', title: 'Circle' },
  { id: 'oval',   label: '⬬', title: 'Oval' },
  { id: 'heart',  label: '♥', title: 'Heart' },
  { id: 'star',   label: '★', title: 'Star' },
  { id: 'diamond',label: '◆', title: 'Diamond' },
]

export const ENGRAVING_COLOR = 'rgba(26,18,8,0.70)'

export function clampObjectToZone(obj, shape, canvasW, canvasH) {
  const { zX, zY, zW, zH } = getZoneBounds(shape, canvasW, canvasH)
  const bounding = obj.getBoundingRect(true)

  let newLeft = obj.left
  let newTop = obj.top

  if (bounding.left < zX) newLeft += zX - bounding.left
  if (bounding.top < zY) newTop += zY - bounding.top
  if (bounding.left + bounding.width > zX + zW) newLeft -= (bounding.left + bounding.width) - (zX + zW)
  if (bounding.top + bounding.height > zY + zH) newTop -= (bounding.top + bounding.height) - (zY + zH)

  obj.set({ left: newLeft, top: newTop })
}

export function applyGrayscale(imgObj) {
  const filter = new fabric.Image.filters.Grayscale()
  imgObj.filters = [filter]
  imgObj.applyFilters()
}

export function styleControls(canvas) {
  const goldColor = '#C6A25A'
  fabric.Object.prototype.set({
    borderColor: goldColor,
    borderScaleFactor: 1.5,
    cornerColor: '#FFFFFF',
    cornerStrokeColor: goldColor,
    cornerSize: 10,
    cornerStyle: 'circle',
    transparentCorners: false,
    padding: 6,
  })
  canvas.renderAll()
}

export function addTextToCanvas(canvas, text, font, size, shape, canvasW, canvasH) {
  const clip = buildClipPath(shape, canvasW, canvasH)
  const { zX, zY, zW, zH } = getZoneBounds(shape, canvasW, canvasH)

  const fabricText = new fabric.IText(text || 'Your Text', {
    left: zX + zW / 2,
    top: zY + zH / 2,
    originX: 'center',
    originY: 'center',
    fontFamily: font,
    fontSize: size,
    fill: ENGRAVING_COLOR,
    textAlign: 'center',
    selectable: true,
    editable: true,
    clipPath: clip,
    lockScalingFlip: true,
    maxWidth: zW * 0.9,
  })

  // Auto-fit font size to zone width
  while (fabricText.width > zW * 0.9 && fabricText.fontSize > 8) {
    fabricText.set('fontSize', fabricText.fontSize - 1)
  }

  canvas.add(fabricText)
  canvas.setActiveObject(fabricText)
  canvas.renderAll()
  return fabricText
}

export function addSymbolToCanvas(canvas, symbol, shape, canvasW, canvasH) {
  const clip = buildClipPath(shape, canvasW, canvasH)
  const { zX, zY, zW, zH } = getZoneBounds(shape, canvasW, canvasH)

  const obj = new fabric.Text(symbol, {
    left: zX + zW / 2,
    top: zY + zH / 2,
    originX: 'center',
    originY: 'center',
    fontSize: Math.min(zW, zH) * 0.35,
    fill: ENGRAVING_COLOR,
    selectable: true,
    clipPath: clip,
    lockScalingFlip: true,
  })

  canvas.add(obj)
  canvas.setActiveObject(obj)
  canvas.renderAll()
  return obj
}

function heartClipPath(w, h) {
  const cx = w / 2, cy = h / 2
  return `
    M ${cx} ${cy + h * 0.28}
    C ${cx} ${cy + h * 0.28} ${cx - w * 0.05} ${cy + h * 0.48} ${cx - w * 0.28} ${cy + h * 0.48}
    C ${cx - w * 0.5} ${cy + h * 0.48} ${cx - w * 0.5} ${cy + h * 0.18} ${cx - w * 0.5} ${cy + h * 0.18}
    C ${cx - w * 0.5} ${cy - h * 0.08} ${cx - w * 0.26} ${cy - h * 0.48} ${cx} ${cy - h * 0.18}
    C ${cx + w * 0.26} ${cy - h * 0.48} ${cx + w * 0.5} ${cy - h * 0.08} ${cx + w * 0.5} ${cy + h * 0.18}
    C ${cx + w * 0.5} ${cy + h * 0.18} ${cx + w * 0.5} ${cy + h * 0.48} ${cx + w * 0.28} ${cy + h * 0.48}
    C ${cx + w * 0.05} ${cy + h * 0.48} ${cx} ${cy + h * 0.28} ${cx} ${cy + h * 0.28}
    Z
  `
}

function starPoints2D(w, h) {
  const r = Math.min(w, h) / 2
  const cx = w / 2, cy = h / 2
  const inner = r * 0.42
  const pts = []
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2
    const radius = i % 2 === 0 ? r : inner
    pts.push({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius })
  }
  return pts
}

function buildImageInternalClip(clipShape, w, h) {
  switch (clipShape) {
    case 'circle':
      return new fabric.Circle({ radius: Math.min(w, h) / 2, left: 0, top: 0, absolutePositioned: true })
    case 'oval':
      return new fabric.Ellipse({ rx: w / 2, ry: h / 2, left: 0, top: 0, absolutePositioned: true })
    case 'rect':
      return new fabric.Rect({ width: w, height: h, left: 0, top: 0, absolutePositioned: true })
    case 'round':
      return new fabric.Rect({ width: w, height: h, rx: w * 0.12, ry: h * 0.12, left: 0, top: 0, absolutePositioned: true })
    case 'heart':
      return new fabric.Path(heartClipPath(w, h), { absolutePositioned: true, left: 0, top: 0 })
    case 'star':
      return new fabric.Polygon(starPoints2D(w, h), { absolutePositioned: true, left: 0, top: 0 })
    case 'diamond':
      return new fabric.Polygon([
        { x: w / 2, y: 0 }, { x: w, y: h / 2 }, { x: w / 2, y: h }, { x: 0, y: h / 2 }
      ], { absolutePositioned: true, left: 0, top: 0 })
    default:
      return null
  }
}

export function addImageToCanvas(canvas, url, clipShape, shape, canvasW, canvasH) {
  return new Promise((resolve) => {
    const zoneClip = buildClipPath(shape, canvasW, canvasH)
    const { zX, zY, zW, zH } = getZoneBounds(shape, canvasW, canvasH)

    fabric.Image.fromURL(url, (imgObj) => {
      const targetW = zW * 0.6
      const scale = targetW / imgObj.width
      imgObj.scale(scale)

      applyGrayscale(imgObj)

      imgObj.set({
        left: zX + zW / 2,
        top: zY + zH / 2,
        originX: 'center',
        originY: 'center',
        clipPath: zoneClip,
        selectable: true,
        lockScalingFlip: true,
      })

      // Apply internal shape clip
      if (clipShape && clipShape !== 'none') {
        const iW = imgObj.getScaledWidth()
        const iH = imgObj.getScaledHeight()
        const innerClip = buildImageInternalClip(clipShape, iW, iH)
        if (innerClip) {
          innerClip.absolutePositioned = false
          imgObj.clipPath = new fabric.Group([zoneClip, innerClip], { absolutePositioned: true })
        }
      }

      canvas.add(imgObj)
      canvas.setActiveObject(imgObj)
      canvas.renderAll()
      resolve(imgObj)
    }, { crossOrigin: 'anonymous' })
  })
}
