import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'

/** Bright, cool studio: a pale dome for bounce light plus soft boxes so the metal reads clean, not black. */
export function StudioLights({ resolution = 256 }: { resolution?: number }) {
  return (
    <Environment resolution={resolution}>
      <mesh scale={60}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#dfe6ff" side={THREE.BackSide} />
      </mesh>
      <Lightformer intensity={2.6} rotation-x={Math.PI / 2} position={[0, 6, -2]} scale={[9, 9, 1]} color="#ffffff" />
      <Lightformer intensity={1.4} position={[-6, 2, 3]} scale={[6, 4, 1]} color="#bcd0ff" />
      <Lightformer intensity={1.6} position={[6, 1.5, 4]} scale={[4, 5, 1]} color="#ffc9de" />
      <Lightformer intensity={0.9} position={[0, -3, 4]} scale={[10, 2, 1]} color="#c9b8ff" />
    </Environment>
  )
}
