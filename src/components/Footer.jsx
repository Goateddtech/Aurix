export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-mark" aria-hidden="true">
        AURIX
      </div>
      <div className="wrap footer-inner">
        <div className="footer-brand">
          <span className="nav-logo">AURIX</span>
          <p>Considered Indulgence.</p>
        </div>
        <div className="footer-links">
          <a href="#drink">The Drink</a>
          <a href="#ritual">The Ritual</a>
          <a href="#stockists">Stockists</a>
        </div>
        <div className="footer-links footer-social">
          <a href="#top" onClick={(e) => e.preventDefault()}>
            Instagram†
          </a>
          <a href="#top" onClick={(e) => e.preventDefault()}>
            TikTok†
          </a>
          <a href="#top" onClick={(e) => e.preventDefault()}>
            Pinterest†
          </a>
        </div>
      </div>
      <div className="wrap footer-legal">
        <span>© 2026 AURIX. All rights reserved.</span>
        <span>Drink considerately. † Placeholder details pending launch.</span>
      </div>
    </footer>
  )
}
