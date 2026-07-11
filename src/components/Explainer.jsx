import { useRef, useState } from 'react'
import Botanicals from './Botanicals'
import { useParallax } from '../lib/useParallax'

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

// The single "drink" section: what Considered Indulgence means, then the
// ingredient reveal ("leave the noise on the shelf") folded in beneath it —
// one clean block instead of two stacked sections plus the can story.
export default function Explainer() {
  const rootRef = useRef(null)
  useParallax(rootRef)
  return (
    <section className="section" id="drink" ref={rootRef}>
      <Botanicals />
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

        <div id="ingredients" className="drink-truths">
          <p className="section-intro drink-truths-lead" data-reveal>
            Leave the noise on the shelf — hover or tap to see what’s actually
            inside.
          </p>
          <div className="tcards">
            {CARDS.map((c, i) => (
              <Card card={c} index={i} key={c.myth} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
