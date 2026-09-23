import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows, Grid } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import LogoModel from './LogoModel'
import StreakParticles from './StreakParticles'

function Rig({ isTouch }: { isTouch: boolean }) {
  useFrame((state) => {
    const px = isTouch ? 0 : state.pointer.x
    const py = isTouch ? 0 : state.pointer.y
    const targetX = px * 0.7
    const targetY = 1.1 + py * 0.35
    state.camera.position.x += (targetX - state.camera.position.x) * 0.035
    state.camera.position.y += (targetY - state.camera.position.y) * 0.035
    state.camera.lookAt(0, 0.4, 0)
  })
  return null
}

function StudioLights() {
  return (
    <Environment resolution={256}>
      <Lightformer intensity={1.4} rotation-x={Math.PI / 2} position={[0, 6, -2]} scale={[8, 8, 1]} color="#ffffff" />
      <Lightformer intensity={0.7} position={[-6, 2, 3]} scale={[6, 3, 1]} color="#ffffff" />
      <Lightformer intensity={1} position={[5, 1, 4]} scale={[4, 4, 1]} color="#ff5b5f" />
      <Lightformer intensity={0.5} position={[0, -3, 4]} scale={[10, 2, 1]} color="#8892a6" />
    </Environment>
  )
}

function SweepLight() {
  const ref = useRef<THREE.PointLight>(null)
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (ref.current) {
      ref.current.position.x = Math.sin(t * 0.5) * 2.2
      ref.current.position.y = 1.55 + Math.cos(t * 0.35) * 0.5
    }
  })
  return <pointLight ref={ref} position={[0, 1.55, 1.6]} intensity={4} color="#ffffff" distance={5} decay={2} />
}

// A portrait phone viewport has a much narrower horizontal FOV than a landscape
// one at the same vertical fov, which crops the logo tight. Pull the camera
// back a bit on very narrow/tall viewports so the composition still reads.
function ResponsiveCamera() {
  useFrame((state) => {
    const aspect = state.size.width / state.size.height
    const targetZ = aspect < 0.75 ? 12 : 9
    state.camera.position.z += (targetZ - state.camera.position.z) * 0.05
    if (state.camera instanceof THREE.PerspectiveCamera) {
      const fov = aspect < 0.75 ? 42 : 36
      if (Math.abs(state.camera.fov - fov) > 0.1) {
        state.camera.fov += (fov - state.camera.fov) * 0.08
        state.camera.updateProjectionMatrix()
      }
    }
  })
  return null
}

export default function HeroScene({ isTouch = false }: { isTouch?: boolean }) {
  const scrollRotation = useRef(0)

  return (
    <Canvas
      dpr={isTouch ? [1, 1.3] : [1, 1.6]}
      shadows={!isTouch}
      camera={{ position: [0, 1.1, 9], fov: 36 }}
      gl={{ antialias: !isTouch, alpha: true, powerPreference: 'high-performance' }}
      className="!absolute inset-0"
    >
      <color attach="background" args={['#08090B']} />
      <fog attach="fog" args={['#08090B', 9, 17]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 6, 5]} intensity={0.8} castShadow={!isTouch} shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-3, 0.5, 2]} intensity={6} color="#D71920" distance={8} decay={2} />

      <Suspense fallback={null}>
        <StudioLights />
        <SweepLight />
        <LogoModel scrollRotation={scrollRotation} scale={1} position={[0, 1.55, 0]} interactive={!isTouch} />
        <StreakParticles count={isTouch ? 20 : 36} color="#D71920" spread={[22, 12, 14]} />
        <StreakParticles count={isTouch ? 14 : 24} color="#ffffff" spread={[20, 10, 12]} speed={4} />
        <Grid
          position={[0, -2.35, 0]}
          args={[40, 40]}
          cellSize={0.6}
          cellThickness={0.5}
          cellColor="#3a1418"
          sectionSize={3}
          sectionThickness={1}
          sectionColor="#D71920"
          fadeDistance={16}
          fadeStrength={1.5}
          infiniteGrid
        />
        {!isTouch && (
          <ContactShadows position={[0, -2.3, 0]} opacity={0.55} scale={14} blur={2.4} far={4} color="#000000" />
        )}
      </Suspense>

      <Rig isTouch={isTouch} />
      <ResponsiveCamera />

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={isTouch ? 0.22 : 0.3}
          luminanceThreshold={0.8}
          luminanceSmoothing={0.2}
          mipmapBlur
          radius={0.5}
        />
        <Vignette eskil={false} offset={0.15} darkness={0.7} />
      </EffectComposer>
    </Canvas>
  )
}
