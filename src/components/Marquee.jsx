const ITEMS = [
  'Elderflower',
  'Jalapeño',
  'Citrus',
  'Marine Collagen',
  'Vitamin C',
  '0.0% ABV†',
]

export default function Marquee() {
  const row = (
    <div className="marquee-row">
      {ITEMS.map((it) => (
        <span key={it}>
          {it}
          <i>✦</i>
        </span>
      ))}
    </div>
  )
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-inner">
        {row}
        {row}
      </div>
    </div>
  )
}
