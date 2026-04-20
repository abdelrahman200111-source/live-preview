import { fabric } from 'fabric'

// Zone definitions as % of canvas size (centered)
export const SHAPE_DEFS = {
  circle:     { type: 'circle',   wPct: 0.58, hPct: 0.58 },
  'rect-sharp': { type: 'rect',   wPct: 0.62, hPct: 0.44, rx: 0, ry: 0 },
  'rect-round': { type: 'rect',   wPct: 0.62, hPct: 0.44, rx: 16, ry: 16 },
  'rect-oct':   { type: 'polygon', wPct: 0.60, hPct: 0.50, sides: 8 },
  square:       { type: 'rect',   wPct: 0.52, hPct: 0.52, rx: 0, ry: 0 },
  'oval-v':     { type: 'ellipse', wPct: 0.42, hPct: 0.62 },
  'oval-h':     { type: 'ellipse', wPct: 0.62, hPct: 0.40 },
  heart:        { type: 'heart',   wPct: 0.58, hPct: 0.52 },
  star:         { type: 'star',    wPct: 0.56, hPct: 0.56 },
}

export function getZoneBounds(shape, canvasW, canvasH) {
  const def = SHAPE_DEFS[shape] || SHAPE_DEFS.circle
  const zW = canvasW * def.wPct
  const zH = canvasH * def.hPct
  const zX = (canvasW - zW) / 2
  const zY = (canvasH - zH) / 2
  return { zX, zY, zW, zH, def }
}

function octagonPoints(cx, cy, w, h) {
  const cut = Math.min(w, h) * 0.15
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
  // SVG path for a heart, scaled to w×h
  const path = `
    M ${cx} ${cy + h * 0.28}
    C ${cx} ${cy + h * 0.28} ${cx - w * 0.05} ${cy + h * 0.48} ${cx - w * 0.28} ${cy + h * 0.48}
    C ${cx - w * 0.5} ${cy + h * 0.48} ${cx - w * 0.5} ${cy + h * 0.18} ${cx - w * 0.5} ${cy + h * 0.18}
    C ${cx - w * 0.5} ${cy - h * 0.08} ${cx - w * 0.26} ${cy - h * 0.48} ${cx} ${cy - h * 0.18}
    C ${cx + w * 0.26} ${cy - h * 0.48} ${cx + w * 0.5} ${cy - h * 0.08} ${cx + w * 0.5} ${cy + h * 0.18}
    C ${cx + w * 0.5} ${cy + h * 0.18} ${cx + w * 0.5} ${cy + h * 0.48} ${cx + w * 0.28} ${cy + h * 0.48}
    C ${cx + w * 0.05} ${cy + h * 0.48} ${cx} ${cy + h * 0.28} ${cx} ${cy + h * 0.28}
    Z
  `
  return path
}

function starPoints(cx, cy, r) {
  const pts = []
  const inner = r * 0.42
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2
    const radius = i % 2 === 0 ? r : inner
    pts.push({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius })
  }
  return pts
}

export function buildClipPath(shape, canvasW, canvasH) {
  const { zX, zY, zW, zH, def } = getZoneBounds(shape, canvasW, canvasH)
  const cx = zX + zW / 2
  const cy = zY + zH / 2

  let clip

  switch (def.type) {
    case 'circle':
      clip = new fabric.Circle({
        radius: zW / 2,
        left: cx - zW / 2,
        top: cy - zH / 2,
        absolutePositioned: true,
      })
      break

    case 'ellipse':
      clip = new fabric.Ellipse({
        rx: zW / 2,
        ry: zH / 2,
        left: cx - zW / 2,
        top: cy - zH / 2,
        absolutePositioned: true,
      })
      break

    case 'polygon':
      clip = new fabric.Polygon(octagonPoints(cx, cy, zW, zH), {
        absolutePositioned: true,
      })
      break

    case 'heart': {
      const path = heartPath(cx, cy, zW, zH)
      clip = new fabric.Path(path, { absolutePositioned: true })
      break
    }

    case 'star': {
      const r = Math.min(zW, zH) / 2
      clip = new fabric.Polygon(starPoints(cx, cy, r), {
        absolutePositioned: true,
      })
      break
    }

    default: // rect
      clip = new fabric.Rect({
        left: zX,
        top: zY,
        width: zW,
        height: zH,
        rx: def.rx || 0,
        ry: def.ry || 0,
        absolutePositioned: true,
      })
  }

  return clip
}

export function buildZoneOutline(shape, canvasW, canvasH) {
  const { zX, zY, zW, zH, def } = getZoneBounds(shape, canvasW, canvasH)
  const cx = zX + zW / 2
  const cy = zY + zH / 2

  const style = {
    stroke: 'rgba(198,162,90,0.5)',
    strokeWidth: 1.5,
    strokeDashArray: [5, 4],
    fill: 'transparent',
    selectable: false,
    evented: false,
    excludeFromExport: true,
  }

  switch (def.type) {
    case 'circle':
      return new fabric.Circle({ ...style, radius: zW / 2, left: cx - zW / 2, top: cy - zH / 2 })
    case 'ellipse':
      return new fabric.Ellipse({ ...style, rx: zW / 2, ry: zH / 2, left: cx - zW / 2, top: cy - zH / 2 })
    case 'polygon':
      return new fabric.Polygon(octagonPoints(cx, cy, zW, zH), style)
    case 'heart': {
      const path = heartPath(cx, cy, zW, zH)
      return new fabric.Path(path, style)
    }
    case 'star': {
      const r = Math.min(zW, zH) / 2
      return new fabric.Polygon(starPoints(cx, cy, r), style)
    }
    default:
      return new fabric.Rect({ ...style, left: zX, top: zY, width: zW, height: zH, rx: def.rx || 0, ry: def.ry || 0 })
  }
}
