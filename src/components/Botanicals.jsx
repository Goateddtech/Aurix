// Decorative layer: the drink's ingredients as copper line art, drifting at
// different speeds while the section scrolls past (ciao-energy-style floating
// fruit, translated into AURIX's quiet-luxury language). Pure decoration —
// hidden from screen readers, pointer-transparent, off on small screens.

const S = {
  fill: 'none',
  stroke: 'rgba(212, 163, 115, 0.55)',
  strokeWidth: 1.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

function CitrusWheel() {
  return (
    <svg viewBox="0 0 96 96" width="96" height="96" style={S}>
      <circle cx="48" cy="48" r="42" />
      <circle cx="48" cy="48" r="34" strokeOpacity="0.6" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <line
            key={i}
            x1={48 + Math.cos(a) * 6}
            y1={48 + Math.sin(a) * 6}
            x2={48 + Math.cos(a) * 32}
            y2={48 + Math.sin(a) * 32}
          />
        )
      })}
    </svg>
  )
}

function Elderflower() {
  // one stem branching into an umbel of tiny five-dot florets
  const tips = [
    [16, 22], [34, 12], [54, 10], [72, 18], [82, 34],
  ]
  return (
    <svg viewBox="0 0 96 96" width="88" height="88" style={S}>
      <path d="M48 92 C48 70 48 58 48 50" />
      {tips.map(([x, y], i) => (
        <g key={i}>
          <path d={`M48 50 Q${(48 + x) / 2} ${(50 + y) / 2 - 6} ${x} ${y}`} />
          <circle cx={x} cy={y} r="2.2" />
          <circle cx={x - 5} cy={y - 3} r="1.6" />
          <circle cx={x + 5} cy={y - 3} r="1.6" />
          <circle cx={x - 3} cy={y + 5} r="1.6" />
          <circle cx={x + 3} cy={y + 5} r="1.6" />
        </g>
      ))}
    </svg>
  )
}

function Jalapeno() {
  return (
    <svg viewBox="0 0 96 96" width="76" height="76" style={S}>
      <path d="M30 14 C26 10 30 4 36 7 C40 9 42 12 42 16" />
      <path d="M42 16 C58 18 74 32 76 50 C78 68 66 84 52 88 C60 74 62 60 56 44 C51 31 46 22 42 16 Z" />
      <path d="M50 36 C54 46 56 58 53 70" strokeOpacity="0.5" />
    </svg>
  )
}

function Coupe() {
  return (
    <svg viewBox="0 0 96 96" width="84" height="84" style={S}>
      <path d="M18 14 L78 14 C78 34 66 46 48 46 C30 46 18 34 18 14 Z" />
      <line x1="48" y1="46" x2="48" y2="78" />
      <path d="M32 84 C38 80 58 80 64 84" />
      <line x1="24" y1="24" x2="72" y2="24" strokeOpacity="0.5" />
      <circle cx="40" cy="19" r="1.6" strokeOpacity="0.7" />
      <circle cx="54" cy="17" r="1.3" strokeOpacity="0.7" />
      <circle cx="47" cy="21" r="1.1" strokeOpacity="0.7" />
    </svg>
  )
}

function BubbleTrio() {
  return (
    <svg viewBox="0 0 64 64" width="52" height="52" style={S}>
      <circle cx="20" cy="44" r="10" />
      <circle cx="42" cy="30" r="6" strokeOpacity="0.7" />
      <circle cx="34" cy="52" r="4" strokeOpacity="0.5" />
    </svg>
  )
}

const ITEMS = [
  { El: Elderflower, cls: 'bt-1', speed: 0.16, rot: 0.02 },
  { El: CitrusWheel, cls: 'bt-2', speed: -0.1, rot: 0.05 },
  { El: Jalapeno, cls: 'bt-3', speed: 0.22, rot: -0.03 },
  { El: Coupe, cls: 'bt-4', speed: -0.14, rot: 0 },
  { El: BubbleTrio, cls: 'bt-5', speed: 0.3, rot: 0 },
]

export default function Botanicals() {
  return (
    <div className="botanicals" aria-hidden="true">
      {ITEMS.map(({ El, cls, speed, rot }, i) => (
        <span key={cls} className={`bt ${cls}`} data-parallax={speed} data-rot={rot}>
          <span className="bt-float" style={{ animationDelay: `${i * -1.7}s` }}>
            <El />
          </span>
        </span>
      ))}
    </div>
  )
}
