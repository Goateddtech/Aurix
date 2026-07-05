import { useMemo } from 'react'
import * as THREE from 'three'

// Martini glass matching the reference photo: wide conical bowl, thin stem,
// sugared rim, lemon-wheel garnish. Group origin at the base plate.
// Local landmarks (unscaled): bowl apex y≈0.99, rim y≈1.84.
export const GLASS = {
  APEX_Y: 1.02, // where the liquid cone is anchored
  LIQ_H: 0.78, // liquid cone height at fill = 1
  RIM_Y: 1.84,
  RIM_R: 0.95,
}

export function GlassModel({ mats, groupRef, liquidRef, bubblesRef }) {
  const liquidGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.84, 0.02, GLASS.LIQ_H, 48)
    // move the apex to the origin so scaling == filling a conical bowl
    g.translate(0, GLASS.LIQ_H / 2, 0)
    return g
  }, [])

  return (
    <group ref={groupRef} visible={false}>
      {/* base plate */}
      <mesh position={[0, 0.025, 0]} material={mats.glass}>
        <cylinderGeometry args={[0.55, 0.6, 0.05, 64]} />
      </mesh>
      {/* stem */}
      <mesh position={[0, 0.52, 0]} material={mats.glass}>
        <cylinderGeometry args={[0.045, 0.06, 0.95, 24]} />
      </mesh>
      {/* bowl (open cone) */}
      <mesh position={[0, 1.415, 0]} material={mats.glass} renderOrder={3}>
        <cylinderGeometry args={[0.95, 0.02, 0.85, 64, 1, true]} />
      </mesh>
      {/* liquid — scaling a cone from its apex is a physically-correct fill */}
      <mesh
        ref={liquidRef}
        geometry={liquidGeo}
        position={[0, GLASS.APEX_Y, 0]}
        scale={0.001}
        material={mats.liquid}
        renderOrder={2}
      />
      {/* rising bubbles */}
      <instancedMesh
        ref={bubblesRef}
        args={[undefined, undefined, 16]}
        frustumCulled={false}
        renderOrder={2}
      >
        <sphereGeometry args={[0.016, 6, 6]} />
        <primitive object={mats.bubble} attach="material" />
      </instancedMesh>
      {/* sugared rim */}
      <mesh position={[0, GLASS.RIM_Y, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.sugar}>
        <torusGeometry args={[0.95, 0.027, 12, 96]} />
      </mesh>
      {/* lemon wheel garnish */}
      <mesh
        position={[0.86, 1.8, 0.3]}
        rotation={[0.08, -0.55, 0.18]}
        material={mats.lemon}
      >
        <circleGeometry args={[0.27, 40]} />
      </mesh>
    </group>
  )
}
