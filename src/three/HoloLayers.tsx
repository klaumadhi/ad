import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { makeHoloTexture, type HoloKind } from './laptopTextures'

const KINDS: HoloKind[] = ['structure', 'interface', 'data', 'logic']

/**
 * The website "peels off" the screen into floating translucent layers — structure,
 * interface, data, logic — then snaps back, and later fans out around the laptop.
 * Lives inside the screen pivot, so it inherits the lid's pose.
 */
export default function HoloLayers({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const textures = useMemo(() => KINDS.map(makeHoloTexture), [])
  const refs = useRef<(THREE.Mesh | null)[]>([])

  useFrame((state) => {
    const p = progressRef.current
    const t = state.clock.elapsedTime
    const sm = THREE.MathUtils.smoothstep
    const lift = sm(p, 0.54, 0.66) - sm(p, 0.68, 0.74)
    const fan = sm(p, 0.8, 0.88) - sm(p, 0.9, 0.95)
    const amt = Math.min(1, lift + fan)

    refs.current.forEach((m, i) => {
      if (!m) return
      m.visible = amt > 0.01
      const k = i - 1.5
      const z = 0.03 + lift * 0.24 * (i + 1) + fan * 0.16 * (i + 1)
      m.position.set(k * fan * 0.8, 0.65 + fan * (0.15 - Math.abs(k) * 0.1) + Math.sin(t * 0.8 + i) * 0.015 * amt, z)
      m.rotation.set(fan * 0.08 * k, -k * fan * 0.4, lift * 0.02 * k)
      m.scale.setScalar(1 + lift * 0.03 * i - fan * 0.25)
      ;(m.material as THREE.MeshBasicMaterial).opacity = amt * (0.95 - i * 0.08)
    })
  })

  return (
    <group>
      {KINDS.map((k, i) => (
        <mesh
          key={k}
          ref={(el) => {
            refs.current[i] = el
          }}
          visible={false}
          renderOrder={10 + i}
        >
          <planeGeometry args={[1.96, 1.17]} />
          <meshBasicMaterial
            map={textures[i]}
            transparent
            opacity={0}
            toneMapped={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}
