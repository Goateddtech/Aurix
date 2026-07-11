import { useEffect, useRef } from 'react'

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x)

/**
 * Frame-rate-independent smoothed scroll velocity — the single source of truth
 * for every scroll-driven effect (LiquidGlass backdrop, hero headline warp, …).
 *
 * Implemented as a shared singleton: one rAF loop drives one state object no
 * matter how many components subscribe, so there is never a duplicate listener
 * or a second source of "how fast are we scrolling". Every `useScrollVelocity()`
 * returns the SAME stable ref (mutating it never triggers a re-render):
 *   progress   0..1 down the whole page (scrubbable, so effects reverse cleanly)
 *   velocity   0..1 smoothed scroll speed — fast attack, ~600ms ease back to 0
 *   direction  -1 up · 0 idle · +1 down
 *
 * Velocity is damped with `1 - exp(-k·dt)` so smoothing is identical at 30fps
 * and 144fps. Attack is snappy; release is slow, so motion settles back to crisp
 * shortly after the user stops — no residual warp at rest.
 */
const state = { progress: 0, velocity: 0, direction: 0 }

let subscribers = 0
let raf = 0
let lastY = 0
let lastT = 0
// pixels/second that reads as "full speed"; faster than this saturates at 1
const REF_SPEED = 2600

function frame(now) {
  if (!lastT) lastT = now
  const dt = Math.min((now - lastT) / 1000, 0.05) || 0.016
  lastT = now

  const y = window.scrollY || window.pageYOffset || 0
  const dy = y - lastY
  lastY = y

  const max = Math.max(
    document.documentElement.scrollHeight - window.innerHeight,
    1
  )
  state.progress = clamp01(y / max)

  // instantaneous normalized speed, then frame-rate-independent damping:
  // snap up quickly (k=16), drift back down slowly (k=4.5 → ~600ms to rest)
  const inst = clamp01(Math.abs(dy) / dt / REF_SPEED)
  const k = inst > state.velocity ? 16 : 4.5
  state.velocity += (inst - state.velocity) * (1 - Math.exp(-k * dt))
  if (state.velocity < 0.0005) state.velocity = 0

  if (Math.abs(dy) > 0.15) state.direction = dy > 0 ? 1 : -1
  else if (state.velocity === 0) state.direction = 0

  raf = requestAnimationFrame(frame)
}

function start() {
  if (raf) return
  lastY = window.scrollY || window.pageYOffset || 0
  lastT = 0
  raf = requestAnimationFrame(frame)
}

function stop() {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
}

export function useScrollVelocity() {
  const ref = useRef(state)
  useEffect(() => {
    subscribers += 1
    start()
    return () => {
      subscribers -= 1
      if (subscribers <= 0) stop()
    }
  }, [])
  return ref
}
