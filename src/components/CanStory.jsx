export default function CanStory() {
  return (
    <section className="section section-marble">
      <div className="wrap canstory">
        <div className="canstory-copy">
          <p className="kicker" data-reveal>
            The Object
          </p>
          <h2 data-reveal>Why the can matters</h2>
          <p data-reveal>
            Most cans are engineered to grab your eye across a fridge aisle.
            Aurix was designed for a different room — the low light of a bar
            top, a bookshelf, a table set for two.
          </p>
          <p data-reveal>
            The finish is matte soft-touch black, so it holds light instead of
            bouncing it. The botanicals — elderflower umbels, a jalapeño, a
            citrus wheel — are drawn in rose-gold foil, stamped rather than
            printed, so they catch candlelight the way a coupe does.
          </p>
          <ul className="spec-chips" data-reveal>
            <li>Matte soft-touch black</li>
            <li>Rose-gold foil, stamped</li>
            <li>187 ml considered pour†</li>
          </ul>
        </div>
        <div className="canstory-imgs">
          <figure className="ci ci-main" data-reveal>
            <img src="/aurix-can.jpg" alt="AURIX can on a dark marble pedestal under warm spotlight" />
          </figure>
          <figure className="ci ci-crop" data-reveal style={{ transitionDelay: '120ms' }}>
            <img
              src="/aurix-can.jpg"
              alt="Close view of the copper rim and pull tab"
              style={{ objectPosition: '50% 30%', transform: 'scale(2.1)' }}
            />
          </figure>
          <figure className="ci ci-crop" data-reveal style={{ transitionDelay: '240ms' }}>
            <img
              src="/aurix-can.jpg"
              alt="Close view of the rose-gold botanical line art"
              style={{ objectPosition: '52% 62%', transform: 'scale(2.4)' }}
            />
          </figure>
        </div>
      </div>
    </section>
  )
}
