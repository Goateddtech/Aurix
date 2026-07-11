import { useRef } from 'react'
import { useParallax } from '../lib/useParallax'
import WaveDivider from './WaveDivider'

// The "floating product" moment (ciaoenergy.com's levitating can, translated
// to AURIX): a stylized can bobbing over its own shadow, wrapped in a slowly
// rotating ring of type, with fizz rising past it — all above a liquid wave.

const RING_TEXT =
  'POUR SLOW · SERVE COLD · KEEP THE MINUTE · POUR SLOW · SERVE COLD · KEEP THE MINUTE · '

function CanIllustration() {
  return (
    <svg
      className="cf-can"
      viewBox="0 0 200 340"
      width="200"
      height="340"
      role="img"
      aria-label="Illustration of the matte-black AURIX can"
    >
      <defs>
        <linearGradient id="cfBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0c0b0a" />
          <stop offset="0.18" stopColor="#191614" />
          <stop offset="0.42" stopColor="#241f1b" />
          <stop offset="0.6" stopColor="#171412" />
          <stop offset="1" stopColor="#0a0909" />
        </linearGradient>
        <linearGradient id="cfLid" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8a5e38" />
          <stop offset="0.45" stopColor="#d4a373" />
          <stop offset="0.65" stopColor="#f0c48e" />
          <stop offset="1" stopColor="#7a5230" />
        </linearGradient>
        <linearGradient id="cfSheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(255,236,200,0.16)" />
          <stop offset="1" stopColor="rgba(255,236,200,0)" />
        </linearGradient>
      </defs>

      {/* body */}
      <path
        d="M40 44 L40 296 Q40 316 62 320 L138 320 Q160 316 160 296 L160 44 Z"
        fill="url(#cfBody)"
      />
      {/* lid */}
      <ellipse cx="100" cy="44" rx="60" ry="15" fill="url(#cfLid)" />
      <ellipse cx="100" cy="44" rx="50" ry="11" fill="#14100d" />
      <ellipse cx="100" cy="43.2" rx="50" ry="11" fill="#241d17" />
      <rect x="92" y="36" width="16" height="5" rx="2.5" fill="#c08552" opacity="0.85" />
      {/* sheen down the left of the body */}
      <path d="M52 60 L52 290 Q52 302 62 306 L70 306 L70 60 Z" fill="url(#cfSheen)" />

      {/* label */}
      <text
        x="100"
        y="150"
        textAnchor="middle"
        fill="#e8c496"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontSize="34"
        fontWeight="600"
        letterSpacing="10"
      >
        AURIX
      </text>
      <line x1="62" y1="166" x2="138" y2="166" stroke="rgba(192,133,82,0.5)" strokeWidth="1" />
      <text
        x="100"
        y="184"
        textAnchor="middle"
        fill="#9a948c"
        fontFamily="'Jost', sans-serif"
        fontSize="8.5"
        letterSpacing="3.4"
      >
        CONSIDERED INDULGENCE
      </text>
      {/* botanical line art */}
      <g fill="none" stroke="rgba(212,163,115,0.6)" strokeWidth="1.2" strokeLinecap="round">
        <path d="M100 282 C100 264 100 254 100 246" />
        <path d="M100 250 Q90 240 82 236" />
        <path d="M100 250 Q110 240 118 236" />
        <circle cx="82" cy="234" r="2" />
        <circle cx="118" cy="234" r="2" />
        <circle cx="100" cy="243" r="2" />
        <circle cx="76" cy="240" r="1.4" />
        <circle cx="124" cy="240" r="1.4" />
      </g>
      <text
        x="100"
        y="305"
        textAnchor="middle"
        fill="rgba(154,148,140,0.7)"
        fontFamily="'Jost', sans-serif"
        fontSize="7.5"
        letterSpacing="2.6"
      >
        ELDERFLOWER · JALAPEÑO · CITRUS
      </text>
    </svg>
  )
}

const FIZZ = Array.from({ length: 12 }, (_, i) => ({
  left: 8 + ((i * 37) % 84),
  size: 5 + ((i * 13) % 9),
  dur: 7 + ((i * 29) % 60) / 10,
  delay: -((i * 47) % 90) / 10,
  drift: ((i * 23) % 30) - 15,
}))

export default function CanFloat() {
  const rootRef = useRef(null)
  useParallax(rootRef)
  return (
    <section className="section canfloat-section" id="serve" ref={rootRef}>
      <div className="wrap canfloat">
        <div className="canfloat-stage" aria-hidden="false">
          {/* rotating ring of type */}
          <svg className="cf-ring" viewBox="0 0 500 500" aria-hidden="true">
            <defs>
              <path
                id="cf-ring-path"
                d="M250,250 m-192,0 a192,192 0 1,1 384,0 a192,192 0 1,1 -384,0"
              />
            </defs>
            <text>
              <textPath href="#cf-ring-path">{RING_TEXT}</textPath>
            </text>
          </svg>

          {/* fizz rising past the can */}
          <div className="cf-fizz" aria-hidden="true">
            {FIZZ.map((b, i) => (
              <span
                key={i}
                style={{
                  left: `${b.left}%`,
                  width: b.size,
                  height: b.size,
                  animationDuration: `${b.dur}s`,
                  animationDelay: `${b.delay}s`,
                  '--drift': `${b.drift}px`,
                }}
              />
            ))}
          </div>

          {/* parallax wrapper (scroll) -> bob wrapper (CSS loop) -> can */}
          <span className="cf-tilt" data-parallax="0.06" data-rot="0.06">
            <span className="cf-bob">
              <CanIllustration />
            </span>
          </span>
          <span className="cf-shadow" aria-hidden="true" />
        </div>

        <div className="canfloat-copy">
          <p className="kicker" data-reveal>
            No Rush
          </p>
          <h2 data-reveal>Some drinks sprint.<br />This one hovers.</h2>
          <p data-reveal>
            No caffeine spike, no sugar crash, no countdown. Aurix holds its
            weight the way the can holds light — quietly. Chill it, pour it,
            and let the evening idle a while.
          </p>
          <a className="btn" href="#ritual" data-reveal>
            Learn the pour
          </a>
        </div>
      </div>
      <WaveDivider className="canfloat-wave" />
    </section>
  )
}
