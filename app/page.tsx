import Link from "next/link";

const features = [
  {
    title: "Scholarship Finder",
    text: "Browse curated scholarship sources, save opportunities, and get AI-assisted recommendations."
  },
  {
    title: "Application Tracker",
    text: "Track deadlines, status, next steps, notes, and documents for every opportunity."
  },
  {
    title: "Research & Proposal Tools",
    text: "Use AI helpers for research planning, proposal drafting, infrastructure scoping, and recommendations."
  }
];

export default function HomePage() {
  return (
    <main className="site-page">
      <header className="site-nav">
        <Link className="site-brand" href="/">
          Optimais Limited
        </Link>
        <nav className="site-nav-links" aria-label="Public navigation">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/login">Sign in</Link>
          <Link className="button" href="/signup">Create account</Link>
        </nav>
      </header>

      <section className="site-hero">
        <div>
          <p className="eyebrow">Intelligent systems. Sustainable futures.</p>
          <h1>Build, discover, and track opportunities with Optimais.</h1>
          <p className="site-lede">
            Optimais Limited connects technology, renewable energy, strategic advisory, research resources, and scholarship tools in one professional platform.
          </p>
          <div className="site-actions">
            <Link className="button" href="/signup">Create free account</Link>
            <Link className="button secondary" href="/login">Sign in</Link>
          </div>
        </div>
        <aside className="site-card">
          <p className="eyebrow">User Portal</p>
          <h2>For students, researchers, and project teams</h2>
          <p>
            Create an account to save scholarship opportunities and track applications. Admin users can manage scholarships, blog posts, contacts, and newsletters.
          </p>
          <div className="mini-list">
            <span>Scholarships</span>
            <span>Application tracker</span>
            <span>AI assistance</span>
          </div>
        </aside>
      </section>

      <section className="site-section">
        <div className="section-heading">
          <p className="eyebrow">Frontend account access</p>
          <h2>Users can sign up and log in from the public website.</h2>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className="site-card" key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="site-section site-cta">
        <div>
          <p className="eyebrow">Get started</p>
          <h2>Create an account to access the user dashboard.</h2>
        </div>
        <Link className="button" href="/signup">Sign up now</Link>
      </section>
    </main>
  );
}
