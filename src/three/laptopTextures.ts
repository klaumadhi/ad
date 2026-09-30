import * as THREE from 'three'

type Ctx = CanvasRenderingContext2D

const INK = '#0c1033'
const ACCENT = '#5b4cff'
const SKY = '#17b3f2'
const LILAC = '#b58bff'
const ROSE = '#ff8fb8'

function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  return { canvas, ctx: canvas.getContext('2d')! }
}

function toTexture(canvas: HTMLCanvasElement, srgb = true) {
  const tex = new THREE.CanvasTexture(canvas)
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.needsUpdate = true
  return tex
}

/** Draws once now, then again when web fonts / images finish loading so text is never a fallback face. */
function redrawWhenReady(tex: THREE.CanvasTexture, draw: () => void, extra: Promise<unknown>[] = []) {
  draw()
  if (typeof document === 'undefined') return
  const fonts = [
    document.fonts.load('600 60px Sora'),
    document.fonts.load('500 30px Inter'),
    document.fonts.load('500 30px "JetBrains Mono"'),
  ]
  Promise.allSettled([...fonts, ...extra]).then(() => {
    draw()
    tex.needsUpdate = true
  })
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image()
    img.onload = () => res(img)
    img.onerror = rej
    img.src = src
  })
}

function coverDraw(ctx: Ctx, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const s = Math.max(w / img.width, h / img.height)
  const dw = img.width * s
  const dh = img.height * s
  ctx.drawImage(img, x + (w - dw) / 2, y, dw, dh) // anchor to the top like a real page screenshot
}

// ---------------------------------------------------------------------------------------------
// Screen: code editor
// ---------------------------------------------------------------------------------------------

type Seg = [string, string]

export function makeCodeTexture() {
  const W = 2048
  const H = 1280
  const { canvas, ctx } = makeCanvas(W, H)
  const tex = toTexture(canvas)

  const draw = () => {
    ctx.clearRect(0, 0, W, H)
    ctx.save()
    rr(ctx, 0, 0, W, H, 26)
    ctx.clip()

    ctx.fillStyle = '#0e1128'
    ctx.fillRect(0, 0, W, H)

    // Title bar
    ctx.fillStyle = '#0a0d22'
    ctx.fillRect(0, 0, W, 60)
    ;['#ff6b6b', '#ffd166', '#5ce0a0'].forEach((c, i) => {
      ctx.fillStyle = c
      ctx.beginPath()
      ctx.arc(40 + i * 34, 30, 9, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.font = '500 22px "JetBrains Mono", monospace'
    ctx.fillStyle = '#7f86b8'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('product.ts — authentic-dev', W / 2, 31)
    ctx.textAlign = 'left'

    // Activity bar
    ctx.fillStyle = '#0a0d22'
    ctx.fillRect(0, 60, 74, H - 60)
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = i === 0 ? '#c9ccff' : '#454b85'
      ctx.lineWidth = 3
      rr(ctx, 22, 100 + i * 78, 30, 30, 8)
      ctx.stroke()
    }
    ctx.fillStyle = ACCENT
    ctx.fillRect(0, 96, 4, 40)

    // Sidebar / file tree
    ctx.fillStyle = '#0c1026'
    ctx.fillRect(74, 60, 330, H - 60)
    ctx.font = '600 19px "JetBrains Mono", monospace'
    ctx.fillStyle = '#5c639c'
    ctx.fillText('EXPLORER', 106, 104)
    const tree: [string, number, boolean][] = [
      ['authentic-dev', 0, false],
      ['src', 1, false],
      ['sections', 2, false],
      ['Hero.tsx', 3, false],
      ['Work.tsx', 3, false],
      ['three', 2, false],
      ['LogoModel.tsx', 3, false],
      ['product.ts', 2, true],
      ['site.config.ts', 2, false],
      ['public', 1, false],
      ['package.json', 1, false],
    ]
    ctx.font = '500 24px "JetBrains Mono", monospace'
    tree.forEach(([name, depth, active], i) => {
      const y = 160 + i * 46
      if (active) {
        ctx.fillStyle = 'rgba(110,96,255,0.22)'
        ctx.fillRect(74, y - 24, 330, 44)
      }
      ctx.fillStyle = active ? '#ffffff' : depth === 0 || !name.includes('.') ? '#9aa1d6' : '#6f77b0'
      ctx.fillText((name.includes('.') ? '' : '▾ ') + name, 106 + depth * 26, y)
    })

    // Tabs
    const ex = 404
    ctx.fillStyle = '#0a0d22'
    ctx.fillRect(ex, 60, W - ex, 62)
    ctx.fillStyle = '#0e1128'
    ctx.fillRect(ex, 60, 250, 62)
    ctx.fillStyle = ACCENT
    ctx.fillRect(ex, 60, 250, 4)
    ctx.font = '500 23px "JetBrains Mono", monospace'
    ctx.fillStyle = '#e9ebff'
    ctx.fillText('product.ts', ex + 26, 98)
    ctx.fillStyle = '#5c639c'
    ctx.fillText('site.config.ts', ex + 282, 98)

    // Code
    const kw = '#b9a7ff'
    const str = '#7ee2b8'
    const fn = '#6fd3ff'
    const num = '#ffb86b'
    const txt = '#d6dafc'
    const cm = '#586092'
    const lines: Seg[][] = [
      [['// authentic-dev/product.ts', cm]],
      [['import', kw], [' { build, deploy, grow } ', txt], ['from', kw], [" '@authentic/core'", str]],
      [],
      [['const', kw], [' product', fn], [' = {', txt]],
      [['  interface', txt], [': ', txt], ["'modern'", str], [',', txt]],
      [['  experience', txt], [': ', txt], ["'fast'", str], [',', txt]],
      [['  scalable', txt], [': ', txt], ['true', num], [',', txt]],
      [['}', txt]],
      [],
      [['export async function', kw], [' launch', fn], ['() {', txt]],
      [['  const', kw], [' site', fn], [' = ', txt], ['await', kw], [' build', fn], ['(product)', txt]],
      [['  await', kw], [' deploy', fn], ['(site, { region: ', txt], ["'eu'", str], [' })', txt]],
      [['  return', kw], [' grow', fn], ['(site)', txt]],
      [['}', txt]],
    ]
    ctx.font = '500 36px "JetBrains Mono", monospace'
    const lh = 56
    const cx = ex + 110
    const cy0 = 190
    // active line band
    ctx.fillStyle = 'rgba(110,96,255,0.10)'
    ctx.fillRect(ex, cy0 + lh * 10 - 34, W - ex - 190, lh)
    lines.forEach((segs, i) => {
      const y = cy0 + i * lh
      ctx.fillStyle = i === 10 ? '#aab0e8' : '#454b85'
      ctx.textAlign = 'right'
      ctx.fillText(String(i + 1), ex + 78, y)
      ctx.textAlign = 'left'
      let x = cx
      segs.forEach(([t, c]) => {
        ctx.fillStyle = c
        ctx.fillText(t, x, y)
        x += ctx.measureText(t).width
      })
      if (i === 10) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(x + 4, y - 30, 4, 42)
      }
    })

    // indent guides
    ctx.strokeStyle = 'rgba(140,150,220,0.16)'
    ctx.lineWidth = 2
    ;[[4, 7], [10, 13]].forEach(([a, b]) => {
      ctx.beginPath()
      ctx.moveTo(cx + 10, cy0 + lh * (a - 1) - 6)
      ctx.lineTo(cx + 10, cy0 + lh * b - 40)
      ctx.stroke()
    })

    // Minimap
    const mx = W - 170
    ctx.fillStyle = '#0c1026'
    ctx.fillRect(mx, 122, 170, H - 122 - 44)
    lines.forEach((segs, i) => {
      let x = mx + 22
      segs.forEach(([t, c]) => {
        const w = t.length * 4.6
        ctx.fillStyle = c
        ctx.globalAlpha = 0.55
        ctx.fillRect(x, 150 + i * 14, w, 6)
        ctx.globalAlpha = 1
        x += w
      })
    })

    // Terminal strip
    ctx.fillStyle = '#0a0d22'
    ctx.fillRect(ex, H - 300, W - ex, 256)
    ctx.font = '500 26px "JetBrains Mono", monospace'
    ctx.fillStyle = '#5c639c'
    ctx.fillText('TERMINAL', ex + 30, H - 262)
    ctx.fillStyle = '#7ee2b8'
    ctx.fillText('$ npm run build', ex + 30, H - 210)
    ctx.fillStyle = '#9aa1d6'
    ctx.fillText('✓ compiled successfully', ex + 30, H - 166)
    ctx.fillStyle = '#6fd3ff'
    ctx.fillText('✓ deployed — ready for customers', ex + 30, H - 122)

    // Status bar
    const sg = ctx.createLinearGradient(0, 0, W, 0)
    sg.addColorStop(0, ACCENT)
    sg.addColorStop(1, SKY)
    ctx.fillStyle = sg
    ctx.fillRect(0, H - 44, W, 44)
    ctx.font = '500 21px "JetBrains Mono", monospace'
    ctx.fillStyle = '#ffffff'
    ctx.fillText('⎇ main     TypeScript     UTF-8     Ln 11, Col 34', 30, H - 21)
    ctx.restore()
  }

  redrawWhenReady(tex, draw)
  return tex
}

// ---------------------------------------------------------------------------------------------
// Screen: the finished website (matches the real site)
// ---------------------------------------------------------------------------------------------

export function makeWebsiteTexture() {
  const W = 2048
  const H = 1280
  const { canvas, ctx } = makeCanvas(W, H)
  const tex = toTexture(canvas)
  const imgs: Record<string, HTMLImageElement | undefined> = {}
  const sources = {
    logo: '/images/logo-mark-transparent.png',
    a: '/images/projects/servis-kristi.jpg',
    b: '/images/projects/lavafast.jpg',
    c: '/images/projects/kokomani-auto.jpg',
  }
  const loads = Object.entries(sources).map(([k, src]) =>
    loadImage(src).then((im) => {
      imgs[k] = im
    }),
  )

  const glow = (x: number, y: number, r: number, c: string) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, c)
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
  }

  const draw = () => {
    ctx.clearRect(0, 0, W, H)
    ctx.save()
    rr(ctx, 0, 0, W, H, 26)
    ctx.clip()

    ctx.fillStyle = '#f4f6fc'
    ctx.fillRect(0, 0, W, H)
    glow(260, 160, 820, 'rgba(110,96,255,0.42)')
    glow(1780, 420, 760, 'rgba(34,190,250,0.38)')
    glow(900, 1240, 820, 'rgba(255,143,184,0.36)')

    // Nav pill
    ctx.save()
    ctx.shadowColor = 'rgba(70,60,200,0.22)'
    ctx.shadowBlur = 40
    ctx.shadowOffsetY = 14
    ctx.fillStyle = 'rgba(255,255,255,0.82)'
    rr(ctx, 64, 40, W - 128, 96, 48)
    ctx.fill()
    ctx.restore()
    if (imgs.logo) ctx.drawImage(imgs.logo, 104, 58, 98, 60)
    ctx.textBaseline = 'middle'
    ctx.font = '600 32px Sora, Inter, sans-serif'
    ctx.fillStyle = INK
    ctx.fillText('AUTHENTIC', 222, 90)
    const aw = ctx.measureText('AUTHENTIC ').width
    ctx.fillStyle = ACCENT
    ctx.fillText('DEV', 222 + aw, 90)
    ctx.font = '500 28px Inter, sans-serif'
    ctx.fillStyle = 'rgba(12,16,51,0.62)'
    ;['Work', 'Services', 'About', 'Process', 'Contact'].forEach((l, i) => ctx.fillText(l, 700 + i * 150, 90))
    ctx.fillStyle = INK
    rr(ctx, W - 372, 58, 236, 60, 30)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = '600 26px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText("Let's Talk  →", W - 254, 89)
    ctx.textAlign = 'left'

    // Headline
    ctx.font = '600 128px Sora, Inter, sans-serif'
    ctx.fillStyle = INK
    ctx.fillText('We Build', 110, 330)
    const wb = ctx.measureText('We Build ').width
    ctx.fillStyle = 'rgba(12,16,51,0.28)'
    ctx.fillText('Digital', 110 + wb, 330)
    const hg = ctx.createLinearGradient(110, 0, 900, 0)
    hg.addColorStop(0, ACCENT)
    hg.addColorStop(1, SKY)
    ctx.fillStyle = hg
    ctx.fillText('Experiences.', 110, 470)

    ctx.font = '400 34px Inter, sans-serif'
    ctx.fillStyle = 'rgba(12,16,51,0.78)'
    ctx.fillText('Websites and web applications, built', 114, 574)
    ctx.fillText('around real businesses.', 114, 622)

    ctx.fillStyle = INK
    ctx.shadowColor = 'rgba(12,16,51,0.4)'
    ctx.shadowBlur = 30
    ctx.shadowOffsetY = 12
    rr(ctx, 110, 690, 330, 84, 42)
    ctx.fill()
    ctx.shadowColor = 'transparent'
    ctx.fillStyle = '#fff'
    ctx.font = '600 28px Inter, sans-serif'
    ctx.fillText('Explore Our Work  →', 148, 733)
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    rr(ctx, 466, 690, 360, 84, 42)
    ctx.fill()
    ctx.strokeStyle = 'rgba(12,16,51,0.14)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = INK
    ctx.fillText("Let's Build Something", 500, 733)

    // Project frames on the right (real screenshots)
    const frames: [string, number, number, number][] = [
      ['c', 1130, 250, -4],
      ['b', 1240, 470, 3],
      ['a', 1080, 660, -2],
    ]
    frames.forEach(([key, x, y, deg]) => {
      const fw = 620
      const fh = 380
      ctx.save()
      ctx.translate(x + fw / 2, y + fh / 2)
      ctx.rotate((deg * Math.PI) / 180)
      ctx.translate(-fw / 2, -fh / 2)
      ctx.shadowColor = 'rgba(70,60,200,0.32)'
      ctx.shadowBlur = 46
      ctx.shadowOffsetY = 22
      ctx.fillStyle = '#ffffff'
      rr(ctx, 0, 0, fw, fh, 26)
      ctx.fill()
      ctx.shadowColor = 'transparent'
      ;['#ff7a7a', '#ffd26b', '#5ce0a0'].forEach((c, i) => {
        ctx.fillStyle = c
        ctx.beginPath()
        ctx.arc(30 + i * 24, 28, 7, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.save()
      rr(ctx, 12, 54, fw - 24, fh - 66, 16)
      ctx.clip()
      const im = imgs[key]
      if (im) coverDraw(ctx, im, 12, 54, fw - 24, fh - 66)
      else {
        ctx.fillStyle = '#e6eaf8'
        ctx.fillRect(12, 54, fw - 24, fh - 66)
      }
      ctx.restore()
      ctx.restore()
    })

    // Service ribbon
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.fillRect(0, H - 118, W, 118)
    ctx.fillStyle = 'rgba(12,16,51,0.08)'
    ctx.fillRect(0, H - 118, W, 2)
    ctx.font = '500 34px Sora, Inter, sans-serif'
    ctx.fillStyle = 'rgba(12,16,51,0.55)'
    const items = ['Web Development', 'Web Applications', 'E-Commerce', 'Business Systems', 'UI / UX Design']
    let x = 90
    items.forEach((it) => {
      ctx.fillStyle = 'rgba(12,16,51,0.55)'
      ctx.fillText(it, x, H - 58)
      x += ctx.measureText(it).width + 46
      ctx.fillStyle = ACCENT
      ctx.save()
      ctx.translate(x - 22, H - 58)
      ctx.rotate(Math.PI / 4)
      ctx.fillRect(-7, -7, 14, 14)
      ctx.restore()
      x += 24
    })
    ctx.restore()
  }

  redrawWhenReady(tex, draw, loads)
  return tex
}

// ---------------------------------------------------------------------------------------------
// Physical bits
// ---------------------------------------------------------------------------------------------

/** Soft under-key glow — the keycaps themselves are real geometry. */
export function makeKeyboardTexture() {
  const { canvas, ctx } = makeCanvas(1024, 512)
  const g = ctx.createRadialGradient(512, 256, 20, 512, 256, 520)
  g.addColorStop(0, 'rgba(120,108,255,0.5)')
  g.addColorStop(0.6, 'rgba(120,108,255,0.14)')
  g.addColorStop(1, 'rgba(120,108,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 1024, 512)
  return toTexture(canvas)
}

/** Fine horizontal streaking for a brushed-aluminium roughness variation. */
export function makeBrushedMetalTexture() {
  const { canvas, ctx } = makeCanvas(512, 512)
  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 2600; i++) {
    const y = Math.random() * 512
    const shade = 110 + Math.random() * 90
    ctx.strokeStyle = `rgba(${shade},${shade},${shade},${0.05 + Math.random() * 0.08})`
    ctx.lineWidth = 0.6 + Math.random() * 0.8
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(512, y + (Math.random() - 0.5) * 6)
    ctx.stroke()
  }
  const tex = toTexture(canvas, false)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2, 2)
  return tex
}

/** Perforated speaker grille strip. */
export function makeSpeakerTexture() {
  const { canvas, ctx } = makeCanvas(128, 768)
  ctx.clearRect(0, 0, 128, 768)
  ctx.fillStyle = 'rgba(20,24,40,0.85)'
  for (let y = 10; y < 768; y += 16) {
    for (let x = ((y / 16) % 2) * 8 + 8; x < 128; x += 16) {
      ctx.beginPath()
      ctx.arc(x, y, 3.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  return toTexture(canvas)
}

/** Soft diagonal glass highlight overlaid on the display. */
export function makeGlareTexture() {
  const { canvas, ctx } = makeCanvas(640, 400)
  const grad = ctx.createLinearGradient(0, 0, 640, 240)
  grad.addColorStop(0, 'rgba(255,255,255,0.26)')
  grad.addColorStop(0.32, 'rgba(255,255,255,0.06)')
  grad.addColorStop(0.5, 'rgba(255,255,255,0)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 640, 400)
  return toTexture(canvas, false)
}

// ---------------------------------------------------------------------------------------------
// Floating glass layers
// ---------------------------------------------------------------------------------------------

export type HoloKind = 'structure' | 'interface' | 'data' | 'logic'

const LAYER_TITLES: Record<HoloKind, string> = {
  structure: '01 · STRUCTURE',
  interface: '02 · INTERFACE',
  data: '03 · DATA',
  logic: '04 · LOGIC',
}

export function makeHoloTexture(kind: HoloKind) {
  const W = 2048
  const H = 1220
  const { canvas, ctx } = makeCanvas(W, H)
  const tex = toTexture(canvas)

  const grad = (x0: number, y0: number, x1: number, y1: number, a = ACCENT, b = SKY) => {
    const g = ctx.createLinearGradient(x0, y0, x1, y1)
    g.addColorStop(0, a)
    g.addColorStop(1, b)
    return g
  }

  const draw = () => {
    ctx.clearRect(0, 0, W, H)
    const strong = kind === 'interface'

    // Glass panel
    ctx.save()
    ctx.shadowColor = 'rgba(70,60,200,0.35)'
    ctx.shadowBlur = 60
    ctx.shadowOffsetY = 26
    ctx.fillStyle = strong ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.68)'
    rr(ctx, 40, 40, W - 80, H - 80, 44)
    ctx.fill()
    ctx.restore()
    ctx.lineWidth = 4
    ctx.strokeStyle = grad(0, 0, W, H)
    rr(ctx, 40, 40, W - 80, H - 80, 44)
    ctx.stroke()

    // Header strip
    ctx.font = '600 30px "JetBrains Mono", monospace'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = ACCENT
    ctx.fillText(LAYER_TITLES[kind], 96, 100)
    ;['#ff7a7a', '#ffd26b', '#5ce0a0'].forEach((c, i) => {
      ctx.fillStyle = c
      ctx.beginPath()
      ctx.arc(W - 170 + i * 36, 100, 9, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.strokeStyle = 'rgba(12,16,51,0.08)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(72, 146)
    ctx.lineTo(W - 72, 146)
    ctx.stroke()

    // Faint dot grid
    ctx.fillStyle = 'rgba(12,16,51,0.07)'
    for (let y = 176; y < H - 80; y += 44) for (let x = 84; x < W - 80; x += 44) ctx.fillRect(x, y, 3, 3)

    const px = 96
    const py = 190
    const cw = W - 192
    const ch = H - 190 - 96

    if (kind === 'structure') {
      // Twelve-column grid
      ctx.strokeStyle = 'rgba(91,76,255,0.14)'
      ctx.lineWidth = 2
      for (let i = 0; i <= 12; i++) {
        const x = px + (cw / 12) * i
        ctx.beginPath()
        ctx.moveTo(x, py)
        ctx.lineTo(x, py + ch)
        ctx.stroke()
      }
      const block = (x: number, y: number, w: number, h: number, label: string, cross = false) => {
        ctx.setLineDash([16, 12])
        ctx.strokeStyle = 'rgba(23,32,110,0.7)'
        ctx.lineWidth = 3
        rr(ctx, x, y, w, h, 14)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = 'rgba(91,76,255,0.06)'
        rr(ctx, x, y, w, h, 14)
        ctx.fill()
        if (cross) {
          ctx.strokeStyle = 'rgba(23,32,110,0.22)'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(x + 14, y + 14)
          ctx.lineTo(x + w - 14, y + h - 14)
          ctx.moveTo(x + w - 14, y + 14)
          ctx.lineTo(x + 14, y + h - 14)
          ctx.stroke()
        }
        ctx.font = '600 26px "JetBrains Mono", monospace'
        const tw = ctx.measureText(label).width + 30
        ctx.fillStyle = ACCENT
        rr(ctx, x + 18, y + 18, tw, 40, 10)
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.fillText(label, x + 33, y + 39)
      }
      block(px, py, cw, 110, 'NAV')
      block(px, py + 140, cw * 0.58, 400, 'HERO')
      block(px + cw * 0.62, py + 140, cw * 0.38, 400, 'MEDIA', true)
      block(px, py + 570, cw * 0.32, 300, 'CARD')
      block(px + cw * 0.34, py + 570, cw * 0.32, 300, 'CARD')
      block(px + cw * 0.68, py + 570, cw * 0.32, 300, 'CARD')
      // dimension arrows
      ctx.strokeStyle = SKY
      ctx.fillStyle = SKY
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(px, py - 24)
      ctx.lineTo(px + cw, py - 24)
      ctx.stroke()
      ;[px, px + cw].forEach((x, i) => {
        ctx.beginPath()
        ctx.moveTo(x, py - 24)
        ctx.lineTo(x + (i ? -16 : 16), py - 34)
        ctx.lineTo(x + (i ? -16 : 16), py - 14)
        ctx.closePath()
        ctx.fill()
      })
      ctx.font = '600 24px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#fff'
      rr(ctx, W / 2 - 74, py - 44, 148, 40, 10)
      ctx.fill()
      ctx.fillStyle = SKY
      ctx.fillText('1440 px', W / 2, py - 24)
      ctx.textAlign = 'left'
    }

    if (kind === 'interface') {
      // nav
      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      ctx.shadowColor = 'rgba(70,60,200,0.25)'
      ctx.shadowBlur = 24
      ctx.shadowOffsetY = 8
      rr(ctx, px, py, cw, 100, 50)
      ctx.fill()
      ctx.shadowColor = 'transparent'
      ctx.fillStyle = grad(px, 0, px + 100, 0)
      rr(ctx, px + 28, py + 26, 62, 48, 14)
      ctx.fill()
      ctx.fillStyle = 'rgba(12,16,51,0.75)'
      rr(ctx, px + 110, py + 40, 160, 20, 10)
      ctx.fill()
      ;[0, 1, 2, 3].forEach((i) => {
        ctx.fillStyle = 'rgba(12,16,51,0.25)'
        rr(ctx, px + 640 + i * 150, py + 42, 100, 16, 8)
        ctx.fill()
      })
      ctx.fillStyle = INK
      rr(ctx, px + cw - 250, py + 22, 216, 56, 28)
      ctx.fill()
      // hero copy
      ctx.fillStyle = INK
      rr(ctx, px, py + 160, 820, 70, 16)
      ctx.fill()
      ctx.fillStyle = grad(px, 0, px + 600, 0)
      rr(ctx, px, py + 250, 600, 70, 16)
      ctx.fill()
      ctx.fillStyle = 'rgba(12,16,51,0.3)'
      rr(ctx, px, py + 356, 700, 22, 11)
      ctx.fill()
      rr(ctx, px, py + 396, 520, 22, 11)
      ctx.fill()
      // buttons
      ctx.fillStyle = INK
      rr(ctx, px, py + 462, 280, 78, 39)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      rr(ctx, px + 306, py + 462, 300, 78, 39)
      ctx.fill()
      ctx.strokeStyle = 'rgba(12,16,51,0.16)'
      ctx.lineWidth = 3
      ctx.stroke()
      // hero visual
      ctx.fillStyle = grad(px + 1000, py + 160, px + 1660, py + 560, LILAC, SKY)
      rr(ctx, px + 1000, py + 160, 660, 380, 34)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.32)'
      ctx.beginPath()
      ctx.arc(px + 1330, py + 350, 96, 0, Math.PI * 2)
      ctx.fill()
      // cards
      const cardW = (cw - 80) / 3
      ;[ACCENT, SKY, ROSE].forEach((c, i) => {
        const x = px + i * (cardW + 40)
        ctx.fillStyle = 'rgba(255,255,255,0.96)'
        ctx.shadowColor = 'rgba(70,60,200,0.22)'
        ctx.shadowBlur = 30
        ctx.shadowOffsetY = 12
        rr(ctx, x, py + 600, cardW, 270, 30)
        ctx.fill()
        ctx.shadowColor = 'transparent'
        ctx.fillStyle = grad(x + 30, py + 630, x + 110, py + 700, c, LILAC)
        rr(ctx, x + 32, py + 632, 76, 76, 22)
        ctx.fill()
        ctx.fillStyle = 'rgba(12,16,51,0.8)'
        rr(ctx, x + 32, py + 742, 210, 22, 11)
        ctx.fill()
        ctx.fillStyle = 'rgba(12,16,51,0.22)'
        rr(ctx, x + 32, py + 786, cardW - 64, 14, 7)
        ctx.fill()
        rr(ctx, x + 32, py + 814, cardW - 130, 14, 7)
        ctx.fill()
      })
    }

    if (kind === 'data') {
      // area chart
      const cx = px
      const cy = py + 40
      const chw = cw * 0.62
      const chh = 520
      ctx.strokeStyle = 'rgba(12,16,51,0.1)'
      ctx.lineWidth = 2
      for (let i = 0; i <= 4; i++) {
        ctx.beginPath()
        ctx.moveTo(cx, cy + (chh / 4) * i)
        ctx.lineTo(cx + chw, cy + (chh / 4) * i)
        ctx.stroke()
      }
      const pts = [0.62, 0.5, 0.58, 0.36, 0.44, 0.24, 0.32, 0.12, 0.2, 0.06]
      const xy = pts.map((v, i) => [cx + (chw / (pts.length - 1)) * i, cy + chh * v] as [number, number])
      const path = () => {
        ctx.beginPath()
        ctx.moveTo(xy[0][0], xy[0][1])
        for (let i = 1; i < xy.length; i++) {
          const [x0, y0] = xy[i - 1]
          const [x1, y1] = xy[i]
          ctx.bezierCurveTo((x0 + x1) / 2, y0, (x0 + x1) / 2, y1, x1, y1)
        }
      }
      path()
      ctx.lineTo(cx + chw, cy + chh)
      ctx.lineTo(cx, cy + chh)
      ctx.closePath()
      const fg = ctx.createLinearGradient(0, cy, 0, cy + chh)
      fg.addColorStop(0, 'rgba(91,76,255,0.42)')
      fg.addColorStop(1, 'rgba(23,179,242,0.02)')
      ctx.fillStyle = fg
      ctx.fill()
      path()
      ctx.strokeStyle = grad(cx, 0, cx + chw, 0)
      ctx.lineWidth = 8
      ctx.lineCap = 'round'
      ctx.stroke()
      xy.forEach(([x, y], i) => {
        if (i % 3 === 0) {
          ctx.fillStyle = '#fff'
          ctx.beginPath()
          ctx.arc(x, y, 14, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = ACCENT
          ctx.lineWidth = 6
          ctx.stroke()
        }
      })
      // bars
      const bx = cx
      const by = cy + chh + 60
      for (let i = 0; i < 14; i++) {
        const h = 40 + ((i * 47) % 130)
        ctx.fillStyle = i % 4 === 0 ? ACCENT : 'rgba(91,76,255,0.28)'
        rr(ctx, bx + i * (chw / 14), by + 150 - h, chw / 14 - 14, h, 8)
        ctx.fill()
      }
      // donut + legend
      const dx = px + cw * 0.82
      const dy = py + 300
      const seg = [0.42, 0.28, 0.18, 0.12]
      const cols = [ACCENT, SKY, LILAC, ROSE]
      let a0 = -Math.PI / 2
      seg.forEach((s, i) => {
        ctx.beginPath()
        ctx.arc(dx, dy, 150, a0, a0 + s * Math.PI * 2 - 0.05)
        ctx.strokeStyle = cols[i]
        ctx.lineWidth = 44
        ctx.lineCap = 'butt'
        ctx.stroke()
        a0 += s * Math.PI * 2
      })
      ;['Traffic', 'Orders', 'Sessions', 'Leads'].forEach((l, i) => {
        ctx.fillStyle = cols[i]
        ctx.beginPath()
        ctx.arc(dx - 110, dy + 260 + i * 56, 11, 0, Math.PI * 2)
        ctx.fill()
        ctx.font = '500 32px Inter, sans-serif'
        ctx.fillStyle = 'rgba(12,16,51,0.7)'
        ctx.fillText(l, dx - 84, dy + 260 + i * 56)
      })
    }

    if (kind === 'logic') {
      ctx.font = '700 520px "JetBrains Mono", monospace'
      ctx.fillStyle = 'rgba(91,76,255,0.07)'
      ctx.textAlign = 'center'
      ctx.fillText('{ }', W / 2, H / 2 + 120)
      ctx.textAlign = 'left'
      const nodes: [string, number, number, string][] = [
        ['UI', 0.1, 0.26, ACCENT],
        ['Auth', 0.34, 0.14, LILAC],
        ['API', 0.4, 0.5, SKY],
        ['Cache', 0.66, 0.24, ROSE],
        ['Database', 0.68, 0.66, ACCENT],
        ['Queue', 0.9, 0.42, SKY],
      ]
      const P = (n: (typeof nodes)[number]) => [px + cw * n[1], py + ch * n[2]] as [number, number]
      const edges: [number, number][] = [[0, 1], [0, 2], [1, 2], [2, 3], [2, 4], [3, 5], [4, 5]]
      edges.forEach(([a, b]) => {
        const [x0, y0] = P(nodes[a])
        const [x1, y1] = P(nodes[b])
        ctx.beginPath()
        ctx.moveTo(x0 + 70, y0)
        ctx.bezierCurveTo((x0 + x1) / 2 + 60, y0, (x0 + x1) / 2 - 60, y1, x1 - 70, y1)
        ctx.strokeStyle = grad(x0, y0, x1, y1)
        ctx.lineWidth = 5
        ctx.stroke()
        ctx.fillStyle = SKY
        ctx.beginPath()
        ctx.arc((x0 + x1) / 2, (y0 + y1) / 2, 9, 0, Math.PI * 2)
        ctx.fill()
      })
      nodes.forEach((n) => {
        const [x, y] = P(n)
        ctx.save()
        ctx.shadowColor = 'rgba(70,60,200,0.3)'
        ctx.shadowBlur = 28
        ctx.shadowOffsetY = 10
        ctx.fillStyle = '#ffffff'
        rr(ctx, x - 96, y - 52, 192, 104, 28)
        ctx.fill()
        ctx.restore()
        ctx.strokeStyle = n[3]
        ctx.lineWidth = 5
        rr(ctx, x - 96, y - 52, 192, 104, 28)
        ctx.stroke()
        ctx.fillStyle = n[3]
        ctx.beginPath()
        ctx.arc(x - 60, y, 12, 0, Math.PI * 2)
        ctx.fill()
        ctx.font = '600 34px Sora, Inter, sans-serif'
        ctx.fillStyle = INK
        ctx.fillText(n[0], x - 34, y + 2)
      })
      // snippet
      ctx.font = '500 30px "JetBrains Mono", monospace'
      ;[
        ['await ', '#8a6cff', 'api.orders.create(cart)'],
        ['await ', '#8a6cff', 'db.inventory.update(sku)'],
      ].forEach(([k, c, t], i) => {
        ctx.fillStyle = c
        ctx.fillText(k, px, py + ch - 96 + i * 48)
        ctx.fillStyle = 'rgba(12,16,51,0.7)'
        ctx.fillText(t, px + ctx.measureText(k).width, py + ch - 96 + i * 48)
      })
    }
  }

  redrawWhenReady(tex, draw)
  return tex
}
