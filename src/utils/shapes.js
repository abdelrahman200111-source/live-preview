import { fabric } from 'fabric'

// Zone size as % of canvas. All zones are centered.
export const SHAPE_DEFS = {
  'circle':     { type: 'circle',  wPct: 0.58, hPct: 0.58 },
  'rect-sharp': { type: 'rect',    wPct: 0.64, hPct: 0.44, rx: 0 },
  'rect-round': { type: 'rect',    wPct: 0.64, hPct: 0.44, rx: 14 },
  'rect-oct':   { type: 'polygon', wPct: 0.60, hPct: 0.52 },
  'square':     { type: 'rect',    wPct: 0.52, hPct: 0.52, rx: 0 },
  'oval-v':     { type: 'ellipse', wPct: 0.42, hPct: 0.62 },
  'oval-h':     { type: 'ellipse', wPct: 0.64, hPct: 0.40 },
  'heart':      { type: 'heart',   wPct: 0.58, hPct: 0.52 },
  'star':       { type: 'star',    wPct: 0.54, hPct: 0.54 },
}

export function getZoneBounds(shape, canvasW, canvasH) {
  const def = SHAPE_DEFS[shape] ?? SHAPE_DEFS['circle']
  const zW = canvasW * def.wPct
  const zH = canvasH * def.hPct
  const zX = (canvasW - zW) / 2
  const zY = (canvasH - zH) / 2
  return { zX, zY, zW, zH, def, cx: zX + zW / 2, cy: zY + zH / 2 }
}

// ── Point generators ───────────────────────────────────────

function octPoints(cx, cy, w, h) {
  const cut = Math.min(w, h) * 0.14
  return [
    { x: cx - w / 2 + cut, y: cy - h / 2 },
    { x: cx + w / 2 - cut, y: cy - h / 2 },
    { x: cx + w / 2,       y: cy - h / 2 + cut },
    { x: cx + w / 2,       y: cy + h / 2 - cut },
    { x: cx + w / 2 - cut, y: cy + h / 2 },
    { x: cx - w / 2 + cut, y: cy + h / 2 },
    { x: cx - w / 2,       y: cy + h / 2 - cut },
    { x: cx - w / 2,       y: cy - h / 2 + cut },
  ]
}

function heartPath(cx, cy, w, h) {
  return [
    'M', cx, cy + h * 0.26,
    'C', cx, cy + h * 0.26, cx - w * 0.04, cy + h * 0.48, cx - w * 0.27, cy + h * 0.48,
    'C', cx - w * 0.50, cy + h * 0.48, cx - w * 0.50, cy + h * 0.18, cx - w * 0.50, cy + h * 0.18,
    'C', cx - w * 0.50, cy - h * 0.10, cx - w * 0.27, cy - h * 0.48, cx, cy - h * 0.16,
    'C', cx + w * 0.27, cy - h * 0.48, cx + w * 0.50, cy - h * 0.10, cx + w * 0.50, cy + h * 0.18,
    'C', cx + w * 0.50, cy + h * 0.18, cx + w * 0.50, cy + h * 0.48, cx + w * 0.27, cy + h * 0.48,
    'C', cx + w * 0.04, cy + h * 0.48, cx, cy + h * 0.26, cx, cy + h * 0.26,
    'Z',
  ].join(' ')
}

function starPoints(cx, cy, r) {
  const inner = r * 0.42
  return Array.from({ length: 10 }, (_, i) => {
    const angle = (Math.PI / 5) * i - Math.PI / 2
    const radius = i % 2 === 0 ? r : inner
    return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius }
  })
}

// ── Clip path (hard constraint on all user objects) ────────

export function buildClipPath(shape, canvasW, canvasH) {
  const { zX, zY, zW, zH, cx, cy, def } = getZoneBounds(shape, canvasW, canvasH)

  switch (def.type) {
    case 'circle':
      return new fabric.Circle({
        radius: zW / 2, left: cx - zW / 2, top: cy - zH / 2,
        absolutePositioned: true,
      })
    case 'ellipse':
      return new fabric.Ellipse({
        rx: zW / 2, ry: zH / 2, left: cx - zW / 2, top: cy - zH / 2,
        absolutePositioned: true,
      })
    case 'polygon':
      return new fabric.Polygon(octPoints(cx, cy, zW, zH), { absolutePositioned: true })
    case 'heart':
      return new fabric.Path(heartPath(cx, cy, zW, zH), { absolutePositioned: true })
    case 'star':
      return new fabric.Polygon(starPoints(cx, cy, Math.min(zW, zH) / 2), { absolutePositioned: true })
    default: // rect
      return new fabric.Rect({
        left: zX, top: zY, width: zW, height: zH,
        rx: def.rx ?? 0, ry: def.rx ?? 0,
        absolutePositioned: true,
      })
  }
}

// ── Zone outline (decorative dashed guide, not exported) ───

export function buildZoneOutline(shape, canvasW, canvasH) {
  const { zX, zY, zW, zH, cx, cy, def } = getZoneBounds(shape, canvasW, canvasH)

  const s = {
    stroke: 'rgba(198,162,90,0.55)',
    strokeWidth: 1.5,
    strokeDashArray: [6, 4],
    fill: 'transparent',
    selectable: false,
    evented: false,
    excludeFromExport: true,
    _isOutline: true,
  }

  switch (def.type) {
    case 'circle':
      return new fabric.Circle({ ...s, radius: zW / 2, left: cx - zW / 2, top: cy - zH / 2 })
    case 'ellipse':
      return new fabric.Ellipse({ ...s, rx: zW / 2, ry: zH / 2, left: cx - zW / 2, top: cy - zH / 2 })
    case 'polygon':
      return new fabric.Polygon(octPoints(cx, cy, zW, zH), s)
    case 'heart':
      return new fabric.Path(heartPath(cx, cy, zW, zH), s)
    case 'star':
      return new fabric.Polygon(starPoints(cx, cy, Math.min(zW, zH) / 2), s)
    default:
      return new fabric.Rect({ ...s, left: zX, top: zY, width: zW, height: zH, rx: def.rx ?? 0, ry: def.rx ?? 0 })
  }
}

// ── Cut-shape clip for uploaded images (relative to image) ─

function heartPathLocal(w, h) {
  const cx = 0, cy = 0
  return [
    'M', cx, cy + h * 0.26,
    'C', cx, cy + h * 0.26, cx - w * 0.04, cy + h * 0.48, cx - w * 0.27, cy + h * 0.48,
    'C', cx - w * 0.50, cy + h * 0.48, cx - w * 0.50, cy + h * 0.18, cx - w * 0.50, cy + h * 0.18,
    'C', cx - w * 0.50, cy - h * 0.10, cx - w * 0.27, cy - h * 0.48, cx, cy - h * 0.16,
    'C', cx + w * 0.27, cy - h * 0.48, cx + w * 0.50, cy - h * 0.10, cx + w * 0.50, cy + h * 0.18,
    'C', cx + w * 0.50, cy + h * 0.18, cx + w * 0.50, cy + h * 0.48, cx + w * 0.27, cy + h * 0.48,
    'C', cx + w * 0.04, cy + h * 0.48, cx, cy + h * 0.26, cx, cy + h * 0.26,
    'Z',
  ].join(' ')
}

export function buildImageCutClip(cutShape, imgW, imgH) {
  // These are in IMAGE-local coords (origin = image center, absolutePositioned false)
  const hw = imgW / 2, hh = imgH / 2
  const base = { absolutePositioned: false }

  switch (cutShape) {
    case 'circle':
      return new fabric.Circle({ ...base, radius: Math.min(hw, hh), originX: 'center', originY: 'center', left: 0, top: 0 })
    case 'oval-v':
      return new fabric.Ellipse({ ...base, rx: hw * 0.7, ry: hh, originX: 'center', originY: 'center', left: 0, top: 0 })
    case 'oval-h':
      return new fabric.Ellipse({ ...base, rx: hw, ry: hh * 0.7, originX: 'center', originY: 'center', left: 0, top: 0 })
    case 'rect-sharp':
      return new fabric.Rect({ ...base, width: imgW, height: imgH, originX: 'center', originY: 'center', left: 0, top: 0 })
    case 'rect-round':
      return new fabric.Rect({ ...base, width: imgW, height: imgH, rx: imgW * 0.12, ry: imgH * 0.12, originX: 'center', originY: 'center', left: 0, top: 0 })
    case 'rect-oct': {
      const cut = Math.min(imgW, imgH) * 0.14
      return new fabric.Polygon([
        { x: -hw + cut, y: -hh }, { x: hw - cut, y: -hh },
        { x: hw, y: -hh + cut }, { x: hw, y: hh - cut },
        { x: hw - cut, y: hh }, { x: -hw + cut, y: hh },
        { x: -hw, y: hh - cut }, { x: -hw, y: -hh + cut },
      ], { ...base, originX: 'center', originY: 'center', left: 0, top: 0 })
    }
    case 'square':
      return new fabric.Rect({ ...base, width: Math.min(imgW, imgH), height: Math.min(imgW, imgH), originX: 'center', originY: 'center', left: 0, top: 0 })
    case 'heart':
      return new fabric.Path(heartPathLocal(imgW, imgH), { ...base, originX: 'center', originY: 'center', left: 0, top: 0 })
    case 'star': {
      const r = Math.min(hw, hh)
      const inner = r * 0.42
      const pts = Array.from({ length: 10 }, (_, i) => {
        const angle = (Math.PI / 5) * i - Math.PI / 2
        const radius = i % 2 === 0 ? r : inner
        return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }
      })
      return new fabric.Polygon(pts, { ...base, originX: 'center', originY: 'center', left: 0, top: 0 })
    }
    default:
      return null
  }
}
