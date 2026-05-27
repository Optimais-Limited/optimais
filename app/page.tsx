import Link from "next/link";

export default function HomePage() {
  return (
    <main className="gate-page">
      <header className="gate-nav">
        <Link className="gate-logo" href="/" aria-label="Optimais Limited home">
          <img src="/optimais-logo.svg" alt="Optimais" />
        </Link>
      </header>

      <section className="gate-hero" aria-labelledby="gate-title">
        <div className="gate-copy">
          <h1 id="gate-title">Intelligent systems for sustainable industrial growth.</h1>
          <p>
            Optimais Limited designs, develops, implements and operates advanced technology,
            renewable energy and engineering solutions for businesses, governments and institutions.
          </p>
          <div className="gate-actions">
            <Link className="button gate-primary" href="/signup">Sign up</Link>
            <Link className="gate-login" href="/login">Already registered? Sign in</Link>
          </div>
        </div>

        <div className="phone-shell" aria-label="Optimais platform preview">
          <div className="phone">
            <div className="phone-top">
              <span>9:41</span>
              <span>•••</span>
            </div>
            <div className="phone-header">
              <strong>Optimais</strong>
              <span>AI</span>
            </div>
            <div className="phone-metrics">
              <div><small>Domains</small><b>6</b></div>
              <div><small>Disciplines</small><b>12+</b></div>
              <div><small>Markets</small><b>4</b></div>
              <div><small>Reach</small><b>Global</b></div>
            </div>
            <div className="coverage">
              <small>Capability coverage</small>
              <span><b>AI Systems</b><i className="coverage-92" /></span>
              <span><b>Renewable</b><i className="coverage-85" /></span>
              <span><b>Engineering</b><i className="coverage-78" /></span>
              <span><b>Advisory</b><i className="coverage-70" /></span>
            </div>
            <div className="phone-alert">
              <span />
              All systems operational · Nigeria & international
            </div>
            <nav className="phone-tabs" aria-label="Preview tabs">
              <span>Home</span>
              <span>Services</span>
              <span>Markets</span>
              <span>Contact</span>
            </nav>
          </div>
        </div>
      </section>
    </main>
  );
}
