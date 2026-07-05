const STEPS = [
  ['01', 'Chill a coupe or martini glass. Sugar half the rim with the press of a lemon wheel.'],
  ['02', 'Add a bar spoon of fresh lemon juice — and one large cube of ice, if you like it long.'],
  ['03', 'Pour one can of Aurix slowly down the inside of the glass. Save the last inch for the top-up.'],
  ['04', 'Garnish with the lemon wheel. Drink while it’s still talking.'],
]

export default function Ritual() {
  return (
    <section className="section section-marble" id="ritual">
      <div className="wrap ritual">
        <figure className="ritual-img" data-reveal>
          <img
            src="/aurix-glass.jpg"
            alt="A sugar-rimmed martini glass of golden Aurix with a lemon wheel, in warm bar light"
          />
        </figure>
        <div className="ritual-copy">
          <p className="kicker" data-reveal>
            The Ritual
          </p>
          <h2 data-reveal>Best served poured, not popped.</h2>
          <p data-reveal>
            The can is the beginning, not the vessel. One suggested serve —
            the one the animation just poured for you.
          </p>
          <div className="recipe" data-reveal>
            <h3>
              The Aurix Sour<sup>†</sup>
            </h3>
            <ol>
              {STEPS.map(([n, s]) => (
                <li key={n}>
                  <span className="step-num">{n}</span>
                  <p>{s}</p>
                </li>
              ))}
            </ol>
            <p className="footnote">† Suggested serve, pending the final house recipe.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
