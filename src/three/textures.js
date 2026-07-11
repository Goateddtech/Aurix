// Procedurally drawn canvas textures: can label, marble, lemon wheel, glow sprites.
// No external assets needed — the label mirrors the product photography's
// copper-foil botanical line art on matte black.
import * as THREE from 'three'

const COPPER = '#C08552'
const COPPER_LIGHT = '#D4A373'
const COPPER_PALE = '#E2BA8C'

/* ---------- small drawing helpers ---------- */

function trackedText(ctx, text, cx, y, tracking) {
  const prevAlign = ctx.textAlign
  ctx.textAlign = 'center'
  let total = 0
  for (const ch of text) total += ctx.measureText(ch).width + tracking
  total -= tracking
  let x = cx - total / 2
  for (const ch of text) {
    const w = ctx.measureText(ch).width
    ctx.fillText(ch, x + w / 2, y)
    x += w + tracking
  }
  ctx.textAlign = prevAlign
}

function divider(ctx, cx, y, half) {
  ctx.save()
  ctx.strokeStyle = COPPER
  ctx.globalAlpha = 0.75
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx - half, y)
  ctx.lineTo(cx - 16, y)
  ctx.moveTo(cx + 16, y)
  ctx.lineTo(cx + half, y)
  ctx.stroke()
  ctx.fillStyle = COPPER
  ctx.beginPath()
  ctx.moveTo(cx, y - 7)
  ctx.lineTo(cx + 7, y)
  ctx.lineTo(cx, y + 7)
  ctx.lineTo(cx - 7, y)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function leaf(ctx, x, y, len, ang) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(ang)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.quadraticCurveTo(len * 0.5, -len * 0.32, len, 0)
  ctx.quadraticCurveTo(len * 0.5, len * 0.32, 0, 0)
  ctx.moveTo(len * 0.15, 0)
  ctx.lineTo(len * 0.85, 0)
  ctx.stroke()
  ctx.restore()
}

// Elderflower umbel: a stem branching into clusters of tiny florets.
function sprig(ctx, x, y, ang, len) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(ang)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.quadraticCurveTo(len * 0.25, -len * 0.35, len * 0.55, -len * 0.8)
  ctx.stroke()
  const tips = [
    [len * 0.55, -len * 0.8],
    [len * 0.34, -len * 0.52],
    [len * 0.16, -len * 0.26],
  ]
  tips.forEach(([tx, ty], k) => {
    const spread = 14 - k * 3
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      const fx = tx + Math.cos(a) * spread
      const fy = ty - 12 + Math.sin(a) * spread * 0.7
      ctx.beginPath()
      ctx.moveTo(tx, ty)
      ctx.lineTo(fx, fy)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(fx, fy, 3.2, 0, Math.PI * 2)
      ctx.stroke()
    }
  })
  leaf(ctx, len * 0.2, -len * 0.18, len * 0.28, 0.9)
  ctx.restore()
}

function citrusWheel(ctx, x, y, r) {
  ctx.save()
  ctx.translate(x, y)
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.84, 0, Math.PI * 2)
  ctx.stroke()
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2
    ctx.beginPath()
    ctx.moveTo(Math.cos(a) * r * 0.12, Math.sin(a) * r * 0.12)
    ctx.lineTo(Math.cos(a) * r * 0.78, Math.sin(a) * r * 0.78)
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.08, 0, Math.PI * 2)
  ctx.stroke()
  leaf(ctx, r * 0.7, -r * 0.85, r * 0.6, -0.5)
  leaf(ctx, r * 0.95, -r * 0.55, r * 0.45, -0.1)
  ctx.restore()
}

function pepper(ctx, x, y, s, ang) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(ang)
  ctx.scale(s, s)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.bezierCurveTo(38, -6, 78, 6, 104, 34)
  ctx.bezierCurveTo(112, 43, 108, 52, 98, 48)
  ctx.bezierCurveTo(72, 38, 34, 24, 2, 14)
  ctx.bezierCurveTo(-6, 11, -6, 2, 0, 0)
  ctx.stroke()
  // stem
  ctx.beginPath()
  ctx.moveTo(-2, 6)
  ctx.quadraticCurveTo(-16, 2, -22, -10)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-2, 2)
  ctx.quadraticCurveTo(-10, 8, -4, 12)
  ctx.stroke()
  ctx.restore()
}

/* ---------- textures ---------- */

export function createLabelTexture() {
  const W = 2048
  const H = 1024
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  const draw = () => {
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, '#131110')
    bg.addColorStop(0.5, '#0D0B0A')
    bg.addColorStop(1, '#0A0908')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    const cx = W / 2
    ctx.textBaseline = 'middle'

    // Wordmark
    const wm = ctx.createLinearGradient(0, 320, 0, 480)
    wm.addColorStop(0, COPPER_PALE)
    wm.addColorStop(1, '#B8865B')
    ctx.fillStyle = wm
    ctx.font = '600 205px "Cormorant Garamond", "Times New Roman", serif'
    trackedText(ctx, 'AURIX', cx, 396, 30)

    ctx.fillStyle = COPPER
    ctx.font = '500 33px Jost, "Segoe UI", sans-serif'
    trackedText(ctx, 'CONSIDERED INDULGENCE', cx, 516, 17)

    divider(ctx, cx, 574, 200)

    ctx.fillStyle = COPPER_LIGHT
    ctx.font = '500 42px Jost, "Segoe UI", sans-serif'
    trackedText(ctx, 'ELDERFLOWER · JALAPEÑO · CITRUS', cx, 642, 9)

    divider(ctx, cx, 702, 150)

    ctx.fillStyle = COPPER
    ctx.font = '500 33px Jost, "Segoe UI", sans-serif'
    trackedText(ctx, 'MARINE COLLAGEN + VITAMIN C', cx, 762, 13)

    // Botanical line art flanking the text block
    ctx.strokeStyle = COPPER
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.globalAlpha = 0.85
    sprig(ctx, 505, 700, -0.28, 200)
    sprig(ctx, 435, 560, 0.15, 150)
    citrusWheel(ctx, 1480, 745, 102)
    pepper(ctx, 545, 800, 1.05, 0.28)
    leaf(ctx, 1345, 585, 90, -0.85)
    leaf(ctx, 1400, 545, 70, -0.35)

    // Sparse wrap-around botanicals (back of can)
    ctx.globalAlpha = 0.4
    sprig(ctx, 180, 640, 0.2, 160)
    sprig(ctx, 1890, 690, -0.15, 170)
    leaf(ctx, 90, 780, 80, -0.4)
    leaf(ctx, 1975, 540, 75, 0.5)
    citrusWheel(ctx, 60, 480, 70)
    ctx.globalAlpha = 1
  }

  draw()
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8

  // Redraw once the display fonts are actually loaded.
  if (typeof document !== 'undefined' && document.fonts) {
    Promise.all([
      document.fonts.load('600 205px "Cormorant Garamond"'),
      document.fonts.load('500 42px Jost'),
    ])
      .then(() => {
        draw()
        tex.needsUpdate = true
      })
      .catch(() => {})
  }
  return tex
}

export function createMarbleTexture() {
  const S = 1024
  const canvas = document.createElement('canvas')
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#161312'
  ctx.fillRect(0, 0, S, S)

  // soft tonal blotches
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * S
    const y = Math.random() * S
    const r = 140 + Math.random() * 300
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    const dark = Math.random() > 0.5
    g.addColorStop(0, dark ? 'rgba(8,7,6,0.55)' : 'rgba(34,29,25,0.5)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, S, S)
  }

  // veins
  ctx.lineCap = 'round'
  for (let i = 0; i < 18; i++) {
    const copperVein = Math.random() > 0.72
    ctx.strokeStyle = copperVein
      ? `rgba(212,163,115,${0.08 + Math.random() * 0.09})`
      : `rgba(216,200,184,${0.03 + Math.random() * 0.07})`
    ctx.lineWidth = 0.8 + Math.random() * 1.8
    let x = Math.random() * S
    let y = -20
    ctx.beginPath()
    ctx.moveTo(x, y)
    while (y < S + 20) {
      const nx = x + (Math.random() - 0.5) * 190
      const ny = y + 60 + Math.random() * 130
      ctx.quadraticCurveTo(
        x + (Math.random() - 0.5) * 120,
        (y + ny) / 2,
        nx,
        ny
      )
      x = nx
      y = ny
    }
    ctx.stroke()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 8
  return tex
}

export function createLemonTexture() {
  const S = 512
  const canvas = document.createElement('canvas')
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext('2d')
  const c = S / 2

  // rind
  ctx.fillStyle = '#E2AF2D'
  ctx.beginPath()
  ctx.arc(c, c, 244, 0, Math.PI * 2)
  ctx.fill()
  // pith
  ctx.fillStyle = '#F6ECC4'
  ctx.beginPath()
  ctx.arc(c, c, 220, 0, Math.PI * 2)
  ctx.fill()
  // flesh
  const flesh = ctx.createRadialGradient(c, c, 20, c, c, 204)
  flesh.addColorStop(0, '#F6DA6E')
  flesh.addColorStop(1, '#E9B93A')
  ctx.fillStyle = flesh
  ctx.beginPath()
  ctx.arc(c, c, 204, 0, Math.PI * 2)
  ctx.fill()
  // segments
  ctx.strokeStyle = '#F6ECC4'
  ctx.lineWidth = 8
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(c + Math.cos(a) * 22, c + Math.sin(a) * 22)
    ctx.lineTo(c + Math.cos(a) * 198, c + Math.sin(a) * 198)
    ctx.stroke()
  }
  // subtle segment sheen
  ctx.fillStyle = 'rgba(255,255,255,0.10)'
  for (let i = 0; i < 9; i += 2) {
    const a0 = (i / 9) * Math.PI * 2 + 0.06
    const a1 = ((i + 1) / 9) * Math.PI * 2 - 0.06
    ctx.beginPath()
    ctx.moveTo(c, c)
    ctx.arc(c, c, 196, a0, a1)
    ctx.closePath()
    ctx.fill()
  }
  ctx.fillStyle = '#F6ECC4'
  ctx.beginPath()
  ctx.arc(c, c, 18, 0, Math.PI * 2)
  ctx.fill()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

// Vertical streak pattern for the pour stream's alphaMap (green channel).
// Mid-gray base keeps the stream translucent; brighter broken filaments
// scroll along it to read as moving water rather than a solid rod.
export function createStreamTexture() {
  const W = 128
  const H = 256
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'rgb(182,182,182)'
  ctx.fillRect(0, 0, W, H)
  // broken bright filaments — varying length so motion is visible
  for (let i = 0; i < 26; i++) {
    const x = Math.random() * W
    const w = 2 + Math.random() * 5
    let y = Math.random() * H
    while (y < H + 40) {
      const len = 18 + Math.random() * 60
      const a = 0.25 + Math.random() * 0.5
      const g = ctx.createLinearGradient(0, y, 0, y + len)
      g.addColorStop(0, 'rgba(255,255,255,0)')
      g.addColorStop(0.5, `rgba(255,255,255,${a.toFixed(2)})`)
      g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = g
      ctx.fillRect(x - w / 2, y, w, len)
      y += len + 20 + Math.random() * 70
    }
  }
  // a few darker gaps for sparkle contrast
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * W
    const y = Math.random() * H
    const g = ctx.createRadialGradient(x, y, 0, x, y, 10 + Math.random() * 16)
    g.addColorStop(0, 'rgba(60,60,60,0.55)')
    g.addColorStop(1, 'rgba(60,60,60,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, 26, 0, Math.PI * 2)
    ctx.fill()
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2, 1.2)
  return tex
}

// Soft radial glow used for bokeh sprites.
export function createGlowTexture() {
  const S = 128
  const canvas = document.createElement('canvas')
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2)
  g.addColorStop(0, 'rgba(255,228,185,1)')
  g.addColorStop(0.4, 'rgba(255,214,160,0.38)')
  g.addColorStop(1, 'rgba(255,200,140,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, S, S)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// Soft dark radial disc — cheap contact shadow.
export function createShadowTexture() {
  const S = 256
  const canvas = document.createElement('canvas')
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2)
  g.addColorStop(0, 'rgba(0,0,0,0.78)')
  g.addColorStop(0.55, 'rgba(0,0,0,0.35)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, S, S)
  return new THREE.CanvasTexture(canvas)
}
