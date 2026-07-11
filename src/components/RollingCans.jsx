import { useEffect, useRef } from 'react'
import { clamp01 } from '../lib/scrollState'
import { usePrefersReducedMotion } from '../lib/useReveal'

// hydroflow-style scroll element: a long row of AURIX cans that rolls sideways
// as you scroll through the (tall) section — the row translates horizontally
// and every can rolls with it. A pure function of one 0→1 scroll value, driven
// straight on the DOM (no re-render), so it stays smooth.

const CAN_COUNT = 24

function MiniCan({ i }) {
  return (
    <svg
      className="rc-can"
      viewBox="0 0 120 214"
      width="120"
      height="214"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`rcBody${i}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0a0908" />
          <stop offset="0.2" stopColor="#1b1611" />
          <stop offset="0.5" stopColor="#271f18" />
          <stop offset="0.74" stopColor="#171310" />
          <stop offset="1" stopColor="#090807" />
        </linearGradient>
        <linearGradient id={`rcLid${i}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6f4a2b" />
          <stop offset="0.5" stopColor="#e9bf8a" />
          <stop offset="1" stopColor="#67452a" />
        </linearGradient>
        <linearGradient id={`rcSheen${i}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(255,236,200,0.16)" />
          <stop offset="1" stopColor="rgba(255,236,200,0)" />
        </linearGradient>
      </defs>
      <rect x="22" y="16" width="76" height="182" rx="20" fill={`url(#rcBody${i})`} />
      <path d="M32 30 L32 186 Q32 194 40 196 L46 196 L46 30 Z" fill={`url(#rcSheen${i})`} />
      <ellipse cx="60" cy="18" rx="38" ry="9" fill={`url(#rcLid${i})`} />
      <ellipse cx="60" cy="17" rx="30" ry="6" fill="#140f0c" />
      <rect x="55" y="12" width="10" height="3.4" rx="1.7" fill="#c08552" opacity="0.85" />
      <text
        x="60"
        y="118"
        textAnchor="middle"
        fill="#dcb079"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontSize="19"
        fontWeight="600"
        letterSpacing="4.5"
      >
        AURIX
      </text>
      <rect x="34" y="128" width="52" height="1" fill="rgba(192,133,82,0.45)" />
      <text
        x="60"
        y="142"
        textAnchor="middle"
        fill="rgba(154,148,140,0.75)"
        fontFamily="'Inter', sans-serif"
        fontSize="5.4"
        letterSpacing="1.6"
      >
        ELDERFLOWER · CITRUS
      </text>
    </svg>
  )
}

export default function RollingCans() {
  const trackRef = useRef(null)
  const rowRef = useRef(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return
    // debug/preview: /?rc=0.4 pins the roll progress (parallels the hero's ?p=)
    const q = new URLSearchParams(window.location.search)
    const forced = q.has('rc') ? clamp01(parseFloat(q.get('rc')) || 0) : null
    const onScroll = () => {
      const track = trackRef.current
      const row = rowRef.current
      if (!track || !row) return
      const vh = window.innerHeight
      const total = Math.max(track.offsetHeight - vh, 1)
      const prog =
        forced != null ? forced : clamp01(-track.getBoundingClientRect().top / total)
      // slide the row across; roll each can as the row moves. --stagger scales
      // with progress so the row is a clean upright shelf at rest, then desyncs
      // into an organic rolling wave as you scroll (not a single flip in unison)
      const travel = Math.max(row.scrollWidth - window.innerWidth * 0.86, 0)
      row.style.transform = `translate3d(${(-prog * travel).toFixed(1)}px,0,0)`
      row.style.setProperty('--roll', `${(-prog * 360).toFixed(1)}deg`)
      row.style.setProperty('--stagger', `${(prog * 15).toFixed(2)}deg`)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [reduced])

  return (
    <section className="rollcans" id="drink" ref={trackRef}>
      <div className="rollcans-stage">
        <div className="rollcans-head">
          <p className="kicker" data-reveal>
            By the case
          </p>
          <h2 data-reveal>
            A ritual worth
            <br />
            repeating.
          </h2>
          <p className="section-intro" data-reveal>
            Small batches, made to be poured slowly — and often.
          </p>
        </div>
        <div className="rollcans-floor" aria-hidden="true">
          <div className="rollcans-row" ref={rowRef}>
            {Array.from({ length: CAN_COUNT }, (_, i) => (
              <span className="rollcans-can" key={i} style={{ '--i': i }}>
                <MiniCan i={i} />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
