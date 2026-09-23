import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type StreakParticlesProps = {
  count?: number
  spread?: [number, number, number]
  color?: string
  speed?: number
  length?: number
}

/**
 * Elongated instanced streaks that shoot diagonally through the scene, evoking
 * the comet-trail particles from the reference footage (rather than flat round sparkles).
 */
export default function StreakParticles({
  count = 40,
  spread = [24, 14, 16],
  color = '#D71920',
  speed = 6,
  length = 1.6,
}: StreakParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const direction = useMemo(() => new THREE.Vector3(-1, -0.55, 0.2).normalize(), [])

  const particles = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * spread[0],
        (Math.random() - 0.5) * spread[1],
        (Math.random() - 0.5) * spread[2],
      ),
      velocity: speed * (0.5 + Math.random() * 0.8),
      scale: 0.4 + Math.random() * 0.9,
    }))
  }, [count, spread, speed])

  useFrame((_, delta) => {
    const mesh = meshRef.current
    if (!mesh) return
    particles.forEach((p, i) => {
      p.pos.addScaledVector(direction, p.velocity * delta)
      if (p.pos.x < -spread[0] / 2 || p.pos.y < -spread[1] / 2) {
        p.pos.set(spread[0] / 2 + Math.random() * 2, (Math.random() - 0.5) * spread[1], (Math.random() - 0.5) * spread[2])
      }
      dummy.position.copy(p.pos)
      dummy.scale.set(p.scale * length, p.scale * 0.045, p.scale * 0.045)
      dummy.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), direction)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={color} transparent opacity={0.55} toneMapped={false} />
    </instancedMesh>
  )
}
