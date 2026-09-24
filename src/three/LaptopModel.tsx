import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import HoloLayers from './HoloLayers'
import {
  makeCodeTexture,
  makeWebsiteTexture,
  makeKeyboardTexture,
  makeBrushedMetalTexture,
  makeGlareTexture,
} from './laptopTextures'

type LaptopModelProps = {
  progressRef: React.MutableRefObject<number>
  position?: [number, number, number]
}

export default function LaptopModel({ progressRef, position = [0, 0, 0] }: LaptopModelProps) {
  const group = useRef<THREE.Group>(null)
  const ring1 = useRef<THREE.Mesh>(null)
  const ring2 = useRef<THREE.Mesh>(null)
  const flash = useRef<THREE.PointLight>(null)
  const screenPivot = useRef<THREE.Group>(null)
  const codeMat = useRef<THREE.MeshBasicMaterial>(null)
  const websiteMat = useRef<THREE.MeshBasicMaterial>(null)
  const glareMat = useRef<THREE.MeshBasicMaterial>(null)

  const codeTexture = useMemo(() => makeCodeTexture(), [])
  const websiteTexture = useMemo(() => makeWebsiteTexture(), [])
  const keyboardTexture = useMemo(() => makeKeyboardTexture(), [])
  const brushedTexture = useMemo(() => makeBrushedMetalTexture(), [])
  const glareTexture = useMemo(() => makeGlareTexture(), [])

  useFrame((state) => {
    const p = progressRef.current
    const t = state.clock.elapsedTime
    const sm = THREE.MathUtils.smoothstep

    // Entrance: the mark collapses into a shockwave, the laptop materialises and its lid opens.
    const vis = sm(p, 0.36, 0.46) * (1 - sm(p, 0.9, 0.97))
    const open = sm(p, 0.4, 0.54)
    const shock = sm(p, 0.34, 0.5)
    const lift = sm(p, 0.54, 0.66) - sm(p, 0.68, 0.74)
    const fan = sm(p, 0.8, 0.88) - sm(p, 0.9, 0.95)

    if (group.current) {
      group.current.visible = vis > 0.001
      group.current.scale.setScalar(0.5 + vis * 0.5 + fan * 0.04)
      group.current.position.y = -(1 - vis) * 0.6 + Math.sin(t * 0.4) * 0.025 + lift * 0.05
      group.current.rotation.y =
        0.14 + Math.sin(t * 0.14) * 0.04 + state.pointer.x * 0.06 * vis - (1 - open) * 1.4 + lift * 0.5 - fan * 0.2
      group.current.rotation.x = -0.16 + -state.pointer.y * 0.03 * vis + lift * 0.06
    }

    if (screenPivot.current) {
      const closed = THREE.MathUtils.degToRad(88)
      screenPivot.current.rotation.x = THREE.MathUtils.lerp(closed, THREE.MathUtils.degToRad(-7), open)
    }

    if (ring1.current) {
      const m = ring1.current.material as THREE.MeshBasicMaterial
      ring1.current.visible = shock > 0.01 && shock < 0.999
      ring1.current.scale.setScalar(0.2 + shock * 2.6)
      ring1.current.rotation.set(Math.PI / 2 - 0.35, 0, t * 0.8)
      m.opacity = Math.sin(shock * Math.PI) * 0.95
    }
    if (ring2.current) {
      const m = ring2.current.material as THREE.MeshBasicMaterial
      ring2.current.visible = fan > 0.01 || lift > 0.01
      ring2.current.scale.setScalar(1.0 + fan * 0.12 + lift * 0.1)
      ring2.current.rotation.set(Math.PI / 2 - 0.5, t * 0.35, 0)
      m.opacity = Math.min(1, fan + lift) * 0.55
    }
    if (flash.current) flash.current.intensity = Math.sin(shock * Math.PI) * 26

    const codeOp = (1 - sm(p, 0.7, 0.78)) * (1 - lift * 0.55)
    const webOp = sm(p, 0.7, 0.78)
    if (codeMat.current) codeMat.current.opacity = codeOp * vis
    if (websiteMat.current) websiteMat.current.opacity = webOp * vis
    if (glareMat.current) glareMat.current.opacity = 0.5 * vis * open
  })

  return (
    <group position={position}>
      <pointLight ref={flash} color="#ff4048" intensity={0} distance={7} decay={2} position={[0, 0.6, 1.2]} />
      <mesh ref={ring1} visible={false}>
        <torusGeometry args={[1, 0.008, 8, 128]} />
        <meshBasicMaterial color="#ff3038" transparent opacity={0} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={ring2} visible={false} position={[0, 0.5, 0.4]}>
        <torusGeometry args={[1.7, 0.006, 8, 160]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    <group ref={group} rotation={[-0.16, 0.14, 0]}>
      {/* Base — thin unibody deck with soft rounded edges */}
      <RoundedBox args={[2.15, 0.055, 1.5]} radius={0.025} smoothness={4} position={[0, 0, 0.5]} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#3a3d44"
          metalness={0.88}
          roughness={0.38}
          roughnessMap={brushedTexture}
          envMapIntensity={1.3}
          clearcoat={0.4}
          clearcoatRoughness={0.25}
        />
      </RoundedBox>

      {/* Thin red edge accent along the front lip */}
      <mesh position={[0, -0.02, 1.245]}>
        <boxGeometry args={[2.1, 0.006, 0.006]} />
        <meshBasicMaterial color="#D71920" toneMapped={false} />
      </mesh>

      <mesh position={[0, 0.029, 0.28]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.72, 0.86]} />
        <meshBasicMaterial map={keyboardTexture} transparent />
      </mesh>

      <RoundedBox args={[0.72, 0.006, 0.46]} radius={0.02} smoothness={2} position={[0, 0.03, 0.94]}>
        <meshStandardMaterial color="#15171c" metalness={0.3} roughness={0.5} />
      </RoundedBox>

      {/* Screen — hinged at the back edge, already built "open" with the display
          facing +Z toward the camera; the pivot only adds a small live recline. */}
      <group ref={screenPivot} position={[0, 0.028, -0.24]}>
        <RoundedBox args={[2.15, 1.26, 0.045]} radius={0.03} smoothness={4} position={[0, 0.65, -0.02]} castShadow>
          <meshPhysicalMaterial
            color="#26292f"
            metalness={0.85}
            roughness={0.34}
            roughnessMap={brushedTexture}
            envMapIntensity={1.3}
            clearcoat={0.4}
            clearcoatRoughness={0.25}
          />
        </RoundedBox>

        {/* Camera notch */}
        <mesh position={[0, 1.235, 0.001]}>
          <circleGeometry args={[0.012, 16]} />
          <meshStandardMaterial color="#050505" metalness={0.2} roughness={0.6} />
        </mesh>

        <mesh position={[0, 0.65, 0.002]}>
          <planeGeometry args={[1.98, 1.19]} />
          <meshBasicMaterial color="#000000" />
        </mesh>

        <mesh position={[0, 0.65, 0.005]}>
          <planeGeometry args={[1.96, 1.17]} />
          <meshBasicMaterial ref={codeMat} map={codeTexture} transparent toneMapped={false} opacity={0} />
        </mesh>
        <mesh position={[0, 0.65, 0.007]}>
          <planeGeometry args={[1.96, 1.17]} />
          <meshBasicMaterial ref={websiteMat} map={websiteTexture} transparent toneMapped={false} opacity={0} />
        </mesh>

        {/* Glass glare overlay */}
        <mesh position={[0, 0.65, 0.009]}>
          <planeGeometry args={[1.96, 1.17]} />
          <meshBasicMaterial
            ref={glareMat}
            map={glareTexture}
            transparent
            opacity={0}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <pointLight position={[0, 0.65, 0.5]} intensity={1.1} color="#e8ecff" distance={2} decay={2} />
        <HoloLayers progressRef={progressRef} />
      </group>
    </group>
    </group>
  )
}
