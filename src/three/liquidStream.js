import * as THREE from 'three'

// Curved, tapering pour stream. A quadratic bezier from the can mouth to the
// liquid surface, skinned per frame into a fixed-size tube buffer — no
// per-frame geometry allocation. Radius follows conservation of mass
// (narrower as it falls) with a traveling ripple so the surface reads liquid.

export const STREAM = {
  RINGS: 26,
  RADIAL: 10,
}

export function createStreamGeometry() {
  const { RINGS, RADIAL } = STREAM
  const count = (RINGS + 1) * (RADIAL + 1)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  const uv = new Float32Array(count * 2)
  for (let i = 0; i <= RINGS; i++) {
    for (let j = 0; j <= RADIAL; j++) {
      const k = (i * (RADIAL + 1) + j) * 2
      uv[k] = j / RADIAL
      uv[k + 1] = i / RINGS // v runs mouth -> impact
    }
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  const idx = []
  for (let i = 0; i < RINGS; i++) {
    for (let j = 0; j < RADIAL; j++) {
      const a = i * (RADIAL + 1) + j
      const b = a + RADIAL + 1
      idx.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }
  geo.setIndex(idx)
  return geo
}

const _p = new THREE.Vector3()
const _tan = new THREE.Vector3()
const _n1 = new THREE.Vector3()
const _n2 = new THREE.Vector3()
const _ref = new THREE.Vector3(1, 0, 0)

/**
 * @param geo   geometry from createStreamGeometry()
 * @param curve THREE.QuadraticBezierCurve3 (already positioned in world space)
 * @param baseR radius at the can mouth
 * @param tipR  radius at the impact point
 * @param time  seconds — drives the traveling ripple
 * @param amp   ripple amplitude 0..~0.2
 */
export function updateStreamGeometry(geo, curve, baseR, tipR, time, amp) {
  const { RINGS, RADIAL } = STREAM
  const pos = geo.attributes.position.array
  const nor = geo.attributes.normal.array
  let k = 0
  for (let i = 0; i <= RINGS; i++) {
    const s = i / RINGS
    curve.getPoint(s, _p)
    curve.getTangent(s, _tan).normalize()
    _n1.crossVectors(_tan, _ref)
    if (_n1.lengthSq() < 1e-4) _n1.set(0, 0, 1)
    _n1.normalize()
    _n2.crossVectors(_tan, _n1).normalize()
    // mass conservation taper + a ripple that travels down the stream,
    // growing as it falls (sheet breaks up near the bottom)
    const ripple = 1 + Math.sin(s * 16 - time * 11) * amp * (0.3 + 0.7 * s)
    const r = THREE.MathUtils.lerp(baseR, tipR, Math.pow(s, 0.72)) * ripple
    for (let j = 0; j <= RADIAL; j++) {
      const a = (j / RADIAL) * Math.PI * 2
      const ca = Math.cos(a)
      const sa = Math.sin(a)
      pos[k] = _p.x + (_n1.x * ca + _n2.x * sa) * r
      pos[k + 1] = _p.y + (_n1.y * ca + _n2.y * sa) * r
      pos[k + 2] = _p.z + (_n1.z * ca + _n2.z * sa) * r
      nor[k] = _n1.x * ca + _n2.x * sa
      nor[k + 1] = _n1.y * ca + _n2.y * sa
      nor[k + 2] = _n1.z * ca + _n2.z * sa
      k += 3
    }
  }
  geo.attributes.position.needsUpdate = true
  geo.attributes.normal.needsUpdate = true
  geo.computeBoundingSphere()
}
