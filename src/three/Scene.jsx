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
  createStreamTexture,
} from './textures'
import { createStreamGeometry, updateStreamGeometry } from './liquidStream'

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
  K(0, 0, 0.45, 8.15),
  K(B1, 0, 0.38, 6.6),
  K(C1, 0, 0.3, 6.2),
  K(0.8, 0.22, 0.02, 6.0),
  K(1, 0.3, -0.18, 6.05),
]
const CAM_TGT = [
  K(0, 0, 0.02, 0),
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
const _m = new THREE.Matrix4()
const _q = new THREE.Quaternion()
const _s = new THREE.Vector3()

export default function Scene({ onReady }) {
  const canGroup = useRef()
  const canInner = useRef()
  const pedGroup = useRef()
  const glassGroup = useRef()
  const liquidRef = useRef()
  const meniscusRef = useRef()
  const bubblesRef = useRef()
  const streamRef = useRef()
  const streamCoreRef = useRef()
  const dropsRef = useRef()
  const splashRef = useRef()
  const rippleARef = useRef()
  const rippleBRef = useRef()
  const frothRef = useRef()
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
      stream: createStreamTexture(),
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
    // translucent golden apéritif — light passes through it (transmission),
    // tinted on the way (attenuation), warmed faintly from within (emissive)
    const liquid = new THREE.MeshPhysicalMaterial({
      color: '#F6C468',
      transparent: true,
      opacity: 0.97,
      transmission: 0.52,
      thickness: 0.85,
      ior: 1.34,
      attenuationColor: '#B06A12',
      attenuationDistance: 0.9,
      roughness: 0.1,
      metalness: 0,
      clearcoat: 0.35,
      clearcoatRoughness: 0.15,
      emissive: '#7A4A10',
      emissiveIntensity: 0.68,
      depthWrite: false,
    })
    // wet highlight where the liquid meets the glass wall
    const meniscus = new THREE.MeshBasicMaterial({
      color: '#FFDF9E',
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
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
    // pour stream: translucent water-gold body with scrolling broken
    // filaments (alphaMap) so it reads as moving liquid, not a solid rod
    const stream = new THREE.MeshStandardMaterial({
      color: '#F7CE7B',
      emissive: '#8A5514',
      emissiveIntensity: 0.7,
      roughness: 0.16,
      metalness: 0,
      transparent: true,
      opacity: 0,
      alphaMap: tex.stream,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    // bright glassy core inside the stream
    const streamCore = new THREE.MeshBasicMaterial({
      color: '#FFE2A6',
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    // droplets kicked up where the stream hits the surface
    const splash = new THREE.MeshStandardMaterial({
      color: '#F8D488',
      emissive: '#A96E1C',
      emissiveIntensity: 0.5,
      roughness: 0.2,
      transparent: true,
      opacity: 0.75,
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
    return {
      label, copper, dark, tab, glass, liquid, meniscus, sugar, lemon,
      bubble, stream, streamCore, splash, marble, shadow,
    }
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
      [mats.liquid, 0.97],
    ],
    [mats]
  )

  // curved pour stream: outer translucent tube + bright inner core,
  // both skinned per frame along one bezier (no allocation in the loop)
  const streamGeo = useMemo(() => createStreamGeometry(), [])
  const streamCoreGeo = useMemo(() => createStreamGeometry(), [])
  const streamCurve = useMemo(
    () =>
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3()
      ),
    []
  )

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
      Array.from({ length: 24 }, () => ({
        a: Math.random() * Math.PI * 2,
        r: Math.random(),
        speed: 0.25 + Math.random() * 0.45,
        phase: Math.random(),
      })),
    []
  )
  // splash crown — droplets that kick up and out where the stream lands
  const splashes = useMemo(
    () =>
      Array.from({ length: 14 }, () => ({
        a: Math.random() * Math.PI * 2,
        r: 0.5 + Math.random() * 0.5,
        h: 0.6 + Math.random() * 0.7,
        speed: 1.1 + Math.random() * 0.9,
        phase: Math.random(),
        s: 0.45 + Math.random() * 0.6,
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
        // slushy slosh while the pour is running — asymmetric wobble + tilt
        const L = liquidRef.current
        const slosh = pourK * ss(fill, 0.02, 0.2)
        const wob = Math.sin(t * 6.4) * 0.022 * slosh
        L.scale.set(
          Math.max(fill * (1 + wob), 0.001),
          Math.max(fill * (1 + Math.sin(t * 4.7 + 1.3) * 0.014 * slosh), 0.001),
          Math.max(fill * (1 - wob), 0.001)
        )
        L.rotation.z = Math.sin(t * 3.1) * 0.032 * slosh
        L.rotation.x = Math.cos(t * 2.6) * 0.024 * slosh
      }
      // wet highlight ring riding the surface
      if (meniscusRef.current) {
        const M = meniscusRef.current
        M.visible = fill > 0.03
        M.position.y = GLASS.APEX_Y + GLASS.LIQ_H * fill
        M.scale.setScalar(Math.max(fill, 0.001))
        mats.meniscus.opacity = 0.36 * glassT * ss(fill, 0.03, 0.16)
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

    /* pour stream: a curved, tapering jet from the can mouth to the surface.
       The bezier leaves along the tilted can's lip, then gravity bends it —
       geometry is skinned in world space, so the meshes stay at identity. */
    const stream = streamRef.current
    const surfaceY =
      GLASS_POS.y + (GLASS.APEX_Y + GLASS.LIQ_H * fill) * GLASS_SCALE
    if (stream && streamCoreRef.current && can) {
      if (pourK > 0.01) {
        stream.visible = true
        streamCoreRef.current.visible = true
        _v1.set(0.3, 0.72, 0) // can mouth, canGroup-local (excludes Y spin)
        can.localToWorld(_v1)
        _v3.set(0.44, 1.06, 0) // just past the lip — sets the exit direction
        can.localToWorld(_v3)
        _v3.y -= 0.12 // gravity starts bending the jet immediately
        _v2.set(GLASS_POS.x, surfaceY, GLASS_POS.z)
        streamCurve.v0.copy(_v1)
        streamCurve.v1.copy(_v3)
        streamCurve.v2.copy(_v2)
        // thin dribble at the start/end of the pour, full jet mid-pour
        const baseR = 0.054 * (0.3 + 0.7 * pourK)
        updateStreamGeometry(streamGeo, streamCurve, baseR, baseR * 0.55, t, 0.09)
        updateStreamGeometry(streamCoreGeo, streamCurve, baseR * 0.45, baseR * 0.2, t, 0.15)
        tex.stream.offset.y -= dt * 1.9 // filaments flow downstream
        mats.stream.opacity = 0.85 * pourK
        mats.streamCore.opacity = 0.6 * pourK
      } else {
        stream.visible = false
        streamCoreRef.current.visible = false
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

    /* impact: splash crown, expanding ripples, froth glow */
    const splashActive = pourK > 0.22
    if (splashRef.current) {
      const im = splashRef.current
      for (let i = 0; i < splashes.length; i++) {
        const sp = splashes[i]
        if (!splashActive) {
          _m.compose(_v3.set(0, -50, 0), _q.identity(), _s.setScalar(0.0001))
        } else {
          // small parabolic hops out from where the jet lands
          const prog = (t * sp.speed + sp.phase) % 1
          const rad = prog * 0.24 * sp.r
          _v3.set(
            GLASS_POS.x + Math.cos(sp.a) * rad,
            surfaceY + 4 * prog * (1 - prog) * 0.13 * sp.h + 0.01,
            GLASS_POS.z + Math.sin(sp.a) * rad
          )
          _m.compose(_v3, _q.identity(), _s.setScalar(sp.s * pourK * (1 - prog * 0.55)))
        }
        im.setMatrixAt(i, _m)
      }
      im.instanceMatrix.needsUpdate = true
    }
    for (let i = 0; i < 2; i++) {
      const ring = i === 0 ? rippleARef.current : rippleBRef.current
      if (!ring) continue
      const prog = (t * 0.85 + i * 0.5) % 1
      const o = pourK * Math.pow(1 - prog, 1.6) * 0.38
      ring.visible = o > 0.01
      ring.position.set(GLASS_POS.x, surfaceY + 0.006, GLASS_POS.z)
      ring.scale.setScalar(0.09 + prog * 0.44)
      ring.material.opacity = o
    }
    if (frothRef.current) {
      const fr = frothRef.current
      const o = pourK * 0.32
      fr.visible = o > 0.01
      fr.position.set(GLASS_POS.x + 0.02, surfaceY + 0.05, GLASS_POS.z)
      const sc = 0.26 * (1 + Math.sin(t * 12.5) * 0.12)
      fr.scale.set(sc, sc * 0.6, 1)
      fr.material.opacity = o
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
        meniscusRef={meniscusRef}
        bubblesRef={bubblesRef}
      />

      {/* pour stream — outer translucent tube + bright glassy core */}
      <mesh
        ref={streamRef}
        geometry={streamGeo}
        visible={false}
        material={mats.stream}
        frustumCulled={false}
        renderOrder={1}
      />
      <mesh
        ref={streamCoreRef}
        geometry={streamCoreGeo}
        visible={false}
        material={mats.streamCore}
        frustumCulled={false}
        renderOrder={1}
      />

      {/* droplets shed by the falling jet */}
      <instancedMesh ref={dropsRef} args={[undefined, undefined, 22]} frustumCulled={false} renderOrder={1}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshStandardMaterial
          color="#F7CE7B"
          emissive="#9A5E14"
          emissiveIntensity={0.5}
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </instancedMesh>

      {/* splash crown at the impact point */}
      <instancedMesh ref={splashRef} args={[undefined, undefined, 14]} frustumCulled={false} renderOrder={2}>
        <sphereGeometry args={[0.016, 8, 8]} />
        <primitive object={mats.splash} attach="material" />
      </instancedMesh>

      {/* expanding surface ripples */}
      <mesh ref={rippleARef} visible={false} rotation={[-Math.PI / 2, 0, 0]} frustumCulled={false} renderOrder={3}>
        <ringGeometry args={[0.8, 1, 48]} />
        <meshBasicMaterial
          color="#FFD990"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={rippleBRef} visible={false} rotation={[-Math.PI / 2, 0, 0]} frustumCulled={false} renderOrder={3}>
        <ringGeometry args={[0.8, 1, 48]} />
        <meshBasicMaterial
          color="#FFD990"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* froth glow where the stream lands */}
      <sprite ref={frothRef} visible={false} renderOrder={3}>
        <spriteMaterial
          map={tex.glow}
          color="#FFE3AE"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          fog={false}
        />
      </sprite>

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
