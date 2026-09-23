import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import LogoModel from './LogoModel'

export default function AboutScene({ scrollRotation }: { scrollRotation: React.MutableRefObject<number> }) {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 32 }} gl={{ alpha: true }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={0.8} />
      <pointLight position={[-3, -1, 2]} intensity={4} color="#D71920" distance={8} decay={2} />
      <Suspense fallback={null}>
        <Environment resolution={256}>
          <Lightformer intensity={1.2} rotation-x={Math.PI / 2} position={[0, 5, -2]} scale={[6, 6, 1]} color="#ffffff" />
          <Lightformer intensity={0.8} position={[4, 1, 3]} scale={[4, 4, 1]} color="#ff5b5f" />
        </Environment>
        <LogoModel scrollRotation={scrollRotation} scale={1.7} interactive={false} />
      </Suspense>
    </Canvas>
  )
}
