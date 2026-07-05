import { useState } from 'react'

export default function Stockists() {
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (email.trim()) setSent(true)
  }

  return (
    <section className="section section-marble" id="stockists">
      <div className="wrap stockists">
        <div className="stockists-col">
          <p className="kicker" data-reveal>
            First Pour
          </p>
          <h2 data-reveal>First pour privileges.</h2>
          <p data-reveal>
            Launch dates, first allocations, member serves. No noise — that
            would be off-brand.
          </p>
          {sent ? (
            <p className="form-done" data-reveal>
              You’re on the list. Considered choice.
            </p>
          ) : (
            <form className="capture" onSubmit={submit} data-reveal>
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
              />
              <button className="btn btn-solid" type="submit">
                Join
              </button>
            </form>
          )}
        </div>
        <div className="stockists-col">
          <p className="kicker" data-reveal>
            Stockists
          </p>
          <h2 data-reveal>Find Aurix near you.</h2>
          <p data-reveal>
            The stockist map is pouring soon. Leave your city and we’ll route
            the first cases accordingly†.
          </p>
          <form className="capture" onSubmit={(e) => e.preventDefault()} data-reveal>
            <input type="text" placeholder="Your city" aria-label="Your city" />
            <button className="btn" type="submit">
              Notify me
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
