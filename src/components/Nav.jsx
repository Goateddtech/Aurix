import { useEffect, useState } from 'react'

const LINKS = [
  ['The Drink', '#drink'],
  ['The Ritual', '#ritual'],
  ['Ingredients', '#ingredients'],
  ['Stockists', '#stockists'],
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
      <a className="nav-logo" href="#top">
        AURIX
      </a>
      <div className="nav-links">
        {LINKS.map(([label, href]) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
      </div>
      <a className="btn btn-solid nav-cta" href="#stockists">
        Find Aurix
      </a>
    </nav>
  )
}
