const STEPS = [
  {
    n: '01',
    title: 'Real botanicals, not flavor science.',
    body: 'Elderflower and citrus, steeped whole and pressed once — with a whisper of jalapeño heat that arrives late and leaves politely.',
  },
  {
    n: '02',
    title: 'Function without the noise.',
    body: 'Marine collagen and vitamin C, dosed for real benefit — 1,000 mg and 80 mg per can† — not for the front of the label.',
  },
  {
    n: '03',
    title: 'Made for the ritual, not the rush.',
    body: 'Aurix is meant to be poured, not chugged. A coupe, ice if you like, a twist of lemon. Take the minute.',
  },
]

export default function Explainer() {
  return (
    <section className="section" id="drink">
      <div className="wrap">
        <p className="kicker" data-reveal>
          The Drink
        </p>
        <h2 data-reveal>What Considered Indulgence means</h2>
        <p className="section-intro" data-reveal>
          Quiet luxury in a can — the opposite of a drink that needs to shout.
        </p>
        <div className="steps">
          {STEPS.map((s, i) => (
            <article className="step" key={s.n} data-reveal style={{ transitionDelay: `${i * 120}ms` }}>
              <span className="step-num">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
