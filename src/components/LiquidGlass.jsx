import React, { useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import * as THREE from 'three'
import { useScrollVelocity } from '../hooks/useScrollVelocity'
import { usePrefersReducedMotion } from '../lib/useReveal'

/* ============================================================================
   LiquidGlass — fixed full-screen R3F backdrop. Classic, gallery-dark: a deep
   near-black base lit by a single soft studio light that drifts very slowly,
   finished with fine grain and an elegant vignette. Monochrome by design — no
   colored hues — so it reads timeless and lets the product carry the color.
   Single full-screen triangle, low internal resolution → cheap.
   ========================================================================== */

const VERT = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;     // 0..1 page progress
  uniform float uVelocity;   // 0..1 smoothed scroll speed
  uniform float uReduced;    // 1.0 => hold a still frame
  uniform vec2  uRes;        // drawing-buffer size (device px)
  uniform vec3  uBase;       // deep near-black
  uniform vec3  uLight;      // soft warm-white studio light
  uniform vec3  uFill;       // faint neutral fill

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    float asp = uRes.x / max(uRes.y, 1.0);
    vec2 p = vec2((uv.x - 0.5) * asp, uv.y - 0.5);

    float t = uTime * (1.0 - uReduced);
    float vel = clamp(uVelocity, 0.0, 1.0);

    // classy vertical grade — floor darker, air near the top a touch lifted
    vec3 base = uBase * (0.8 + 0.55 * smoothstep(-0.25, 0.75, uv.y));

    // one broad studio light, drifting slowly near the upper third; a whisper
    // of scroll velocity lets it breathe without ever becoming an "effect"
    vec2 c1 = vec2(sin(t * 0.05) * 0.28, 0.24 + cos(t * 0.037) * 0.09);
    float d1 = length((p - c1) * vec2(0.72, 1.15));
    float glow = pow(smoothstep(0.98, 0.0, d1), 1.7) * (0.115 + 0.03 * vel);

    // faint secondary fill from lower-left, for depth
    float d2 = length((p - vec2(-0.5, -0.42)) * vec2(0.9, 1.0));
    float glow2 = pow(smoothstep(1.3, 0.0, d2), 2.2) * 0.05;

    vec3 col = base + uLight * glow + uFill * glow2;

    // fine, static film grain (no flicker)
    col += (hash(floor(gl_FragCoord.xy)) - 0.5) * 0.013;

    // elegant vignette
    col *= mix(0.6, 1.04, smoothstep(1.18, 0.12, length(uv - 0.5)));

    gl_FragColor = vec4(max(col, 0.0), 1.0);
  }
`

// debug/preview: /?gv=0.8 forces velocity, /?gp=0.4 progress (parallels ?p=)
function readGlassDebug() {
  if (typeof window === 'undefined') return null
  const q = new URLSearchParams(window.location.search)
  if (!q.has('gv') && !q.has('gp')) return null
  const num = (k) => (q.has(k) ? parseFloat(q.get(k)) || 0 : null)
  return { v: num('gv'), p: num('gp') }
}

function GlassField({ scroll, reduced }) {
  const debug = useMemo(readGlassDebug, [])
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uVelocity: { value: 0 },
      uReduced: { value: reduced ? 1 : 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uBase: { value: new THREE.Color('#0B0B0C') },
      uLight: { value: new THREE.Color('#F3EEE4') },
      uFill: { value: new THREE.Color('#4A453E') },
    }),
    [reduced]
  )

  useFrame((state) => {
    const s = scroll.current
    uniforms.uTime.value = state.clock.elapsedTime
    uniforms.uScroll.value = debug && debug.p != null ? debug.p : s.progress
    uniforms.uVelocity.value = debug && debug.v != null ? debug.v : s.velocity
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
          onCreated={({ gl }) => gl.setClearColor('#0B0B0C', 1)}
        >
          <GlassField scroll={scroll} reduced={reduced} />
        </Canvas>
      </GLBoundary>
    </div>
  )
}
