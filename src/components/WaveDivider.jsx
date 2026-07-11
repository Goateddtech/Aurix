// Liquid band: three layered golden waves drifting at different speeds with
// fizz rising through them. Each SVG holds two identical wave periods, so a
// 0 → -50% translateX loop is seamless.

const WAVE_TOP =
  'M0,60 C240,20 480,20 720,60 S1200,100 1440,60 S1920,20 2160,60 S2640,100 2880,60'
const WAVE_D = `${WAVE_TOP} L2880,120 L0,120 Z`

function Wave({ cls, fill, crest }) {
  return (
    <div className={`wd-wave ${cls}`}>
      <svg viewBox="0 0 2880 120" preserveAspectRatio="none">
        <path d={WAVE_D} fill={fill} />
        {crest && (
          <path d={WAVE_TOP} fill="none" stroke={crest} strokeWidth="2.5" />
        )}
      </svg>
    </div>
  )
}

const BUBBLES = Array.from({ length: 9 }, (_, i) => ({
  left: 4 + ((i * 41) % 92),
  size: 4 + ((i * 17) % 8),
  dur: 4 + ((i * 31) % 40) / 10,
  delay: -((i * 53) % 60) / 10,
}))

export default function WaveDivider({ className = '' }) {
  return (
    <div className={`wavediv ${className}`} aria-hidden="true">
      <div className="wd-bubbles">
        {BUBBLES.map((b, i) => (
          <span
            key={i}
            style={{
              left: `${b.left}%`,
              width: b.size,
              height: b.size,
              animationDuration: `${b.dur}s`,
              animationDelay: `${b.delay}s`,
            }}
          />
        ))}
      </div>
      {/* two translucent gold crests peeking over a dark liquid surface
          that dissolves into the next section's background */}
      <Wave cls="wd-1" fill="rgba(242, 177, 77, 0.09)" />
      <Wave cls="wd-2" fill="rgba(212, 163, 115, 0.16)" />
      <Wave cls="wd-3" fill="#0B0B0B" crest="rgba(212, 163, 115, 0.4)" />
    </div>
  )
}
