import { useState } from 'react'

const ITEMS = [
  [
    'Is Aurix alcoholic?',
    'Aurix is a 0.0% ABV† sparkling botanical apéritif — built to be drunk straight, over ice, or as the backbone of a low-proof cocktail. All of the occasion, none of the proof.',
  ],
  [
    'What does jalapeño taste like in a sparkling drink?',
    'Warmth, not fire. It sits behind the elderflower and citrus and shows up on the finish — closer to the gentle heat of a ginger beer than to hot sauce. You notice it most on the second sip.',
  ],
  [
    'What do marine collagen and vitamin C actually do?',
    'Each can carries 1,000 mg of hydrolyzed marine collagen†, the form your body absorbs most readily, alongside 80 mg of vitamin C† — which contributes to normal collagen formation. Function, dosed quietly.',
  ],
  [
    'How should I store and serve it?',
    'Keep it cold and out of direct light. Serve at 4–6°C — ideally poured into a chilled glass, which is rather the point.',
  ],
  [
    'Where is it made?',
    'Aurix is brewed and canned in small batches. Sourcing and production details will be published with the first release†.',
  ],
]

function Item({ q, a, open, onToggle }) {
  return (
    <div className={`faq-item${open ? ' open' : ''}`} data-reveal>
      <button type="button" className="faq-q" onClick={onToggle} aria-expanded={open}>
        <span>{q}</span>
        <i aria-hidden="true">{open ? '−' : '+'}</i>
      </button>
      <div className="faq-body">
        <div className="faq-body-inner">
          <p>{a}</p>
        </div>
      </div>
    </div>
  )
}

export default function FAQ() {
  const [open, setOpen] = useState(0)
  return (
    <section className="section">
      <div className="wrap wrap-narrow">
        <p className="kicker" data-reveal>
          FAQ
        </p>
        <h2 data-reveal>Asked, considered.</h2>
        <div className="faq">
          {ITEMS.map(([q, a], i) => (
            <Item
              key={q}
              q={q}
              a={a}
              open={open === i}
              onToggle={() => setOpen(open === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
