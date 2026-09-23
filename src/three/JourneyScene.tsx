import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, Grid } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import LogoModel from './LogoModel'
import LaptopModel from './LaptopModel'
import FloatingPanels from './FloatingPanels'
import StreakParticles from './StreakParticles'

function JourneyRig({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const explode = useRef(0)
  const logoGroup = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    const p = progressRef.current

    // Camera: push in for the "eagle close-up" (~0.02-0.18), pull back to reveal the
    // grid (~0.2-0.4), settle into a laptop-framing shot (~0.4-0.86), then ease back
    // out for the business beat and the final return-to-brand shot.
    let targetZ = 9
    let targetY = 1.1
    let lookY = 1.3
    let targetX = 0
    if (p < 0.18) {
      const t = THREE.MathUtils.smoothstep(p, 0.02, 0.18)
      targetZ = THREE.MathUtils.lerp(9, 4.2, t)
      targetY = THREE.MathUtils.lerp(1.1, 1.55, t)
    } else if (p < 0.4) {
      const t = THREE.MathUtils.smoothstep(p, 0.2, 0.4)
      targetZ = THREE.MathUtils.lerp(4.2, 11, t)
      targetY = THREE.MathUtils.lerp(1.55, 2.4, t)
    } else if (p < 0.5) {
      const t = THREE.MathUtils.smoothstep(p, 0.4, 0.5)
      targetZ = THREE.MathUtils.lerp(11, 7.6, t)
      targetY = THREE.MathUtils.lerp(2.4, 1.55, t)
      lookY = THREE.MathUtils.lerp(1.3, 1.55, t)
    } else if (p < 0.86) {
      // A gentle breathing hold on the laptop — subtle z/y life without ever
      // drifting the framing off-center (the laptop itself sits at x=0 and
      // must read as centered).
      const orbitT = state.clock.elapsedTime
      targetZ = 7.6 + Math.sin(orbitT * 0.25) * 0.35
      targetY = 1.55 + Math.sin(orbitT * 0.18) * 0.1
      targetX = 0
      lookY = 1.55
    } else if (p < 0.94) {
      const t = THREE.MathUtils.smoothstep(p, 0.86, 0.94)
      targetZ = THREE.MathUtils.lerp(7.6, 9, t)
      targetY = THREE.MathUtils.lerp(1.55, 1.3, t)
      lookY = THREE.MathUtils.lerp(1.55, 1.3, t)
    } else {
      const t = THREE.MathUtils.smoothstep(p, 0.94, 1)
      targetZ = THREE.MathUtils.lerp(9, 7.5, t)
      targetY = THREE.MathUtils.lerp(1.3, 1.1, t)
      lookY = THREE.MathUtils.lerp(1.3, 1.3, t)
    }

    state.camera.position.z += (targetZ - state.camera.position.z) * Math.min(1, delta * 2.2)
    state.camera.position.y += (targetY - state.camera.position.y) * Math.min(1, delta * 2.2)
    state.camera.position.x += (targetX - state.camera.position.x) * Math.min(1, delta * 1.6)
    state.camera.lookAt(0, lookY, 0)

    // Explode peaks mid-deconstruction, resolves back to 0 (assembled) before the
    // laptop takes over, and stays assembled again for the final return-to-brand beat.
    let explodeTarget = 0
    if (p >= 0.18 && p < 0.3) {
      explodeTarget = THREE.MathUtils.smoothstep(p, 0.18, 0.3)
    } else if (p >= 0.3 && p < 0.4) {
      explodeTarget = 1 - THREE.MathUtils.smoothstep(p, 0.3, 0.4)
    }
    explode.current += (explodeTarget - explode.current) * Math.min(1, delta * 3)

    // Logo hides while the laptop/code/website/business beats own the screen,
    // then scales back up for the final "return to brand" beat.
    let logoScale = 1
    if (p >= 0.42 && p < 0.9) {
      logoScale = 0.0001
    } else if (p >= 0.9 && p < 1) {
      logoScale = THREE.MathUtils.smoothstep(p, 0.9, 1)
    }
    if (logoGroup.current) {
      logoGroup.current.scale.setScalar(logoScale)
    }
  })

  return (
    <group ref={logoGroup}>
      <LogoModel scale={1} position={[0, 1.55, 0]} explodeRef={explode} interactive={false} />
    </group>
  )
}

function StudioLights() {
  return (
    <Environment resolution={256}>
      <Lightformer intensity={1.3} rotation-x={Math.PI / 2} position={[0, 6, -2]} scale={[8, 8, 1]} color="#ffffff" />
      <Lightformer intensity={0.7} position={[-6, 2, 3]} scale={[6, 3, 1]} color="#ffffff" />
      <Lightformer intensity={1} position={[5, 1, 4]} scale={[4, 4, 1]} color="#ff5b5f" />
    </Environment>
  )
}

// A portrait phone viewport has a much narrower horizontal FOV than a landscape
// one at the same vertical fov, which crops the laptop/logo tight. Widen the
// fov and add a touch of base distance on very narrow/tall viewports.
function ResponsiveCamera() {
  const baseFov = useRef(36)
  useFrame((state) => {
    const aspect = state.size.width / state.size.height
    const fov = aspect < 0.75 ? 46 : 36
    if (state.camera instanceof THREE.PerspectiveCamera) {
      baseFov.current += (fov - baseFov.current) * 0.08
      if (Math.abs(state.camera.fov - baseFov.current) > 0.05) {
        state.camera.fov = baseFov.current
        state.camera.updateProjectionMatrix()
      }
    }
  })
  return null
}

export default function JourneyScene({
  progressRef,
  isTouch = false,
}: {
  progressRef: React.MutableRefObject<number>
  isTouch?: boolean
}) {
  return (
    <Canvas
      dpr={isTouch ? [1, 1.3] : [1, 1.5]}
      shadows={!isTouch}
      camera={{ position: [0, 1.1, 9], fov: 36 }}
      gl={{ antialias: !isTouch, alpha: true, powerPreference: 'high-performance' }}
      className="!absolute inset-0"
    >
      <color attach="background" args={['#08090B']} />
      <fog attach="fog" args={['#08090B', 9, 19]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 6, 5]} intensity={0.75} />
      <pointLight position={[-3, 0.5, 2]} intensity={5} color="#D71920" distance={9} decay={2} />

      <Suspense fallback={null}>
        <StudioLights />
        <JourneyRig progressRef={progressRef} />
        <LaptopModel progressRef={progressRef} position={[-0.3, 1.2, 0]} />
        <FloatingPanels progressRef={progressRef} />
        <StreakParticles count={isTouch ? 18 : 30} color="#D71920" spread={[22, 12, 14]} />
        <StreakParticles count={isTouch ? 12 : 20} color="#ffffff" spread={[20, 10, 12]} speed={4} />
        <Grid
          position={[0, -2.35, 0]}
          args={[40, 40]}
          cellSize={0.6}
          cellThickness={0.5}
          cellColor="#3a1418"
          sectionSize={3}
          sectionThickness={1}
          sectionColor="#D71920"
          fadeDistance={18}
          fadeStrength={1.5}
          infiniteGrid
        />
      </Suspense>

      <ResponsiveCamera />

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={isTouch ? 0.2 : 0.3}
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
