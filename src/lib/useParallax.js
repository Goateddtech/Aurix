import { useEffect } from 'react'
import { usePrefersReducedMotion } from './useReveal'

// Scroll parallax for decorative elements. Children of `rootRef` marked with
// [data-parallax="<speed>"] drift vertically as the section crosses the
// viewport; optional [data-rot="<deg-per-px>"] adds a slow roll. The parallax
// transform lives on the marked element — put looping CSS float animations on
// a child so the two never fight over `transform`.
export function useParallax(rootRef) {
  const reduced = usePrefersReducedMotion()
  useEffect(() => {
    if (reduced) return
    const root = rootRef.current
    if (!root) return
    const els = Array.from(root.querySelectorAll('[data-parallax]'))
    if (!els.length) return

    let raf = 0
    const update = () => {
      raf = 0
      const r = root.getBoundingClientRect()
      // 0 when the section's center sits at the viewport's center
      const mid = r.top + r.height / 2 - window.innerHeight / 2
      for (const el of els) {
        const speed = parseFloat(el.dataset.parallax) || 0.1
        const rot = parseFloat(el.dataset.rot) || 0
        const y = -mid * speed
        el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) rotate(${(y * rot).toFixed(2)}deg)`
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [rootRef, reduced])
}
