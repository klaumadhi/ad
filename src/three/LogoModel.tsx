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
    return { pixels: make((x) => x < XCUT), head: make((x) => x >= XCUT) }
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
}

export default function LogoModel({
  scrollRotation,
  interactive = true,
  scale = 1,
  position = [0, 0, 0],
  explodeRef,
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
      pix: { geo: pix.geo, pos: pix.c.clone().sub(cU), plate: plate(pix.c), edges: new THREE.EdgesGeometry(pix.geo, 28) },
      head: { geo: head.geo, pos: head.c.clone().sub(cU), plate: plate(head.c), edges: new THREE.EdgesGeometry(head.geo, 28) },
    }
  }, [pixelsSvg, headSvg])

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
        <mesh geometry={parts.pix.geo} castShadow receiveShadow>
          <meshStandardMaterial color="#343aa6" metalness={0.5} roughness={0.4} envMapIntensity={1} />
        </mesh>
        <mesh position={parts.pix.plate} renderOrder={2}>
          <planeGeometry args={[ART_W, ART_H]} />
          {plateMat(plates.pixels)}
        </mesh>
      </group>

      <group ref={headGroup} position={parts.head.pos}>
        <mesh geometry={parts.head.geo} castShadow receiveShadow>
          <meshStandardMaterial color="#141d4a" metalness={0.6} roughness={0.35} envMapIntensity={1.1} />
        </mesh>
        <mesh position={parts.head.plate} renderOrder={3}>
          <planeGeometry args={[ART_W, ART_H]} />
          {plateMat(plates.head)}
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
