import React, { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import * as THREE from 'three'
import { useScrollVelocity } from '../hooks/useScrollVelocity'
import { usePrefersReducedMotion } from '../lib/useReveal'

/* ============================================================================
   LiquidGlass — fixed full-screen R3F shader layer that becomes the page
   backdrop. Base stays #0B0B0B; the shader only ADDS warm brand light
   (specular sweep + caustic veins + fake bloom). At rest it shimmers slowly
   ("alive when still"); under scroll it domain-warps and throws progress-tied
   ripples that recede when scrolling up (scrubbable un-splash). Never recolors
   the base — extra brightness is lighting, not new hues.
   Single full-screen triangle, cheap noise, low internal resolution → light.
   ========================================================================== */

const VERT = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;     // 0..1 page progress (scrubbable)
  uniform float uVelocity;   // 0..1 smoothed scroll speed
  uniform float uDirection;  // -1 up · 0 idle · +1 down
  uniform float uReduced;    // 1.0 => hold a still, lit frame
  uniform vec2  uRes;        // drawing-buffer size (device px)
  uniform vec3  uBase;       // #0B0B0B
  uniform vec3  uLight;      // warm brand gold highlight
  uniform vec3  uLight2;     // copper secondary

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p) {
    float s = 0.0, a = 0.55;
    for (int i = 0; i < 3; i++) { s += a * vnoise(p); p = p * 2.03 + 7.1; a *= 0.5; }
    return s;
  }
  // caustic-style light network: warped noise ridges sharpened into veins
  float caustic(vec2 p, float t) {
    vec2 q = p + 0.5 * vec2(fbm(p * 1.7 + t * 0.05), fbm(p * 1.7 - t * 0.045 + 3.7));
    float n = fbm(q * 2.1 + t * 0.02);
    float veins = 1.0 - abs(2.0 * n - 1.0);
    return pow(veins, 2.4);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    float asp = uRes.x / max(uRes.y, 1.0);
    vec2 p = vec2((uv.x - 0.5) * asp, uv.y - 0.5);

    float t = uTime * (1.0 - uReduced);          // freeze time under reduced motion
    float vel = clamp(uVelocity, 0.0, 1.0);
    float dir = uDirection == 0.0 ? 1.0 : uDirection;

    // domain-warped flow: subtle at rest, strong & directional at speed
    vec2 flow = vec2(
      fbm(p * 2.4 + vec2(0.0,  t * 0.06 + uScroll * 1.1)),
      fbm(p * 2.4 + vec2(4.3, -t * 0.05 - uScroll * 1.1 * dir))
    ) - 0.5;
    vec2 wp = p + flow * (0.015 + 0.17 * vel);

    // idle caustic shimmer — two layers, different scale & drift
    float caust = caustic(wp * 1.15 + 1.3,  t * 0.9) * 0.7
                + caustic(wp * 2.30 - 2.0, -t * 0.6 + 10.0) * 0.4;

    // slow angled specular sweep (~9s loop)
    float sweep = smoothstep(0.82, 1.0, sin((wp.x * 0.6 + wp.y * 0.95) - t * 0.7));

    // progress-scrubbable ripples that run in reverse on scroll-up, fade at rest
    float d = length(wp - vec2(0.0, 0.16));
    float ripple = sin(d * 22.0 - uScroll * 40.0 * dir - t * 1.2 * vel) * vel * exp(-d * 1.9);

    // accumulate LIGHT only — the base hue is never touched
    float lig = caust * (0.085 + 0.05 * vel)
              + sweep * 0.05
              + max(ripple, 0.0) * 0.06
              + 0.012 * (0.5 + 0.5 * sin(t * 0.5));  // faint breathing so it's alive at rest

    // fake bloom: soft-knee lift on highlights (no postprocessing package)
    float bloom = smoothstep(0.06, 0.2, lig);
    lig += bloom * bloom * 0.06;

    // warm tint blends two brand hues by caustic phase; added over the dark base
    vec3 tint = mix(uLight2, uLight, clamp(caust * 1.3, 0.0, 1.0));
    vec3 col = uBase + tint * lig;

    // chromatic split at refraction edges, scales with velocity
    float split = vel * caust * 0.06;
    col.r += uLight.r * split;
    col.b -= uLight.b * split * 0.7;

    // gentle vignette so the edges never band bright
    col *= mix(0.9, 1.06, smoothstep(1.15, 0.15, length(uv - 0.5)));

    gl_FragColor = vec4(max(col, 0.0), 1.0);
  }
`

// debug/preview: /?gv=0.8 forces velocity, /?gp=0.4 progress, /?gd=1 direction
// so the scroll-warp / ripple state can be captured without live scrolling.
function readGlassDebug() {
  if (typeof window === 'undefined') return null
  const q = new URLSearchParams(window.location.search)
  if (!q.has('gv') && !q.has('gp') && !q.has('gd')) return null
  const num = (k) => (q.has(k) ? parseFloat(q.get(k)) || 0 : null)
  return { v: num('gv'), p: num('gp'), d: num('gd') }
}

function GlassField({ scroll, reduced }) {
  const debug = useMemo(readGlassDebug, [])
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uVelocity: { value: 0 },
      uDirection: { value: 0 },
      uReduced: { value: reduced ? 1 : 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uBase: { value: new THREE.Color('#0B0B0B') },
      uLight: { value: new THREE.Color('#F2B14D') },
      uLight2: { value: new THREE.Color('#C08552') },
    }),
    [reduced]
  )

  useFrame((state) => {
    const s = scroll.current
    uniforms.uTime.value = state.clock.elapsedTime
    uniforms.uScroll.value = debug && debug.p != null ? debug.p : s.progress
    uniforms.uVelocity.value = debug && debug.v != null ? debug.v : s.velocity
    uniforms.uDirection.value = debug && debug.d != null ? debug.d : s.direction
    const el = state.gl.domElement
    uniforms.uRes.value.set(el.width, el.height)
  })

  return (
    <ScreenQuad>
      <shaderMaterial
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </ScreenQuad>
  )
}

// WebGL failure → render nothing; the .liquid-glass CSS gradient stays as the
// still, softly-lit no-WebGL fallback.
class GLBoundary extends React.Component {
  state = { err: false }
  static getDerivedStateFromError() {
    return { err: true }
  }
  render() {
    return this.state.err ? null : this.props.children
  }
}

export default function LiquidGlass() {
  const reduced = usePrefersReducedMotion()
  const scroll = useScrollVelocity()

  return (
    <div className="liquid-glass" aria-hidden="true">
      <GLBoundary>
        <Canvas
          className="liquid-glass-canvas"
          frameloop={reduced ? 'demand' : 'always'}
          dpr={[0.75, 1.25]}
          gl={{
            antialias: false,
            alpha: false,
            depth: false,
            stencil: false,
            powerPreference: 'high-performance',
          }}
          onCreated={({ gl }) => gl.setClearColor('#0B0B0B', 1)}
        >
          <GlassField scroll={scroll} reduced={reduced} />
        </Canvas>
      </GLBoundary>
    </div>
  )
}
