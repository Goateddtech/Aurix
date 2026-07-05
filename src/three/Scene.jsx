import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { heroScroll, clamp01 } from '../lib/scrollState'
import { CanModel } from './CanModel'
import { GlassModel, GLASS } from './GlassModel'
import {
  createLabelTexture,
  createMarbleTexture,
  createLemonTexture,
  createGlowTexture,
  createShadowTexture,
} from './textures'

/* ---------- timing / easing ---------- */
const nrm = (p, a, b) => clamp01((p - a) / (b - a))
const ss = (x, a, b) => THREE.MathUtils.smoothstep(x, a, b)
const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
// sharper in/out for the second, "accelerated" tumble
const easeIO2 = (t) =>
  t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2
const DEG = Math.PI / 180

/* ---------- stage boundaries (fractions of hero scroll) ----------
   A idle 0–.06 · B tumble#1 .06–.38 · C tumble#2 .38–.60 · D pour .60–1 */
const B0 = 0.06, B1 = 0.38, C1 = 0.6

const GLASS_POS = new THREE.Vector3(0.68, -1.55, 2.25)
const GLASS_SCALE = 0.82
const FILL_MAX = 0.86 // stop just below the sugared rim

/* ---------- motion tracks (keyframed on p, smoothstepped per segment) ---------- */
const K = (p, x, y, z) => ({ p, v: new THREE.Vector3(x, y, z) })
const CAN_KEYS = [
  K(B0, 0, -0.11, 0),
  K(B1, 0, 0.05, 1.05),
  K(C1, -0.55, 0.72, 1.9),
  K(0.72, -0.15, 1.08, 2.25), // pour station
  K(0.945, -0.15, 1.08, 2.25),
  K(1.0, -0.62, 1.8, 2.3), // exit up-left
]
const CAM_POS = [
  K(0, 0, 0.55, 7.75),
  K(B1, 0, 0.38, 6.6),
  K(C1, 0, 0.3, 6.2),
  K(0.8, 0.22, 0.02, 6.0),
  K(1, 0.3, -0.18, 6.05),
]
const CAM_TGT = [
  K(0, 0, -0.34, 0),
  K(B1, 0, 0.2, 1.05),
  K(C1, -0.42, 0.6, 1.9),
  K(0.8, 0.3, -0.1, 2.2),
  K(1, 0.66, -0.6, 2.25),
]

function track(p, keys, out) {
  if (p <= keys[0].p) return out.copy(keys[0].v)
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i]
    const b = keys[i + 1]
    if (p <= b.p) return out.lerpVectors(a.v, b.v, ss(nrm(p, a.p, b.p), 0, 1))
  }
  return out.copy(keys[keys.length - 1].v)
}

/* scratch vectors — no per-frame allocation */
const _v1 = new THREE.Vector3()
const _v2 = new THREE.Vector3()
const _v3 = new THREE.Vector3()
const _dir = new THREE.Vector3()
const _down = new THREE.Vector3(0, -1, 0)
const _m = new THREE.Matrix4()
const _q = new THREE.Quaternion()
const _s = new THREE.Vector3()

export default function Scene({ onReady }) {
  const canGroup = useRef()
  const canInner = useRef()
  const pedGroup = useRef()
  const glassGroup = useRef()
  const liquidRef = useRef()
  const bubblesRef = useRef()
  const streamRef = useRef()
  const dropsRef = useRef()
  const bokehGroup = useRef()

  const spin = useRef(0)
  const cur = useRef(0)
  const ready = useRef(false)

  /* ---------- textures & materials (created once) ---------- */
  const tex = useMemo(
    () => ({
      label: createLabelTexture(),
      marble: createMarbleTexture(),
      lemon: createLemonTexture(),
      glow: createGlowTexture(),
      shadow: createShadowTexture(),
    }),
    []
  )

  const mats = useMemo(() => {
    const label = new THREE.MeshStandardMaterial({
      map: tex.label,
      roughness: 0.62,
      metalness: 0.12,
      envMapIntensity: 0.32,
      transparent: true,
    })
    const copper = new THREE.MeshStandardMaterial({
      color: '#C08552',
      metalness: 1,
      roughness: 0.26,
      envMapIntensity: 1.3,
      transparent: true,
    })
    const dark = new THREE.MeshStandardMaterial({
      color: '#100E0D',
      roughness: 0.55,
      metalness: 0.25,
      envMapIntensity: 0.4,
      transparent: true,
    })
    const tab = new THREE.MeshStandardMaterial({
      color: '#1B1917',
      metalness: 0.9,
      roughness: 0.35,
      transparent: true,
    })
    const glass = new THREE.MeshPhysicalMaterial({
      color: '#D8DFDE',
      transparent: true,
      opacity: 0.16,
      roughness: 0.06,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.4,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    const liquid = new THREE.MeshPhysicalMaterial({
      color: '#E5A94E',
      transparent: true,
      opacity: 0.88,
      roughness: 0.1,
      metalness: 0,
      emissive: '#5A360D',
      emissiveIntensity: 0.55,
      depthWrite: false,
    })
    const sugar = new THREE.MeshStandardMaterial({
      color: '#F5F1EA',
      roughness: 0.95,
      metalness: 0,
      transparent: true,
    })
    const lemon = new THREE.MeshStandardMaterial({
      map: tex.lemon,
      roughness: 0.65,
      emissive: '#6B5217',
      emissiveIntensity: 0.35,
      side: THREE.DoubleSide,
      transparent: true,
    })
    const bubble = new THREE.MeshBasicMaterial({
      color: '#FFE7B0',
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    })
    const stream = new THREE.MeshStandardMaterial({
      color: '#F2B14D',
      emissive: '#B06F1E',
      emissiveIntensity: 0.5,
      roughness: 0.15,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    })
    const marble = new THREE.MeshStandardMaterial({
      map: tex.marble,
      roughness: 0.38,
      metalness: 0.3,
      envMapIntensity: 0.5,
      transparent: true,
    })
    const shadow = new THREE.MeshBasicMaterial({
      map: tex.shadow,
      transparent: true,
      depthWrite: false,
    })
    return { label, copper, dark, tab, glass, liquid, sugar, lemon, bubble, stream, marble, shadow }
  }, [tex])

  const canMats = useMemo(
    () => [mats.label, mats.copper, mats.dark, mats.tab],
    [mats]
  )
  // material -> base opacity for the glass assembly
  const glassMats = useMemo(
    () => [
      [mats.glass, 0.16],
      [mats.sugar, 1],
      [mats.lemon, 1],
      [mats.liquid, 0.88],
    ],
    [mats]
  )

  // unit-height stream cylinder with its TOP at the origin, hanging along -Y —
  // position it at the can mouth and scale.y to the fall distance
  const streamGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.032, 0.02, 1, 12, 1)
    g.translate(0, -0.5, 0)
    return g
  }, [])

  const bokeh = useMemo(() => {
    const items = []
    for (let i = 0; i < 14; i++) {
      items.push({
        pos: [
          (Math.random() - 0.5) * 9,
          -1 + Math.random() * 3.8,
          -2.5 - Math.random() * 2.5,
        ],
        scale: 0.35 + Math.random() * 1.5,
        opacity: 0.06 + Math.random() * 0.13,
        speed: 0.2 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
      })
    }
    return items
  }, [])

  const drops = useMemo(
    () =>
      Array.from({ length: 22 }, () => ({
        phase: Math.random(),
        jx: (Math.random() - 0.5) * 0.09,
        jz: (Math.random() - 0.5) * 0.09,
        s: 0.5 + Math.random() * 0.8,
      })),
    []
  )
  const bubbles = useMemo(
    () =>
      Array.from({ length: 16 }, () => ({
        a: Math.random() * Math.PI * 2,
        r: Math.random(),
        speed: 0.25 + Math.random() * 0.45,
        phase: Math.random(),
      })),
    []
  )

  /* ---------- per-frame choreography ---------- */
  useFrame((state, delta) => {
    if (!ready.current) {
      ready.current = true
      onReady && onReady()
    }
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime

    // damped scroll progress — everything below is a pure function of p
    cur.current = heroScroll.forced
      ? heroScroll.p
      : THREE.MathUtils.damp(cur.current, heroScroll.p, 6, dt)
    const p = cur.current

    const t1 = easeIO(nrm(p, B0, B1))
    const t2 = easeIO2(nrm(p, B1, C1))
    const t3 = nrm(p, C1, 1)
    const tilt = ss(t3, 0.02, 0.3)
    const pourK = ss(t3, 0.24, 0.34) * (1 - ss(t3, 0.76, 0.85))
    const fill = ss(t3, 0.3, 0.78) * FILL_MAX
    const glassT = ss(t3, 0.03, 0.2)
    const canFade = 1 - ss(t3, 0.83, 0.95)

    /* can */
    const can = canGroup.current
    if (can) {
      track(p, CAN_KEYS, can.position)
      can.rotation.z = -(t1 + t2) * Math.PI * 2 - tilt * 112 * DEG
      can.scale.setScalar(1 + 0.08 * ss(p, B0, C1))
      canMats.forEach((m) => (m.opacity = canFade))
      can.visible = canFade > 0.01
    }
    // idle Y auto-spin (~20s/rev), eased out as the pour begins
    spin.current += dt * ((Math.PI * 2) / 20) * (1 - ss(t3, 0.02, 0.25))
    if (canInner.current) canInner.current.rotation.y = Math.PI + spin.current

    /* pedestal — fades and sinks away as the can tumbles off */
    const ped = pedGroup.current
    if (ped) {
      const pedO = 1 - ss(p, 0.1, 0.3)
      ped.visible = pedO > 0.01
      ped.position.y = -0.95 - (1 - pedO) * 0.55
      mats.marble.opacity = pedO
      mats.shadow.opacity = pedO * 0.85
    }

    /* glass */
    const glass = glassGroup.current
    if (glass) {
      glass.visible = p > 0.585
      glass.position.copy(GLASS_POS)
      glass.scale.setScalar(GLASS_SCALE * (0.78 + 0.22 * glassT))
      glassMats.forEach(([m, base]) => (m.opacity = base * glassT))
      if (liquidRef.current) {
        liquidRef.current.scale.setScalar(Math.max(fill, 0.001))
      }
      // rising bubbles once there's liquid to rise through
      if (bubblesRef.current) {
        const im = bubblesRef.current
        const active = fill > 0.25 && glassT > 0.5
        mats.bubble.opacity = active ? 0.45 * glassT : 0
        for (let i = 0; i < bubbles.length; i++) {
          const b = bubbles[i]
          if (!active) {
            _s.setScalar(0.0001)
            _m.compose(_v1.set(0, 0, 0), _q.identity(), _s)
          } else {
            const prog = (t * b.speed + b.phase) % 1
            const y = GLASS.APEX_Y + 0.06 + prog * (GLASS.LIQ_H * fill - 0.1)
            const maxR = 0.8 * ((y - GLASS.APEX_Y) / GLASS.LIQ_H)
            const r = b.r * Math.max(maxR, 0)
            _v1.set(Math.cos(b.a) * r, y, Math.sin(b.a) * r)
            _m.compose(_v1, _q.identity(), _s.setScalar(0.6 + 0.5 * b.r))
          }
          im.setMatrixAt(i, _m)
        }
        im.instanceMatrix.needsUpdate = true
      }
    }

    /* pour stream: from can mouth down to the liquid surface */
    const stream = streamRef.current
    const surfaceY =
      GLASS_POS.y + (GLASS.APEX_Y + GLASS.LIQ_H * fill) * GLASS_SCALE
    if (stream && can) {
      if (pourK > 0.01) {
        stream.visible = true
        _v1.set(0.3, 0.72, 0) // can mouth, canGroup-local (excludes Y spin)
        can.localToWorld(_v1)
        _v2.set(GLASS_POS.x, surfaceY, GLASS_POS.z)
        _dir.subVectors(_v2, _v1)
        const len = Math.max(_dir.length(), 0.001)
        _dir.normalize()
        stream.position.copy(_v1)
        stream.quaternion.setFromUnitVectors(_down, _dir)
        const wobble = 1 + Math.sin(t * 21) * 0.07
        stream.scale.set(pourK * wobble, len, pourK * wobble)
        mats.stream.opacity = 0.9 * pourK
      } else {
        stream.visible = false
      }
    }

    /* droplets along the stream */
    if (dropsRef.current && can) {
      const im = dropsRef.current
      const active = pourK > 0.25
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i]
        if (!active) {
          _m.compose(_v3.set(0, -50, 0), _q.identity(), _s.setScalar(0.0001))
        } else {
          _v1.set(0.3, 0.72, 0)
          can.localToWorld(_v1)
          const prog = (t * 1.4 + d.phase) % 1
          _v3.set(
            _v1.x + d.jx * (0.4 + prog) + (GLASS_POS.x - _v1.x) * prog * 0.9,
            _v1.y + (surfaceY - _v1.y) * prog,
            _v1.z + d.jz * (0.4 + prog)
          )
          _m.compose(_v3, _q.identity(), _s.setScalar(d.s * pourK))
        }
        im.setMatrixAt(i, _m)
      }
      im.instanceMatrix.needsUpdate = true
    }

    /* bokeh drift (the group also holds the two static ambient pools) */
    if (bokehGroup.current) {
      const kids = bokehGroup.current.children
      const n = Math.min(kids.length, bokeh.length)
      for (let i = 0; i < n; i++) {
        const b = bokeh[i]
        kids[i].position.y = b.pos[1] + Math.sin(t * b.speed + b.phase) * 0.18
      }
    }

    /* camera */
    track(p, CAM_POS, state.camera.position)
    state.camera.lookAt(track(p, CAM_TGT, _v2))
  })

  return (
    <>
      {/* can */}
      <group ref={canGroup} position={[0, -0.11, 0]}>
        <CanModel mats={mats} innerRef={canInner} />
      </group>

      {/* marble pedestal + faux contact shadow */}
      <group ref={pedGroup} position={[0, -0.95, 0]}>
        <mesh material={mats.marble}>
          <cylinderGeometry args={[1.45, 1.52, 0.24, 96]} />
        </mesh>
        <mesh position={[0, 0.121, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.copper}>
          <torusGeometry args={[1.46, 0.012, 8, 128]} />
        </mesh>
        <mesh position={[0, 0.126, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.shadow}>
          <planeGeometry args={[2.6, 2.6]} />
        </mesh>
      </group>

      {/* bar-top floor */}
      <mesh position={[0, -1.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[16, 48]} />
        <meshStandardMaterial
          color="#0C0A09"
          roughness={0.4}
          metalness={0.65}
          envMapIntensity={0.55}
        />
      </mesh>

      {/* martini glass */}
      <GlassModel
        mats={mats}
        groupRef={glassGroup}
        liquidRef={liquidRef}
        bubblesRef={bubblesRef}
      />

      {/* pour stream (unit cylinder, top at origin, hangs along -Y) */}
      <mesh
        ref={streamRef}
        geometry={streamGeo}
        visible={false}
        material={mats.stream}
        frustumCulled={false}
        renderOrder={1}
      />

      {/* droplets */}
      <instancedMesh ref={dropsRef} args={[undefined, undefined, 22]} frustumCulled={false} renderOrder={1}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial
          color="#F2B14D"
          emissive="#B06F1E"
          emissiveIntensity={0.5}
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </instancedMesh>

      {/* warm bokeh orbs */}
      <group ref={bokehGroup}>
        {bokeh.map((b, i) => (
          <sprite key={i} position={b.pos} scale={[b.scale, b.scale, 1]}>
            <spriteMaterial
              map={tex.glow}
              color="#F2B14D"
              transparent
              opacity={b.opacity}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              fog={false}
            />
          </sprite>
        ))}
        {/* two broad ambient pools of light behind the set */}
        <sprite position={[-2.2, -0.4, -4]} scale={[7, 5, 1]}>
          <spriteMaterial
            map={tex.glow}
            color="#F2B14D"
            transparent
            opacity={0.05}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            fog={false}
          />
        </sprite>
        <sprite position={[2.6, 1.4, -4.5]} scale={[6, 4.5, 1]}>
          <spriteMaterial
            map={tex.glow}
            color="#E8A34A"
            transparent
            opacity={0.04}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            fog={false}
          />
        </sprite>
      </group>
    </>
  )
}
