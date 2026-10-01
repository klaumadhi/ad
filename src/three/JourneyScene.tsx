import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Grid, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import LogoModel from './LogoModel'
import LaptopModel from './LaptopModel'
import StreakParticles from './StreakParticles'
import { StudioLights } from './Studio'
import { useInView } from '../hooks/useInView'

function JourneyRig({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const explode = useRef(0)
  const code = useRef(0)
  const genie = useRef(0)
  const logoGroup = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    const p = progressRef.current

    // Camera: push in for the "eagle close-up" (~0.02-0.18), pull back to reveal the
    // grid (~0.2-0.4), settle into a laptop-framing shot (~0.4-0.86), then ease back
    // out for the business beat and the final return-to-brand shot.
    const sm = THREE.MathUtils.smoothstep
    let targetZ = 9
    let targetY = 1.1
    let lookY = 1.3
    if (p < 0.14) {
      const t = sm(p, 0.0, 0.14)
      targetZ = THREE.MathUtils.lerp(9, 4.4, t)
      targetY = THREE.MathUtils.lerp(1.1, 1.55, t)
    } else if (p < 0.36) {
      // Pull back through the split and settle toward the laptop framing.
      // stay close while the logo is typed out as code so the characters read, then pull back
      const t = sm(p, 0.26, 0.36)
      targetZ = THREE.MathUtils.lerp(4.6, 7.4, t)
      targetY = THREE.MathUtils.lerp(1.55, 1.5, t)
      lookY = THREE.MathUtils.lerp(1.3, 1.45, t)
    } else if (p < 0.9) {
      const orbitT = state.clock.elapsedTime
      const lift = sm(p, 0.54, 0.66) - sm(p, 0.68, 0.74)
      const fan = sm(p, 0.8, 0.88) - sm(p, 0.9, 0.95)
      // stay close through the genie suction, then ease back as the laptop opens
      const pull = sm(p, 0.4, 0.54)
      targetZ = THREE.MathUtils.lerp(5.0, 7.4, pull) + Math.sin(orbitT * 0.25) * 0.2 + lift * 0.9 + fan * 1.6
      targetY = THREE.MathUtils.lerp(1.6, 2.15, pull) + Math.sin(orbitT * 0.18) * 0.06 + lift * 0.1
      lookY = THREE.MathUtils.lerp(1.4, 1.25, pull)
    } else {
      const t = sm(p, 0.9, 1)
      targetZ = THREE.MathUtils.lerp(9, 7.5, t)
      targetY = THREE.MathUtils.lerp(1.3, 1.1, t)
      lookY = 1.3
    }

    state.camera.position.z += (targetZ - state.camera.position.z) * Math.min(1, delta * 3.2)
    state.camera.position.y += (targetY - state.camera.position.y) * Math.min(1, delta * 3.2)
    state.camera.lookAt(0, lookY, 0)

    // Explode peaks mid-deconstruction, resolves back to 0 (assembled) before the
    // laptop takes over, and stays assembled again for the final return-to-brand beat.
    // The logo is typed out as code, row by row (p 0.10 → 0.33); no separation, so the mark stays whole
    // until it is entirely text and then folds into the laptop.
    explode.current = 0
    // typed out as code (0.10→0.33), held a beat, then sucked into the laptop like a genie into its lamp
    // (0.36→0.47); on the way out it pours back out of the laptop (0.90→0.97) and reads as the logo again.
    code.current = p < 0.6 ? sm(p, 0.1, 0.33) : 1 - sm(p, 0.95, 1.0)
    genie.current = p < 0.6 ? sm(p, 0.36, 0.47) : 1 - sm(p, 0.9, 0.97)

    if (logoGroup.current) logoGroup.current.scale.setScalar(1)
  })

  return (
    <group ref={logoGroup}>
      <LogoModel scale={1} position={[0, 1.55, 0]} explodeRef={explode} codeRef={code} genieRef={genie} interactive={false} />
    </group>
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
  const [wrapRef, inView] = useInView<HTMLDivElement>()
  return (
    <div ref={wrapRef} className="absolute inset-0">
    <Canvas
      frameloop={inView ? 'always' : 'never'}
      dpr={isTouch ? [1.5, 2] : [1, 1.4]}
      shadows={!isTouch}
      camera={{ position: [0, 1.1, 9], fov: 36 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      className="!absolute inset-0"
    >
      <fog attach="fog" args={['#eef1fb', 11, 26]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 6, 5]} intensity={1.1} />
      <pointLight position={[-3, 0.5, 2]} intensity={4} color="#6f63ff" distance={9} decay={2} />

      <Suspense fallback={null}>
        <StudioLights />
        <JourneyRig progressRef={progressRef} />
        <LaptopModel progressRef={progressRef} position={[-0.3, 1.2, 0]} />
        <StreakParticles count={isTouch ? 14 : 24} color="#5b4cff" spread={[22, 12, 14]} opacity={0.28} />
        <StreakParticles count={isTouch ? 10 : 18} color="#17b3f2" spread={[20, 10, 12]} speed={4} opacity={0.32} />
        <Grid
          position={[0, -2.35, 0]}
          args={[40, 40]}
          cellSize={0.6}
          cellThickness={0.5}
          cellColor="#cdd4f0"
          sectionSize={3}
          sectionThickness={1}
          sectionColor="#9d94ff"
          fadeDistance={18}
          fadeStrength={1.5}
          infiniteGrid
        />
        {!isTouch && <ContactShadows position={[0, -2.3, 0]} opacity={0.3} scale={14} blur={2.8} far={4} color="#3a2fb8" />}
      </Suspense>

      <ResponsiveCamera />

    </Canvas>
    </div>
  )
}
