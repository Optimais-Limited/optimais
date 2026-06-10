import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Industries | Optimais Limited",
  description: "Explore the industries and sectors where Optimais delivers intelligent, lasting impact.",
};

const INDUSTRIES = [
  {
    id: "01",
    label: "Artificial Intelligence",
    body: "Developing intelligent systems, machine learning solutions, decision-support tools, and advanced analytics that enable smarter and more efficient decision-making.",
  },
  {
    id: "02",
    label: "Robotics & Automation",
    body: "Designing autonomous systems, robotics technologies, industrial automation solutions, and intelligent control systems that enhance productivity and operational efficiency.",
  },
  {
    id: "03",
    label: "Aerospace & Advanced Systems",
    body: "Supporting innovation in aerospace technologies, unmanned aerial systems (UAS), remote sensing, satellite applications, autonomous platforms, and advanced engineering systems.",
  },
  {
    id: "04",
    label: "Agritech & Food Systems",
    body: "Applying technology, automation, data analytics, and intelligent systems to improve agricultural productivity, food security, supply chains, and sustainable farming practices.",
  },
  {
    id: "05",
    label: "Energy Systems",
    body: "Advancing renewable energy technologies, smart energy infrastructure, energy optimization, and sustainable power solutions for communities, businesses, and industries.",
  },
  {
    id: "06",
    label: "Advanced Manufacturing",
    body: "Supporting the development of modern manufacturing systems through automation, digital technologies, process optimization, and industrial innovation.",
  },
  {
    id: "07",
    label: "Pharmaceutical & Biotechnology Innovation",
    body: "Leveraging computational methods, data-driven research, biotechnology, and emerging technologies to accelerate innovation in healthcare, pharmaceuticals, and life sciences.",
  },
  {
    id: "08",
    label: "Infrastructure & Smart Systems",
    body: "Developing intelligent infrastructure solutions that integrate technology, data, and engineering to improve transportation, utilities, public services, and urban development.",
  },
  {
    id: "09",
    label: "Research & Education",
    body: "Conducting interdisciplinary research, promoting knowledge creation, supporting academic collaboration, and delivering education, training, and workforce development programs.",
  },
  {
    id: "10",
    label: "Strategic Consulting",
    body: "Providing expert advisory services in technology, innovation, business transformation, policy, research, and organizational development to help clients achieve sustainable growth and impact.",
  },
];

export default function IndustriesPage() {
  return (
    <div className="opt-root industries-page">
      <header className="site-header">
        <nav className="shell nav">
          <Link className="brand" href="/" aria-label="Optimais Limited">
            <img src="/brand_assets/optimais_logo_clean.svg" alt="Optimais" />
          </Link>
          <div className="nav-actions" style={{ marginLeft: "auto" }}>
            <Link className="button secondary opt-signin-btn" href="/">Back to Home</Link>
            <Link className="button" href="/dashboard/contact">Start a Project</Link>
          </div>
        </nav>
      </header>

      <main style={{ paddingTop: "80px" }}>
        <section style={{ padding: "80px 0 48px" }}>
          <div className="shell">
            <p className="section-label">Sectors We Serve</p>
            <h1 style={{ fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, margin: "16px 0 24px" }}>
              Industries where Optimais delivers intelligent, lasting impact.
            </h1>
            <p style={{ maxWidth: 680, fontSize: "1.05rem", lineHeight: 1.75, color: "rgba(255,255,255,0.68)", marginBottom: 0 }}>
              From AI-driven platforms and autonomous systems to energy infrastructure and strategic advisory, Optimais brings deep technical capability across a wide range of industry verticals.
            </p>
          </div>
        </section>

        <section style={{ padding: "0 0 80px" }}>
          <div className="shell">
            <div className="industries-grid">
              {INDUSTRIES.map((item) => (
                <div key={item.id} className="industry-card">
                  <span className="industry-id">{item.id}</span>
                  <h2 className="industry-label">{item.label}</h2>
                  <p className="industry-body">{item.body}</p>
                </div>
              ))}
            </div>

            <div className="industries-closing">
              <p>
                At Optimais, we believe that the future belongs to organizations that combine scientific discovery, technological innovation, and practical implementation to create lasting value for businesses, governments, institutions, and society.
              </p>
            </div>
          </div>
        </section>

        <section style={{ padding: "64px 0", borderTop: "1px solid rgba(201,169,97,0.12)" }}>
          <div className="shell" style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 800, marginBottom: 16 }}>
              Ready to work with us?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}>
              Bring Optimais into your strategy, engineering or operations programme.
            </p>
            <Link className="button" href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              Start a Project
            </Link>
          </div>
        </section>
      </main>

      <footer style={{ padding: "32px 0", borderTop: "1px solid rgba(201,169,97,0.08)" }}>
        <div className="shell" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: "0.84rem", color: "rgba(255,255,255,0.4)" }}>
            <strong style={{ color: "rgba(255,255,255,0.7)" }}>Optimais Limited</strong> — Intelligent Systems. Sustainable Futures.
          </span>
          <span style={{ fontSize: "0.84rem", color: "rgba(255,255,255,0.4)" }}>
            © {new Date().getFullYear()} Optimais Limited. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
