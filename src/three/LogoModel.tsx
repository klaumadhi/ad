import { useMemo, useRef } from 'react'
import { useLoader, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SVGLoader, type SVGResult } from 'three/examples/jsm/loaders/SVGLoader.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// The logo artwork is 1054 × 738 px. Columns left of XCUT are the pixel cloud, the rest is the eagle head.
const ART_W = 1054
const ART_H = 738
const XCUT = 585
const FRONT_Z = 22.8 // just proud of the extrusion's front face (depth 36 + bevel 4, centred)

// Terminal grid the logo is typed out in (in artwork pixels).
const CELL_W = 15
const CELL_H = 26
const TEXT_SCALE = 3

const CODE_STREAM =
  "import { build, deploy } from '@authentic/core'; " +
  "const site = await build(product); " +
  "export async function launch() { " +
  "const res = await fetch('/api/orders'); " +
  "return res.json() } " +
  "if (stock < 3) { notify(item) } " +
  "else { deploy(site) } " +
  "export default function App() { " +
  "return <Shop items={catalog} /> } " +
  "const user = await auth.login(); " +
  "for (const o of orders) { ship(o) } "
const GLITCH_CHARS = '01{}[]<>/\\|=+*#$@%&;:~^'

/** Two transparent canvases aligned to the logo: its silhouette typed out in code, and a bright glitch variant. */
function makeCodeLayers(base: ImageData, w: number, h: number) {
  const make = () => {
    const c = document.createElement('canvas')
    c.width = w * TEXT_SCALE
    c.height = h * TEXT_SCALE
    return c
  }
  const codeCanvas = make()
  const glitchCanvas = make()
  const codeTex = new THREE.CanvasTexture(codeCanvas)
  const glitchTex = new THREE.CanvasTexture(glitchCanvas)
  ;[codeTex, glitchTex].forEach((t) => {
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 4
  })

  // Pre-compute which cells the logo covers and their colour, once.
  const cols = Math.ceil(w / CELL_W)
  const rows = Math.ceil(h / CELL_H)
  const cells: { r: number; c: number; rgb: [number, number, number] }[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let a = 0, rr = 0, gg = 0, bb = 0, n = 0
      for (let sy = 2; sy < CELL_H; sy += 5) {
        for (let sx = 1; sx < CELL_W; sx += 4) {
          const x = Math.min(w - 1, c * CELL_W + sx)
          const y = Math.min(h - 1, r * CELL_H + sy)
          const o = (y * w + x) * 4
          const al = base.data[o + 3] / 255
          a += al
          rr += base.data[o] * al
          gg += base.data[o + 1] * al
          bb += base.data[o + 2] * al
          n++
        }
      }
      const cover = a / n
      if (cover > 0.4) cells.push({ r, c, rgb: [rr / a, gg / a, bb / a] })
    }
  }

  const draw = () => {
    const cctx = codeCanvas.getContext('2d')!
    const gctx = glitchCanvas.getContext('2d')!
    cctx.clearRect(0, 0, codeCanvas.width, codeCanvas.height)
    gctx.clearRect(0, 0, glitchCanvas.width, glitchCanvas.height)
    const font = `800 ${Math.round(CELL_H * 0.9 * TEXT_SCALE)}px "JetBrains Mono", ui-monospace, Consolas, monospace`
    cctx.font = font
    gctx.font = font
    cctx.textAlign = gctx.textAlign = 'center'
    cctx.textBaseline = gctx.textBaseline = 'middle'
    let idx = 0
    const glow = ['#bff4ff', '#9fe8ff', '#ffffff', '#c9c2ff']
    cells.forEach(({ r, c, rgb }, i) => {
      const x = (c * CELL_W + CELL_W / 2) * TEXT_SCALE
      const y = (r * CELL_H + CELL_H / 2 + 1) * TEXT_SCALE
      const ch = CODE_STREAM[idx++ % CODE_STREAM.length]
      const isSpace = ch === ' '
      // the logo's own colour, slightly lifted so each character stays legible
      const lift = 1.0 + ((i * 37) % 17) / 100
      const col = `${Math.min(255, rgb[0] * lift)},${Math.min(255, rgb[1] * lift)},${Math.min(255, rgb[2] * lift)}`
      // a faint block of the logo's colour behind each character keeps the silhouette readable
      cctx.fillStyle = `rgba(${col},0.34)`
      cctx.fillRect(c * CELL_W * TEXT_SCALE, r * CELL_H * TEXT_SCALE, CELL_W * TEXT_SCALE, CELL_H * TEXT_SCALE)
      cctx.fillStyle = `rgb(${col})`
      if (!isSpace) cctx.fillText(ch, x, y)
      gctx.shadowColor = '#17b3f2'
      gctx.shadowBlur = 10 * TEXT_SCALE
      gctx.fillStyle = glow[i % glow.length]
      gctx.fillText(GLITCH_CHARS[(i * 7 + (i >> 2)) % GLITCH_CHARS.length], x, y)
    })
    codeTex.needsUpdate = true
    glitchTex.needsUpdate = true
  }
  draw()
  if (typeof document !== 'undefined' && document.fonts) {
    document.fonts.load('800 24px "JetBrains Mono"').then(draw).catch(() => {})
  }
  return { code: codeTex, glitch: glitchTex, cols: w / CELL_W, rows: h / CELL_H }
}

const REVEAL_VERT = `
uniform float uGenie;
uniform vec2 uTarget;
uniform vec2 uOrigin;
varying vec2 vUv;

// "Genie into the lamp": the lower part of the mark is pulled into a thin, swirling stream first,
// the rest stretches after it, until everything has flowed into the target point.
vec2 genie(vec2 P) {
  float h = clamp((P.y + 380.0) / 760.0, 0.0, 1.0);        // 0 bottom → 1 top
  float q = clamp(uGenie * 1.75 - h * 0.75, 0.0, 1.0);      // lower parts go first
  q = q * q * (3.0 - 2.0 * q);
  float squeeze = mix(1.0, 0.025, pow(q, 0.5));
  float sway = sin(h * 5.5 + uGenie * 10.0) * 120.0 * q * (1.0 - 0.55 * q);
  float cx = mix(0.0, uTarget.x, q) + sway;
  return vec2(cx + P.x * squeeze, mix(P.y, uTarget.y, pow(q, 0.75)));
}

void main() {
  vUv = uv;
  vec2 P = position.xy + uOrigin;
  vec2 R = genie(P);
  vec3 pos = vec3(R - uOrigin, position.z);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`

const revealFrag = (cols: number, rows: number) => `
uniform sampler2D tArt;
uniform sampler2D tCode;
uniform sampler2D tGlitch;
uniform float uScan;
uniform float uTime;
uniform float uSide;
uniform float uSplit;
varying vec2 vUv;
const float COLS = ${cols.toFixed(3)};
const float ROWS = ${rows.toFixed(3)};
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  vec2 uv = vUv;
  float v = 1.0 - uv.y;
  float row = floor(v * ROWS);
  float col = floor(uv.x * COLS);
  // each row starts typing a little after the one above, and types left → right
  float start = (row / ROWS) * 0.80 + hash(vec2(row, 3.0)) * 0.04;
  float prog = clamp((uScan - start) / 0.22, 0.0, 1.0);
  float typing = step(0.0001, prog) * (1.0 - step(0.9999, prog));
  float typed = step(uv.x, prog) * step(0.0001, prog);
  float head = (1.0 - step(2.0 / COLS, abs(uv.x - prog))) * typing;
  vec4 art = texture2D(tArt, uv);
  vec4 code = texture2D(tCode, uv);
  vec4 gl = texture2D(tGlitch, uv);
  // finished text keeps a living-terminal flicker
  float flick = step(0.985, hash(vec2(col, row) + floor(uTime * 7.0)));
  vec4 done = mix(code, gl, flick * 0.9);
  vec4 c = mix(art, done, typed * (1.0 - head));
  c = mix(c, gl, head);
  float cover = max(art.a, code.a);
  vec3 rgb = c.rgb;
  float inside = mix(step(uv.x, uSplit), step(uSplit, uv.x), uSide);
  gl_FragColor = vec4(rgb, c.a * inside);
  #include <colorspace_fragment>
}`

const EXTRUDE_SETTINGS = {
  depth: 36,
  bevelEnabled: true,
  bevelThickness: 4,
  bevelSize: 2.4,
  bevelSegments: 4,
  curveSegments: 14,
}

/**
 * Splits the real logo artwork into two transparent plates — the pixel cloud and the eagle head — so
 * each can sit on the front of its own extruded body and still fly apart independently. Every detail
 * of the original mark is kept on the 3D version.
 */
function useLogoPlates() {
  const art = useLoader(THREE.TextureLoader, '/images/logo-mark-transparent.png')
  return useMemo(() => {
    const img = art.image as HTMLImageElement
    const w = img.naturalWidth || ART_W
    const h = img.naturalHeight || ART_H
    const src = document.createElement('canvas')
    src.width = w
    src.height = h
    const sctx = src.getContext('2d', { willReadFrequently: true })!
    sctx.drawImage(img, 0, 0)
    const base = sctx.getImageData(0, 0, w, h)

    const make = (keep: (x: number) => boolean) => {
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const ctx = c.getContext('2d')!
      const out = ctx.createImageData(w, h)
      out.data.set(base.data)
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (!keep(x)) out.data[(y * w + x) * 4 + 3] = 0
        }
      }
      ctx.putImageData(out, 0, 0)
      const t = new THREE.CanvasTexture(c)
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 8
      t.needsUpdate = true
      return t
    }
    return { pixels: make((x) => x < XCUT), head: make((x) => x >= XCUT), base, w, h }
  }, [art])
}

function svgToGeometry(data: SVGResult) {
  const geometries: THREE.BufferGeometry[] = []
  data.paths.forEach((path) => {
    const shapes = SVGLoader.createShapes(path)
    shapes.forEach((shape) => {
      geometries.push(new THREE.ExtrudeGeometry(shape, EXTRUDE_SETTINGS))
    })
  })
  const merged = mergeGeometries(geometries, false)
  merged.scale(1, -1, 1)
  merged.computeVertexNormals()
  return merged
}

type LogoModelProps = {
  scrollRotation?: React.MutableRefObject<number>
  interactive?: boolean
  scale?: number
  position?: [number, number, number]
  /** 0 = assembled logo, 1 = pixel cloud and eagle head fully separated. */
  explodeRef?: React.MutableRefObject<number>
  /** 0→1: the logo is typed out, row by row, as code. */
  codeRef?: React.MutableRefObject<number>
  /** 0→1: the mark is stretched into a stream and sucked into the laptop (and the reverse on the way out). */
  genieRef?: React.MutableRefObject<number>
}

export default function LogoModel({
  scrollRotation,
  interactive = true,
  scale = 1,
  position = [0, 0, 0],
  explodeRef,
  codeRef,
  genieRef,
}: LogoModelProps) {
  const [pixelsSvg, headSvg] = useLoader(SVGLoader, ['/images/logo-pixels.svg', '/images/logo-head.svg'])
  const plates = useLogoPlates()

  // Each body is centred on its own bounding box so it can spin/lift about itself; `pos` restores
  // its place inside the assembled logo.
  const parts = useMemo(() => {
    const build = (svg: SVGResult) => {
      const geo = svgToGeometry(svg)
      geo.computeBoundingBox()
      const box = geo.boundingBox!.clone()
      const c = box.getCenter(new THREE.Vector3())
      geo.translate(-c.x, -c.y, -c.z)
      return { geo, c, box }
    }
    const pix = build(pixelsSvg)
    const head = build(headSvg)
    const union = pix.box.clone().union(head.box)
    const cU = union.getCenter(new THREE.Vector3())
    const plate = (c: THREE.Vector3) => new THREE.Vector3(ART_W / 2 - c.x, -ART_H / 2 - c.y, FRONT_Z)
    return {
      origin: new THREE.Vector2(ART_W / 2 - cU.x, -ART_H / 2 - cU.y),
      pix: { geo: pix.geo, pos: pix.c.clone().sub(cU), plate: plate(pix.c), edges: new THREE.EdgesGeometry(pix.geo, 28) },
      head: { geo: head.geo, pos: head.c.clone().sub(cU), plate: plate(head.c), edges: new THREE.EdgesGeometry(head.geo, 28) },
    }
  }, [pixelsSvg, headSvg])

  // Code-reveal materials (only built when the code effect is requested).
  const reveal = useMemo(() => {
    if (!codeRef) return null
    const layers = makeCodeLayers(plates.base, plates.w, plates.h)
    const shared = { uScan: { value: 0 }, uTime: { value: 0 }, uGenie: { value: 0 } }
    const target = new THREE.Vector2(-440, -560)   // where the closed laptop sits, in logo space
    const mk = (art: THREE.Texture, side: number) =>
      new THREE.ShaderMaterial({
        uniforms: {
          tArt: { value: art },
          tCode: { value: layers.code },
          tGlitch: { value: layers.glitch },
          uScan: shared.uScan,
          uTime: shared.uTime,
          uGenie: shared.uGenie,
          uTarget: { value: target },
          uOrigin: { value: parts.origin },
          uSide: { value: side },
          uSplit: { value: XCUT / ART_W },
        },
        vertexShader: REVEAL_VERT,
        fragmentShader: revealFrag(layers.cols, layers.rows),
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      })
    return { shared, pix: mk(plates.pixels, 0), head: mk(plates.head, 1) }
  }, [codeRef, plates, parts])

  const pixBody = useRef<THREE.Mesh>(null)
  const headBody = useRef<THREE.Mesh>(null)
  const group = useRef<THREE.Group>(null)
  const pixGroup = useRef<THREE.Group>(null)
  const headGroup = useRef<THREE.Group>(null)
  const ghost = useRef<THREE.Group>(null)
  const ring1 = useRef<THREE.Mesh>(null)
  const ring2 = useRef<THREE.Mesh>(null)
  const ghostMat = useRef<THREE.LineBasicMaterial>(null)
  const ghostMat2 = useRef<THREE.LineBasicMaterial>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (group.current) {
      const scrollY = scrollRotation?.current ?? 0
      group.current.rotation.y = Math.sin(t * 0.12) * 0.12 + scrollY * 0.6
      group.current.rotation.x = Math.sin(t * 0.09) * 0.05
      if (interactive) {
        group.current.rotation.y += state.pointer.x * 0.22
        group.current.rotation.x += -state.pointer.y * 0.12
      }
    }

    const code = codeRef?.current ?? 0
    if (reveal) {
      reveal.shared.uScan.value = code * 1.12
      reveal.shared.uTime.value = t
      reveal.shared.uGenie.value = genieRef?.current ?? 0
    }
    if (group.current && genieRef) group.current.visible = (genieRef.current ?? 0) < 0.995
    // the solid extruded bodies give way to the typed-out text as soon as the effect starts
    if (pixBody.current) pixBody.current.visible = code < 0.001
    if (headBody.current) headBody.current.visible = code < 0.001
    const e = explodeRef?.current ?? 0
    const k = e * e * (3 - 2 * e)
    // Futuristic split: the pixel cloud recedes and drifts apart while the eagle head lifts out,
    // spins a full turn and hovers in front; a blueprint ghost of the assembled mark and two
    // scanner rings hold the original silhouette in place.
    if (pixGroup.current) {
      pixGroup.current.position.set(parts.pix.pos.x - k * 230, parts.pix.pos.y + k * 30, parts.pix.pos.z - k * 260)
      pixGroup.current.rotation.set(k * 0.14, -k * 0.5, 0)
      pixGroup.current.scale.setScalar(1 - k * 0.06)
    }
    if (headGroup.current) {
      headGroup.current.position.set(parts.head.pos.x + k * 170, parts.head.pos.y + k * 150, parts.head.pos.z + k * 380)
      headGroup.current.rotation.set(Math.sin(k * Math.PI) * 0.4, k * Math.PI * 2, k * 0.2)
      headGroup.current.scale.setScalar(1 + k * 0.16)
    }
    const flicker = 0.75 + Math.sin(t * 38) * 0.12 + Math.sin(t * 13) * 0.08
    if (ghostMat.current) ghostMat.current.opacity = Math.min(1, k * 1.6) * 0.5 * flicker
    if (ghostMat2.current) ghostMat2.current.opacity = Math.min(1, k * 1.6) * 0.5 * flicker
    if (ghost.current) ghost.current.visible = k > 0.01
    const ringOn = k > 0.01
    if (ring1.current) {
      ring1.current.visible = ringOn
      ring1.current.scale.setScalar(0.4 + k * 1.1)
      ring1.current.rotation.set(Math.PI / 2 + Math.sin(t * 0.7) * 0.25, t * 0.9, 0)
      ;(ring1.current.material as THREE.MeshBasicMaterial).opacity = Math.sin(k * Math.PI) * 0.9
    }
    if (ring2.current) {
      ring2.current.visible = ringOn
      ring2.current.scale.setScalar(0.3 + k * 1.5)
      ring2.current.rotation.set(Math.PI / 2 - 0.5, -t * 0.6, t * 0.4)
      ;(ring2.current.material as THREE.MeshBasicMaterial).opacity = Math.sin(k * Math.PI) * 0.6
    }
  })

  const normScale = (scale * 1.45) / ART_W

  const plateMat = (map: THREE.Texture) => (
    // Self-lit so the artwork's colours stay exact; the clear coat adds the glossy reflections.
    <meshPhysicalMaterial
      map={map}
      emissiveMap={map}
      emissive="#ffffff"
      emissiveIntensity={1}
      color="#000000"
      transparent
      depthWrite={false}
      toneMapped={false}
      roughness={1}
      specularIntensity={0}
      metalness={0}
      clearcoat={0.28}
      clearcoatRoughness={0.1}
      envMapIntensity={0.25}
    />
  )

  return (
    <group ref={group} scale={normScale} position={position}>
      <group ref={pixGroup} position={parts.pix.pos}>
        <mesh ref={pixBody} geometry={parts.pix.geo} castShadow receiveShadow>
          <meshStandardMaterial color="#343aa6" metalness={0.5} roughness={0.4} envMapIntensity={1} />
        </mesh>
        <mesh position={parts.pix.plate} renderOrder={2}>
          <planeGeometry args={[ART_W, ART_H, 96, 68]} />
          {reveal ? <primitive object={reveal.pix} attach="material" /> : plateMat(plates.pixels)}
        </mesh>
      </group>

      <group ref={headGroup} position={parts.head.pos}>
        <mesh ref={headBody} geometry={parts.head.geo} castShadow receiveShadow>
          <meshStandardMaterial color="#141d4a" metalness={0.6} roughness={0.35} envMapIntensity={1.1} />
        </mesh>
        <mesh position={parts.head.plate} renderOrder={3}>
          <planeGeometry args={[ART_W, ART_H, 96, 68]} />
          {reveal ? <primitive object={reveal.head} attach="material" /> : plateMat(plates.head)}
        </mesh>
      </group>

      <group ref={ghost} visible={false}>
        <lineSegments geometry={parts.pix.edges} position={parts.pix.pos}>
          <lineBasicMaterial ref={ghostMat} color="#5b4cff" transparent opacity={0} toneMapped={false} depthWrite={false} />
        </lineSegments>
        <lineSegments geometry={parts.head.edges} position={parts.head.pos}>
          <lineBasicMaterial ref={ghostMat2} color="#17b3f2" transparent opacity={0} toneMapped={false} depthWrite={false} />
        </lineSegments>
      </group>
      <mesh ref={ring1} visible={false}>
        <torusGeometry args={[600, 3, 8, 96]} />
        <meshBasicMaterial color="#5b4cff" transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh ref={ring2} visible={false}>
        <torusGeometry args={[600, 2, 8, 96]} />
        <meshBasicMaterial color="#17b3f2" transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  )
}
