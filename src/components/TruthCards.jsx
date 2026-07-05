import { useState } from 'react'

const CARDS = [
  {
    myth: 'Artificial sweeteners',
    truth: 'Real elderflower & citrus',
    detail: 'Steeped whole, pressed once. Nothing reconstituted, nothing “nature-identical.”',
  },
  {
    myth: 'Synthetic collagen filler',
    truth: 'Marine collagen + vitamin C',
    detail: 'Hydrolyzed for absorption, paired with vitamin C — the way collagen actually works.',
  },
  {
    myth: 'Loud, one-note energy',
    truth: 'Jalapeño, considered',
    detail: 'A low, warm heat that opens the palate. A kick you notice — not a dare.',
  },
  {
    myth: 'Sugar-bomb formulas',
    truth: '2.4 g sugar per can†',
    detail: 'Sweetness from the botanicals themselves, not the syrup tank.',
  },
]

function Card({ card, index }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <button
      type="button"
      className={`tcard${flipped ? ' flipped' : ''}`}
      onClick={() => setFlipped((f) => !f)}
      data-reveal
      style={{ transitionDelay: `${index * 100}ms` }}
      aria-label={`${card.myth} — flip to reveal: ${card.truth}`}
    >
      <span className="tcard-inner">
        <span className="tcard-face tcard-front">
          <em className="mark mark-x">✕</em>
          <strong>{card.myth}</strong>
          <small>the usual way</small>
        </span>
        <span className="tcard-face tcard-back">
          <em className="mark mark-check">✓</em>
          <strong>{card.truth}</strong>
          <small>{card.detail}</small>
        </span>
      </span>
    </button>
  )
}

export default function TruthCards() {
  return (
    <section className="section" id="ingredients">
      <div className="wrap">
        <p className="kicker" data-reveal>
          Ingredients
        </p>
        <h2 data-reveal>Leave the noise on the shelf.</h2>
        <p className="section-intro" data-reveal>
          Hover — or tap — to see what’s actually inside.
        </p>
        <div className="tcards">
          {CARDS.map((c, i) => (
            <Card card={c} index={i} key={c.myth} />
          ))}
        </div>
      </div>
    </section>
  )
}
