// Procedural AURIX can: stubby 187ml-style body, matte-black label wrap,
// brushed-copper rim/lid, dark pull tab. Dimensions in world units.
export const CAN = {
  R: 0.52, // body radius
  HALF: 0.71, // half height (bottom cap → rim top)
}

export function CanModel({ mats, innerRef }) {
  return (
    // Base rotation faces the label artwork (texture u=0.5) toward the camera.
    <group ref={innerRef} rotation={[0, Math.PI, 0]}>
      {/* body */}
      <mesh material={mats.label}>
        <cylinderGeometry args={[0.52, 0.52, 1.18, 96, 1, true]} />
      </mesh>
      {/* neck taper up to the rim */}
      <mesh position={[0, 0.65, 0]} material={mats.dark}>
        <cylinderGeometry args={[0.445, 0.52, 0.12, 96, 1, true]} />
      </mesh>
      {/* copper seam rim (rotated to lie flat) */}
      <mesh position={[0, 0.715, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.copper}>
        <torusGeometry args={[0.435, 0.024, 16, 96]} />
      </mesh>
      {/* lid */}
      <mesh position={[0, 0.7, 0]} material={mats.copper}>
        <cylinderGeometry args={[0.43, 0.43, 0.028, 96]} />
      </mesh>
      {/* pull tab */}
      <mesh position={[0.1, 0.722, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.tab}>
        <torusGeometry args={[0.082, 0.016, 12, 40]} />
      </mesh>
      <mesh position={[-0.03, 0.722, 0]} material={mats.tab}>
        <boxGeometry args={[0.1, 0.01, 0.055]} />
      </mesh>
      {/* bottom taper + cap */}
      <mesh position={[0, -0.64, 0]} material={mats.dark}>
        <cylinderGeometry args={[0.52, 0.43, 0.1, 96, 1, true]} />
      </mesh>
      <mesh position={[0, -0.695, 0]} material={mats.dark}>
        <cylinderGeometry args={[0.43, 0.43, 0.024, 96]} />
      </mesh>
    </group>
  )
}
