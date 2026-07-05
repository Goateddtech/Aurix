// Shared scroll progress for the pinned hero sequence.
// Written by the DOM scroll handler, read (and damped) by the R3F frame loop —
// keeps the 3D choreography a pure function of a single 0→1 value.
export const heroScroll = { p: 0, forced: false }

export const clamp01 = (x) => Math.min(1, Math.max(0, x))

// Trapezoid fade: 0 → 1 over [a,b], hold 1 over [b,c], 1 → 0 over [c,d].
export function band(p, a, b, c, d) {
  if (p < a) return 0
  if (p < b) return (p - a) / (b - a)
  if (p < c) return 1
  if (p < d) return 1 - (p - c) / (d - c)
  return 0
}
