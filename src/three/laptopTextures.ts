import * as THREE from 'three'

type Segment = { text: string; color: string }

function drawLines(ctx: CanvasRenderingContext2D, lines: Segment[][], startX: number, startY: number, lineHeight: number, font: string) {
  ctx.font = font
  ctx.textBaseline = 'top'
  let y = startY
  lines.forEach((segments) => {
    let x = startX
    segments.forEach((seg) => {
      ctx.fillStyle = seg.color
      ctx.fillText(seg.text, x, y)
      x += ctx.measureText(seg.text).width
    })
    y += lineHeight
  })
}

export function makeCodeTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1280
  canvas.height = 800
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#08090B'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const comment = '#6b7280'
  const keyword = '#e0464d'
  const text = '#e7e7e5'
  const str = '#8fd19e'
  const bool = '#6fb8ff'

  const lines: Segment[][] = [
    [{ text: '// authentic-dev/product.ts', color: comment }],
    [],
    [{ text: 'const', color: keyword }, { text: ' product = {', color: text }],
    [{ text: '  interface: ', color: text }, { text: '"modern"', color: str }, { text: ',', color: text }],
    [{ text: '  experience: ', color: text }, { text: '"fast"', color: str }, { text: ',', color: text }],
    [{ text: '  scalable: ', color: text }, { text: 'true', color: bool }, { text: ',', color: text }],
    [{ text: '}', color: text }],
    [],
    [{ text: 'export function', color: keyword }, { text: ' launch(product) {', color: text }],
    [{ text: '  return', color: keyword }, { text: ' build(product)', color: text }],
    [{ text: '    .then(deploy)', color: text }],
    [{ text: '    .then(grow)', color: text }],
    [{ text: '}', color: text }],
  ]

  drawLines(ctx, lines, 44, 40, 46, '30px "Fira Code", "Courier New", monospace')

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  return tex
}

export function makeWebsiteTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1280
  canvas.height = 800
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#08090B'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Nav bar
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, 90)
  ctx.lineTo(canvas.width, 90)
  ctx.stroke()

  ctx.fillStyle = '#F5F5F2'
  ctx.font = 'bold 30px Arial'
  ctx.textBaseline = 'middle'
  ctx.fillText('AUTHENTIC DEV', 44, 45)

  ctx.fillStyle = '#D71920'
  roundRect(ctx, canvas.width - 220, 22, 176, 46, 23)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 20px Arial'
  ctx.textAlign = 'center'
  ctx.fillText("LET'S TALK", canvas.width - 132, 46)
  ctx.textAlign = 'left'

  // Hero headline blocks
  ctx.fillStyle = 'rgba(245,245,242,0.9)'
  roundRect(ctx, 44, 170, 620, 46, 8)
  ctx.fill()
  ctx.fillStyle = '#D71920'
  roundRect(ctx, 44, 232, 440, 46, 8)
  ctx.fill()

  ctx.fillStyle = 'rgba(245,245,242,0.35)'
  roundRect(ctx, 44, 310, 500, 22, 6)
  ctx.fill()
  roundRect(ctx, 44, 342, 380, 22, 6)
  ctx.fill()

  // Cards
  const cardY = 420
  const cardW = 360
  const cardH = 260
  const gap = 40
  for (let i = 0; i < 3; i++) {
    const x = 44 + i * (cardW + gap)
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 2
    roundRect(ctx, x, cardY, cardW, cardH, 14)
    ctx.stroke()
    ctx.fillStyle = i === 1 ? 'rgba(215,25,32,0.14)' : 'rgba(255,255,255,0.04)'
    roundRect(ctx, x, cardY, cardW, cardH, 14)
    ctx.fill()
    ctx.fillStyle = 'rgba(245,245,242,0.7)'
    roundRect(ctx, x + 28, cardY + 30, 140, 18, 4)
    ctx.fill()
    ctx.fillStyle = 'rgba(245,245,242,0.3)'
    roundRect(ctx, x + 28, cardY + 64, cardW - 56, 12, 3)
    ctx.fill()
    roundRect(ctx, x + 28, cardY + 86, cardW - 100, 12, 3)
    ctx.fill()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  return tex
}

/** Backlit mechanical keys: beveled highlight, dark well, and a faint warm glow. */
export function makeKeyboardTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1100
  canvas.height = 440
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const cols = 14
  const rows = 4
  const pad = 9
  const cellW = canvas.width / cols
  const cellH = canvas.height / rows

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellW + pad / 2
      const y = r * cellH + pad / 2
      const w = cellW - pad
      const h = cellH - pad

      // soft under-glow
      const glow = ctx.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, w * 0.9)
      glow.addColorStop(0, 'rgba(215,25,32,0.16)')
      glow.addColorStop(1, 'rgba(215,25,32,0)')
      ctx.fillStyle = glow
      roundRect(ctx, x - w * 0.3, y - h * 0.3, w * 1.6, h * 1.6, 10)
      ctx.fill()

      // key well
      ctx.fillStyle = 'rgba(8,9,11,0.85)'
      roundRect(ctx, x, y, w, h, 5)
      ctx.fill()

      // beveled top highlight
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      roundRect(ctx, x + 1.5, y + 1.5, w - 3, h * 0.35, 4)
      ctx.fill()
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  return tex
}

/** Fine horizontal streaking for a brushed-aluminum roughness variation. */
export function makeBrushedMetalTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < 2200; i++) {
    const y = Math.random() * canvas.height
    const shade = 120 + Math.random() * 80
    ctx.strokeStyle = `rgba(${shade},${shade},${shade},${0.05 + Math.random() * 0.08})`
    ctx.lineWidth = 0.6 + Math.random() * 0.8
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvas.width, y + (Math.random() - 0.5) * 6)
    ctx.stroke()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2, 2)
  tex.needsUpdate = true
  return tex
}

/** Soft diagonal glass highlight to overlay on the display for a glare effect. */
export function makeGlareTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 640
  canvas.height = 400
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height * 0.6)
  grad.addColorStop(0, 'rgba(255,255,255,0.22)')
  grad.addColorStop(0.35, 'rgba(255,255,255,0.05)')
  grad.addColorStop(0.55, 'rgba(255,255,255,0)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
