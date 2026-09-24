import { useMemo, useRef } from 'react'
import { useLoader, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SVGLoader, type SVGResult } from 'three/examples/jsm/loaders/SVGLoader.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const EXTRUDE_SETTINGS = {
  depth: 36,
  bevelEnabled: true,
  bevelThickness: 4,
  bevelSize: 2.4,
  bevelSegments: 4,
  curveSegments: 8,
}

function svgToGeometry(data: SVGResult) {
  const geometries: THREE.BufferGeometry[] = []
  data.paths.forEach((path) => {
    const shapes = SVGLoader.createShapes(path)
    shapes.forEach((shape) => {
      const geo = new THREE.ExtrudeGeometry(shape, EXTRUDE_SETTINGS)
      geometries.push(geo)
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
  /** 0 = assembled logo, 1 = fully separated into its two constituent pieces. */
  explodeRef?: React.MutableRefObject<number>
}

export default function LogoModel({
  scrollRotation,
  interactive = true,
  scale = 1,
  position = [0, 0, 0],
  explodeRef,
}: LogoModelProps) {
  const [darkSvg, redSvg] = useLoader(SVGLoader, ['/images/logo-dark.svg', '/images/logo-red.svg'])

  const darkGeo = useMemo(() => {
    const g = svgToGeometry(darkSvg)
    g.center()
    return g
  }, [darkSvg])

  // Red is recentred on its own centroid so it can spin/lift around itself when exploding.
  const red = useMemo(() => {
    const g = svgToGeometry(redSvg)
    g.computeBoundingBox()
    const c = g.boundingBox!.getCenter(new THREE.Vector3())
    g.translate(-c.x, -c.y, -c.z)
    return { geo: g, center: c }
  }, [redSvg])

  // Same frame offset as the (centred) dark geometry.
  const offset = useMemo(() => {
    const box = new THREE.Box3().setFromObject(new THREE.Mesh(svgToGeometry(darkSvg)))
    return box.getCenter(new THREE.Vector3())
  }, [darkSvg])

  const darkEdges = useMemo(() => new THREE.EdgesGeometry(darkGeo, 28), [darkGeo])
  const redEdges = useMemo(() => new THREE.EdgesGeometry(red.geo, 28), [red])
  const redBase = useMemo(() => red.center.clone().sub(offset).add(new THREE.Vector3(0, 0, 8)), [red, offset])

  const group = useRef<THREE.Group>(null)
  const darkMesh = useRef<THREE.Group>(null)
  const redMesh = useRef<THREE.Group>(null)
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
    // Futuristic split: the eagles lift out, spin a full turn about their own axis and
    // hover in front while the AD block recedes and tilts back; a blueprint ghost of the
    // assembled mark and two scanner rings hold the original silhouette in place.
    if (darkMesh.current) {
      darkMesh.current.position.set(-k * 90, -k * 30, -k * 260)
      darkMesh.current.rotation.set(k * 0.12, -k * 0.55, 0)
      darkMesh.current.scale.setScalar(1 - k * 0.06)
    }
    if (redMesh.current) {
      redMesh.current.position.set(redBase.x + k * 180, redBase.y + k * 170, redBase.z + k * 380)
      redMesh.current.rotation.set(Math.sin(k * Math.PI) * 0.5, k * Math.PI * 2, k * 0.25)
      redMesh.current.scale.setScalar(1 + k * 0.18)
    }
    const flicker = 0.75 + Math.sin(t * 38) * 0.12 + Math.sin(t * 13) * 0.08
    if (ghostMat.current) ghostMat.current.opacity = Math.min(1, k * 1.6) * 0.55 * flicker
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

  const normScale = (scale * 1.4688) / 1064

  return (
    <group ref={group} scale={normScale} position={position}>
      <group ref={darkMesh}>
        <mesh geometry={darkGeo} castShadow receiveShadow>
          <meshStandardMaterial color="#4a4e57" metalness={0.92} roughness={0.32} envMapIntensity={1.4} />
        </mesh>
      </group>
      <group ref={redMesh} position={[redBase.x, redBase.y, redBase.z]}>
        <mesh geometry={red.geo} castShadow receiveShadow>
          <meshStandardMaterial
            color="#D71920"
            metalness={0.4}
            roughness={0.38}
            emissive="#8c0f14"
            emissiveIntensity={0.35}
            envMapIntensity={1.1}
          />
        </mesh>
      </group>

      <group ref={ghost} visible={false}>
        <lineSegments geometry={darkEdges}>
          <lineBasicMaterial ref={ghostMat} color="#ff5b5f" transparent opacity={0} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
        </lineSegments>
        <lineSegments geometry={redEdges} position={[redBase.x, redBase.y, redBase.z]}>
          <lineBasicMaterial ref={ghostMat2} color="#ffffff" transparent opacity={0} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
        </lineSegments>
      </group>
      <mesh ref={ring1} visible={false}>
        <torusGeometry args={[600, 3, 8, 96]} />
        <meshBasicMaterial color="#ff3038" transparent opacity={0} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={ring2} visible={false}>
        <torusGeometry args={[600, 2, 8, 96]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  )
}
