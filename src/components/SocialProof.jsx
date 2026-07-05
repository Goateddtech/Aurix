const QUOTES = [
  ['The first can I’ve ever left on the bar on purpose.', 'Head bartender, London†'],
  ['Heat where you expect sugar. It reads like a cocktail, not a soft drink.', 'Drinks writer†'],
  ['Our guests order it by pointing at someone else’s.', 'Hotel bar manager†'],
  ['Finally, a functional drink that doesn’t dress like a supplement.', 'Early member†'],
  ['The pour is the point. Nobody chugs an Aurix.', 'Restaurant sommelier†'],
  ['Elderflower up front, jalapeño at the door on the way out.', 'Trade tasting note†'],
]

export default function SocialProof() {
  return (
    <section className="section section-tight">
      <div className="wrap">
        <p className="kicker" data-reveal>
          In Good Company
        </p>
      </div>
      <div className="quotes" data-reveal>
        {QUOTES.map(([q, who]) => (
          <blockquote className="quote" key={who + q.slice(0, 10)}>
            <p>“{q}”</p>
            <cite>— {who}</cite>
          </blockquote>
        ))}
      </div>
    </section>
  )
}
