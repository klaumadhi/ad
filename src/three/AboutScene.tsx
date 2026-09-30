import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import LogoModel from './LogoModel'
import { StudioLights } from './Studio'
import { useInView } from '../hooks/useInView'

export default function AboutScene({ scrollRotation }: { scrollRotation: React.MutableRefObject<number> }) {
  const [wrapRef, inView] = useInView<HTMLDivElement>()
  return (
    <div ref={wrapRef} className="h-full w-full">
    <Canvas frameloop={inView ? 'always' : 'never'} camera={{ position: [0, 0, 6], fov: 32 }} gl={{ alpha: true, antialias: true }} dpr={[1, 1.4]}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={0.8} />
      <pointLight position={[-3, -1, 2]} intensity={3} color="#6f63ff" distance={8} decay={2} />
      <Suspense fallback={null}>
        <StudioLights />
        <LogoModel scrollRotation={scrollRotation} scale={1.7} interactive={false} />
      </Suspense>
    </Canvas>
    </div>
  )
}
