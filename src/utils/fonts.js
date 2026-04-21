export const FONTS = [
  // ── Serif / luxury ───────────────────────────────────────
  {
    id: 'playfair',
    label: 'Playfair',
    value: 'Playfair Display',
    preview: 'Playfair Display',
    sampleLatin: 'Ag',
    style: 'serif',
  },
  {
    id: 'cormorant',
    label: 'Cormorant',
    value: 'Cormorant Garamond',
    preview: 'Cormorant Garamond',
    sampleLatin: 'Ag',
    style: 'serif',
  },
  {
    id: 'cinzel',
    label: 'Cinzel',
    value: 'Cinzel',
    preview: 'Cinzel',
    sampleLatin: 'Ag',
    style: 'serif',
  },
  // ── Script / romantic ────────────────────────────────────
  {
    id: 'greatvibes',
    label: 'Great Vibes',
    value: 'Great Vibes',
    preview: 'Great Vibes',
    sampleLatin: 'Ag',
    style: 'script',
  },
  {
    id: 'sacramento',
    label: 'Sacramento',
    value: 'Sacramento',
    preview: 'Sacramento',
    sampleLatin: 'Ag',
    style: 'script',
  },
  {
    id: 'dancing',
    label: 'Dancing',
    value: 'Dancing Script',
    preview: 'Dancing Script',
    sampleLatin: 'Ag',
    style: 'script',
  },
  {
    id: 'alexbrush',
    label: 'Alex Brush',
    value: 'Alex Brush',
    preview: 'Alex Brush',
    sampleLatin: 'Ag',
    style: 'script',
  },
  // ── Sans / modern ────────────────────────────────────────
  {
    id: 'montserrat',
    label: 'Montserrat',
    value: 'Montserrat',
    preview: 'Montserrat',
    sampleLatin: 'Ag',
    style: 'sans',
  },
  // ── Arabic / RTL ─────────────────────────────────────────
  {
    id: 'amiri',
    label: 'Amiri',
    value: 'Amiri',
    preview: 'Amiri',
    sampleArabic: 'نقش',
    style: 'arabic',
    rtl: true,
  },
  {
    id: 'cairo',
    label: 'Cairo',
    value: 'Cairo',
    preview: 'Cairo',
    sampleArabic: 'نقش',
    style: 'arabic',
    rtl: true,
  },
  {
    id: 'noto-arabic',
    label: 'Noto Arabic',
    value: 'Noto Naskh Arabic',
    preview: 'Noto Naskh Arabic',
    sampleArabic: 'نقش',
    style: 'arabic',
    rtl: true,
  },
]

export const DEFAULT_FONT = FONTS[0].value

export function isRTLText(text) {
  return /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/.test(text)
}

// Measure text width in px using an off-screen canvas2d context
const _measureCtx = typeof document !== 'undefined'
  ? document.createElement('canvas').getContext('2d')
  : null

export function measureTextWidth(text, fontFamily, fontSize) {
  if (!_measureCtx || !text) return 0
  _measureCtx.font = `${fontSize}px "${fontFamily}"`
  return _measureCtx.measureText(text).width
}

export function autoFitFontSize(text, fontFamily, maxWidth, maxSize = 52) {
  if (!text?.trim()) return maxSize
  let size = maxSize
  while (size > 8 && measureTextWidth(text, fontFamily, size) > maxWidth) {
    size -= 1
  }
  return size
}
