import { useMemo, useRef } from 'react'
import { useLoader, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SVGLoader, type SVGResult } from 'three/examples/jsm/loaders/SVGLoader.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const EXTRUDE_SETTINGS = {
  depth: 16,
  bevelEnabled: true,
  bevelThickness: 2.2,
  bevelSize: 1.4,
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

  const redGeo = useMemo(() => {
    const g = svgToGeometry(redSvg)
    return g
  }, [redSvg])

  // Align red geometry to the same coordinate frame/offset as the (centered) dark geometry.
  const offset = useMemo(() => {
    const box = new THREE.Box3().setFromObject(new THREE.Mesh(svgToGeometry(darkSvg)))
    return box.getCenter(new THREE.Vector3())
  }, [darkSvg])

  const group = useRef<THREE.Group>(null)
  const darkMesh = useRef<THREE.Mesh>(null)
  const redMesh = useRef<THREE.Mesh>(null)

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

    const explode = explodeRef?.current ?? 0
    if (darkMesh.current) {
      darkMesh.current.position.x = -explode * 90
      darkMesh.current.position.z = -explode * 60
      darkMesh.current.rotation.z = -explode * 0.6
    }
    if (redMesh.current) {
      redMesh.current.position.x = -offset.x + explode * 100
      redMesh.current.position.y = -offset.y + explode * 40
      redMesh.current.position.z = -offset.z + explode * 70
      redMesh.current.rotation.z = explode * 0.7
    }
  })

  const normScale = (scale * 1) / 320

  return (
    <group ref={group} scale={normScale} position={position}>
      <mesh ref={darkMesh} geometry={darkGeo} castShadow receiveShadow>
        <meshStandardMaterial color="#4a4e57" metalness={0.92} roughness={0.32} envMapIntensity={1.4} />
      </mesh>
      <mesh ref={redMesh} geometry={redGeo} position={[-offset.x, -offset.y, -offset.z]} castShadow receiveShadow>
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
  )
}
