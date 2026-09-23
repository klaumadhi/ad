import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type PanelDef = {
  restPos: THREE.Vector3
  startPos: THREE.Vector3
  restRot: THREE.Euler
  color: string
  size: [number, number]
  delay: number
}

const PANEL_DEFS: PanelDef[] = [
  { restPos: new THREE.Vector3(-2.4, 2.5, 1.6), startPos: new THREE.Vector3(0, 1.5, 0.3), restRot: new THREE.Euler(0, 0.3, 0.06), color: '#1b1e24', size: [1.1, 0.7], delay: 0 },
  { restPos: new THREE.Vector3(2.5, 2.7, 1.3), startPos: new THREE.Vector3(0, 1.6, 0.3), restRot: new THREE.Euler(0, -0.35, -0.05), color: '#D71920', size: [0.9, 0.55], delay: 0.05 },
  { restPos: new THREE.Vector3(-2.9, 0.7, 1.9), startPos: new THREE.Vector3(0, 1.1, 0.3), restRot: new THREE.Euler(0.05, 0.4, 0.03), color: '#1b1e24', size: [0.85, 0.85], delay: 0.1 },
  { restPos: new THREE.Vector3(2.9, 0.5, 1.8), startPos: new THREE.Vector3(0, 1.1, 0.3), restRot: new THREE.Euler(-0.05, -0.4, 0), color: '#24272f', size: [1, 0.6], delay: 0.08 },
  { restPos: new THREE.Vector3(0, 3.3, 0.8), startPos: new THREE.Vector3(0, 1.9, 0.3), restRot: new THREE.Euler(0.1, 0, 0), color: '#D71920', size: [1.3, 0.4], delay: 0.15 },
  { restPos: new THREE.Vector3(-1.6, -0.4, 2.2), startPos: new THREE.Vector3(0, 0.9, 0.3), restRot: new THREE.Euler(0.08, 0.2, -0.04), color: '#1b1e24', size: [0.8, 0.5], delay: 0.12 },
]

function Panel({ def, progressRef }: { def: PanelDef; progressRef: React.MutableRefObject<number> }) {
  const mesh = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const p = progressRef.current
    const t = state.clock.elapsedTime
    if (!mesh.current) return

    // Expand out between 0.74-0.85, hold, then retract as the business beat begins.
    const start = 0.74 + def.delay
    const end = 0.85
    let amt = 0
    if (p < start) amt = 0
    else if (p < end) amt = THREE.MathUtils.smoothstep(p, start, end)
    else if (p < 0.9) amt = 1
    else amt = 1 - THREE.MathUtils.smoothstep(p, 0.9, 0.97)

    const pos = def.startPos.clone().lerp(def.restPos, amt)
    pos.y += Math.sin(t * 0.6 + def.delay * 10) * 0.04 * amt
    mesh.current.position.copy(pos)
    mesh.current.rotation.set(def.restRot.x * amt, def.restRot.y * amt, def.restRot.z * amt)
    const s = 0.001 + amt * 0.999
    mesh.current.scale.setScalar(s)
    ;(mesh.current.material as THREE.MeshStandardMaterial).opacity = amt
  })

  return (
    <mesh ref={mesh}>
      <planeGeometry args={def.size} />
      <meshStandardMaterial
        color={def.color}
        transparent
        opacity={0}
        metalness={0.3}
        roughness={0.5}
        side={THREE.DoubleSide}
        emissive={def.color}
        emissiveIntensity={0.15}
      />
    </mesh>
  )
}

export default function FloatingPanels({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const panels = useMemo(() => PANEL_DEFS, [])
  return (
    <group position={[0, 0, 0]}>
      {panels.map((def, i) => (
        <Panel key={i} def={def} progressRef={progressRef} />
      ))}
    </group>
  )
}
