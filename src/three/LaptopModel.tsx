import { useCallback, useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import HoloLayers from './HoloLayers'
import {
  makeCodeTexture,
  makeWebsiteTexture,
  makeKeyboardTexture,
  makeBrushedMetalTexture,
  makeGlareTexture,
  makeSpeakerTexture,
} from './laptopTextures'

type LaptopModelProps = {
  progressRef: React.MutableRefObject<number>
  position?: [number, number, number]
}

/** Rounded-corner plan outline (in the XZ plane) extruded upward with a soft bevel — a machined slab. */
function slab(w: number, d: number, r: number, thick: number, bevel: number) {
  const iw = w - bevel * 2
  const id = d - bevel * 2
  const ir = Math.max(0.001, r - bevel)
  const x = -iw / 2
  const y = -id / 2
  const s = new THREE.Shape()
  s.moveTo(x + ir, y)
  s.lineTo(x + iw - ir, y)
  s.absarc(x + iw - ir, y + ir, ir, -Math.PI / 2, 0, false)
  s.lineTo(x + iw, y + id - ir)
  s.absarc(x + iw - ir, y + id - ir, ir, 0, Math.PI / 2, false)
  s.lineTo(x + ir, y + id)
  s.absarc(x + ir, y + id - ir, ir, Math.PI / 2, Math.PI, false)
  s.lineTo(x, y + ir)
  s.absarc(x + ir, y + ir, ir, Math.PI, Math.PI * 1.5, false)
  const g = new THREE.ExtrudeGeometry(s, {
    depth: thick - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 5,
    curveSegments: 24,
  })
  g.rotateX(-Math.PI / 2)
  g.translate(0, -(thick / 2 - bevel), 0)
  return g
}

/** Flat rounded rectangle facing +Z. */
function roundedPlane(w: number, h: number, r: number) {
  const s = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false)
  s.lineTo(x + w, y + h - r)
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false)
  s.lineTo(x + r, y + h)
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false)
  s.lineTo(x, y + r)
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false)
  return new THREE.ShapeGeometry(s, 24)
}

const KEY_ROWS: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.7],
  [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.2],
  [1.8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.0],
  [2.3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.4],
  [1.2, 1.2, 1.2, 1.3, 5.4, 1.3, 1.2, 1.2, 1.2],
]
const ROW_H = [0.07, 0.135, 0.135, 0.135, 0.135, 0.135]
const KEY_GAP = 0.017
const KB_W = 1.72

/** Real keycap geometry (instanced) sitting in a dark well, with a soft under-glow. */
function Keyboard({ glow }: { glow: THREE.Texture }) {
  const geo = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 3, 0.14), [])
  const count = KEY_ROWS.reduce((n, r) => n + r.length, 0)
  const total = ROW_H.reduce((a, b) => a + b, 0) + (ROW_H.length - 1) * KEY_GAP
  const zc = 0.29

  // Lay the keycaps out whenever a (new) instanced mesh is created — a ref callback, so the
  // matrices can never be applied to a stale instance if React re-instantiates it.
  const layout = useCallback(
    (m: THREE.InstancedMesh | null) => {
      if (!m) return
      const dummy = new THREE.Object3D()
      let idx = 0
      let z = zc - total / 2
      KEY_ROWS.forEach((row, ri) => {
        const sum = row.reduce((a, b) => a + b, 0)
        const unit = (KB_W - (row.length - 1) * KEY_GAP) / sum
        let x = -KB_W / 2
        const h = ROW_H[ri]
        const kh = ri === 0 ? 0.012 : 0.02
        row.forEach((u) => {
          const kw = u * unit
          dummy.position.set(x + kw / 2, 0.0316 + kh / 2, z + h / 2)
          dummy.scale.set(kw * 0.97, kh, h * 0.96)
          dummy.updateMatrix()
          m.setMatrixAt(idx++, dummy.matrix)
          x += kw + KEY_GAP
        })
        z += h + KEY_GAP
      })
      m.instanceMatrix.needsUpdate = true
      m.computeBoundingSphere()
    },
    [total],
  )

  return (
    <group>
      <mesh position={[0, 0.0305, zc]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[KB_W + 0.06, total + 0.06]} />
        <meshStandardMaterial color="#0d1020" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.0312, zc]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[KB_W + 0.16, total + 0.16]} />
        <meshBasicMaterial map={glow} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <instancedMesh ref={layout} args={[geo, undefined, count]} castShadow frustumCulled={false}>
        <meshPhysicalMaterial color="#1a1f34" roughness={0.5} metalness={0.15} clearcoat={0.35} clearcoatRoughness={0.3} />
      </instancedMesh>
    </group>
  )
}

export default function LaptopModel({ progressRef, position = [0, 0, 0] }: LaptopModelProps) {
  const group = useRef<THREE.Group>(null)
  const ring1 = useRef<THREE.Mesh>(null)
  const ring2 = useRef<THREE.Mesh>(null)
  const flash = useRef<THREE.PointLight>(null)
  const screenPivot = useRef<THREE.Group>(null)
  const codeMat = useRef<THREE.MeshBasicMaterial>(null)
  const websiteMat = useRef<THREE.MeshBasicMaterial>(null)
  const glareMat = useRef<THREE.MeshBasicMaterial>(null)

  const codeTexture = useMemo(() => makeCodeTexture(), [])
  const websiteTexture = useMemo(() => makeWebsiteTexture(), [])
  const keyboardGlow = useMemo(() => makeKeyboardTexture(), [])
  const brushedTexture = useMemo(() => makeBrushedMetalTexture(), [])
  const glareTexture = useMemo(() => makeGlareTexture(), [])
  const speakerTexture = useMemo(() => makeSpeakerTexture(), [])
  const logoArt = useLoader(THREE.TextureLoader, '/images/logo-mark-transparent.png')
  logoArt.colorSpace = THREE.SRGBColorSpace
  logoArt.anisotropy = 8

  const baseGeo = useMemo(() => slab(2.15, 1.5, 0.11, 0.06, 0.012), [])
  const lidGeo = useMemo(() => slab(2.15, 1.26, 0.09, 0.045, 0.01).rotateX(Math.PI / 2), [])
  const bezelGeo = useMemo(() => roundedPlane(2.07, 1.2, 0.05), [])
  const trackpadGeo = useMemo(() => slab(0.78, 0.48, 0.03, 0.006, 0.0015), [])

  useFrame((state) => {
    const p = progressRef.current
    const t = state.clock.elapsedTime
    const sm = THREE.MathUtils.smoothstep

    // Entrance: the mark collapses into a shockwave, the laptop materialises and its lid opens.
    const vis = sm(p, 0.36, 0.46) * (1 - sm(p, 0.9, 0.97))
    const open = sm(p, 0.4, 0.54)
    const shock = sm(p, 0.34, 0.5)
    const lift = sm(p, 0.54, 0.66) - sm(p, 0.68, 0.74)
    const fan = sm(p, 0.8, 0.88) - sm(p, 0.9, 0.95)

    if (group.current) {
      group.current.visible = vis > 0.001
      group.current.scale.setScalar(0.5 + vis * 0.5 + fan * 0.04)
      group.current.position.y = -(1 - vis) * 0.6 + Math.sin(t * 0.4) * 0.025 + lift * 0.05
      group.current.rotation.y =
        0.14 + Math.sin(t * 0.14) * 0.04 + state.pointer.x * 0.06 * vis - (1 - open) * 1.4 + lift * 0.5 - fan * 0.2
      group.current.rotation.x = 0.02 + -state.pointer.y * 0.03 * vis + lift * 0.06
    }

    if (screenPivot.current) {
      const closed = THREE.MathUtils.degToRad(88)
      screenPivot.current.rotation.x = THREE.MathUtils.lerp(closed, THREE.MathUtils.degToRad(-7), open)
    }

    if (ring1.current) {
      const m = ring1.current.material as THREE.MeshBasicMaterial
      ring1.current.visible = shock > 0.01 && shock < 0.999
      ring1.current.scale.setScalar(0.2 + shock * 2.6)
      ring1.current.rotation.set(Math.PI / 2 - 0.35, 0, t * 0.8)
      m.opacity = Math.sin(shock * Math.PI) * 0.95
    }
    if (ring2.current) {
      const m = ring2.current.material as THREE.MeshBasicMaterial
      ring2.current.visible = fan > 0.01 || lift > 0.01
      ring2.current.scale.setScalar(1.0 + fan * 0.12 + lift * 0.1)
      ring2.current.rotation.set(Math.PI / 2 - 0.5, t * 0.35, 0)
      m.opacity = Math.min(1, fan + lift) * 0.55
    }
    if (flash.current) flash.current.intensity = Math.sin(shock * Math.PI) * 26

    const codeOp = (1 - sm(p, 0.7, 0.78)) * (1 - lift * 0.55)
    const webOp = sm(p, 0.7, 0.78)
    if (codeMat.current) codeMat.current.opacity = codeOp * vis
    if (websiteMat.current) websiteMat.current.opacity = webOp * vis
    if (glareMat.current) glareMat.current.opacity = 0.55 * vis * open
  })

  const alu = (
    <meshPhysicalMaterial
      color="#d3d8e6"
      metalness={1}
      roughness={0.32}
      roughnessMap={brushedTexture}
      envMapIntensity={1.15}
      clearcoat={0.2}
      clearcoatRoughness={0.3}
    />
  )

  return (
    <group position={position}>
      <pointLight ref={flash} color="#8a7dff" intensity={0} distance={7} decay={2} position={[0, 0.6, 1.2]} />
      <mesh ref={ring1} visible={false}>
        <torusGeometry args={[1, 0.008, 8, 128]} />
        <meshBasicMaterial color="#5b4cff" transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh ref={ring2} visible={false} position={[0, 0.5, 0.4]}>
        <torusGeometry args={[1.7, 0.006, 8, 160]} />
        <meshBasicMaterial color="#17b3f2" transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>

      <group ref={group} rotation={[0.02, 0.14, 0]}>
        {/* Base — machined aluminium slab with rounded plan corners */}
        <mesh geometry={baseGeo} position={[0, 0, 0.5]} castShadow receiveShadow>
          {alu}
        </mesh>

        {/* Rubber feet */}
        {[
          [-0.9, 0.08],
          [0.9, 0.08],
          [-0.9, 0.95],
          [0.9, 0.95],
        ].map(([x, z]) => (
          <mesh key={`${x}${z}`} position={[x, -0.034, z]}>
            <cylinderGeometry args={[0.036, 0.036, 0.012, 20]} />
            <meshStandardMaterial color="#12141f" roughness={0.9} />
          </mesh>
        ))}

        <Keyboard glow={keyboardGlow} />

        {/* Speaker grilles */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.975, 0.0313, 0.29]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.1, 0.82]} />
            <meshBasicMaterial map={speakerTexture} transparent depthWrite={false} />
          </mesh>
        ))}

        {/* Glass trackpad */}
        <mesh geometry={trackpadGeo} position={[0, 0.0322, 0.955]}>
          <meshPhysicalMaterial color="#c9cfdf" metalness={0.5} roughness={0.16} clearcoat={1} clearcoatRoughness={0.06} />
        </mesh>

        {/* Hinge barrel */}
        <mesh position={[0, 0.03, -0.245]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 1.62, 32]} />
          <meshStandardMaterial color="#232840" metalness={0.85} roughness={0.35} />
        </mesh>

        {/* Lid — pivots on the hinge; built open with the display facing +Z */}
        <group ref={screenPivot} position={[0, 0.03, -0.245]}>
          <mesh geometry={lidGeo} position={[0, 0.655, 0]} castShadow>
            {alu}
          </mesh>

          {/* Back-of-lid emblem (visible while the lid is closed) */}
          <mesh position={[0, 0.655, -0.0232]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[0.48, 0.286]} />
            <meshPhysicalMaterial map={logoArt} transparent roughness={0.4} metalness={0.1} clearcoat={0.7} clearcoatRoughness={0.2} />
          </mesh>

          {/* Black glass bezel */}
          <mesh geometry={bezelGeo} position={[0, 0.655, 0.0232]}>
            <meshPhysicalMaterial color="#04050b" roughness={0.12} metalness={0} clearcoat={1} clearcoatRoughness={0.05} />
          </mesh>

          {/* Webcam */}
          <mesh position={[0, 1.235, 0.0236]}>
            <circleGeometry args={[0.0105, 24]} />
            <meshStandardMaterial color="#0b1230" roughness={0.3} metalness={0.5} />
          </mesh>
          <mesh position={[0.0025, 1.2375, 0.0238]}>
            <circleGeometry args={[0.0028, 12]} />
            <meshBasicMaterial color="#5b6cff" toneMapped={false} />
          </mesh>

          {/* Display */}
          <mesh position={[0, 0.635, 0.0242]}>
            <planeGeometry args={[1.9, 1.1875]} />
            <meshBasicMaterial ref={codeMat} map={codeTexture} transparent toneMapped={false} opacity={0} />
          </mesh>
          <mesh position={[0, 0.635, 0.0244]}>
            <planeGeometry args={[1.9, 1.1875]} />
            <meshBasicMaterial ref={websiteMat} map={websiteTexture} transparent toneMapped={false} opacity={0} />
          </mesh>

          {/* Glass glare */}
          <mesh position={[0, 0.635, 0.0248]}>
            <planeGeometry args={[1.9, 1.1875]} />
            <meshBasicMaterial ref={glareMat} map={glareTexture} transparent opacity={0} toneMapped={false} depthWrite={false} />
          </mesh>

          <pointLight position={[0, 0.65, 0.5]} intensity={1.1} color="#e8ecff" distance={2} decay={2} />
          <HoloLayers progressRef={progressRef} />
        </group>
      </group>
    </group>
  )
}
