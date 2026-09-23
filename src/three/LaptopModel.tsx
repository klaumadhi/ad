import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
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

    let vis = 0
    if (p >= 0.42 && p < 0.5) vis = THREE.MathUtils.smoothstep(p, 0.42, 0.5)
    else if (p >= 0.5 && p < 0.86) vis = 1
    else if (p >= 0.86 && p < 0.92) vis = 1 - THREE.MathUtils.smoothstep(p, 0.86, 0.92)

    if (group.current) {
      group.current.visible = vis > 0.001
      const s = 0.86 + vis * 0.14
      group.current.scale.setScalar(s)
      group.current.position.y = position[1] - (1 - vis) * 0.5 + Math.sin(t * 0.4) * 0.025
      group.current.rotation.y = 0.14 + Math.sin(t * 0.14) * 0.04 + state.pointer.x * 0.06 * vis
      group.current.rotation.x = -0.16 + -state.pointer.y * 0.03 * vis
    }

    if (screenPivot.current) {
      screenPivot.current.rotation.x = THREE.MathUtils.degToRad(-7) * THREE.MathUtils.clamp(vis, 0, 1)
    }

    let codeOp = 0
    let webOp = 0
    if (p < 0.68) codeOp = 1
    else if (p < 0.76) {
      codeOp = 1 - THREE.MathUtils.smoothstep(p, 0.68, 0.76)
      webOp = THREE.MathUtils.smoothstep(p, 0.68, 0.76)
    } else {
      webOp = 1
    }
    if (codeMat.current) codeMat.current.opacity = codeOp * vis
    if (websiteMat.current) websiteMat.current.opacity = webOp * vis
    if (glareMat.current) glareMat.current.opacity = 0.5 * vis
  })

  return (
    <group ref={group} position={position} rotation={[-0.16, 0.14, 0]}>
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
      </group>
    </group>
  )
}
