import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import Scene from './Scene'

export default function HeroScene({ onReady }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ fov: 34, near: 0.1, far: 50, position: [0, 0.5, 7.1] }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 0.95
      }}
    >
      <color attach="background" args={['#0B0B0B']} />
      <fog attach="fog" args={['#0B0B0B', 9, 17]} />

      {/* warm key spot from above-front (physical units: candela) */}
      <spotLight
        position={[0.8, 5.2, 3.6]}
        angle={0.55}
        penumbra={1}
        intensity={280}
        color="#FFD9A8"
        decay={2}
      />
      {/* copper rim light from behind */}
      <pointLight position={[-2.6, 1.4, -2.6]} intensity={70} color="#C08552" decay={2} />
      {/* faint warm fill near the glass's final position */}
      <pointLight position={[1.8, 0.4, 3.6]} intensity={20} color="#F2B14D" decay={2} />
      <ambientLight intensity={0.32} color="#332A22" />

      <Suspense fallback={null}>
        {/* local lightformer env — drives the copper reflections, no HDR fetch */}
        <Environment resolution={256} frames={1}>
          <Lightformer
            form="rect"
            intensity={4}
            color="#FFDCAE"
            position={[0, 4, -2]}
            scale={[6, 3, 1]}
          />
          <Lightformer
            form="rect"
            intensity={1.6}
            color="#C08552"
            position={[-4, 1, 2]}
            rotation-y={Math.PI / 2}
            scale={[4, 1.5, 1]}
          />
          <Lightformer
            form="rect"
            intensity={1.2}
            color="#F2B14D"
            position={[4, 0.5, 3]}
            rotation-y={-Math.PI / 2}
            scale={[3, 1, 1]}
          />
          <Lightformer
            form="rect"
            intensity={0.5}
            color="#2A211A"
            position={[0, -4, 0]}
            rotation-x={Math.PI / 2}
            scale={[8, 8, 1]}
          />
        </Environment>
        <Scene onReady={onReady} />
      </Suspense>
    </Canvas>
  )
}
