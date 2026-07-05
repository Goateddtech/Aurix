const STATS = [
  ['38', 'Calories'],
  ['2.4 g', 'Sugar'],
  ['0 mg', 'Caffeine'],
  ['1,000 mg', 'Marine Collagen'],
  ['80 mg', 'Vitamin C'],
  ['0.0%', 'ABV'],
]

export default function Nutrition() {
  return (
    <section className="section section-tight">
      <div className="wrap">
        <p className="kicker" data-reveal>
          What’s Inside
        </p>
        <div className="nutrition" data-reveal>
          {STATS.map(([v, l]) => (
            <div className="stat" key={l}>
              <b>{v}</b>
              <span>{l}</span>
            </div>
          ))}
        </div>
        <p className="footnote" data-reveal>
          † Provisional values, pending final formulation.
        </p>
      </div>
    </section>
  )
}
