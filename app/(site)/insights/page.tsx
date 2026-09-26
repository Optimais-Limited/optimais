import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Insights | Optimais Labs",
  description: "Research-driven thinking, emerging deep-tech trends and perspectives from Optimais Labs."
};

const ArrowRight = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export default function InsightsPage() {
  return (
    <section className="page-section">
      <div className="shell">
        <div className="panel-layout">
          <div>
            <p className="kicker">Ideas &amp; Perspectives</p>
            <h1 className="page-title">Insights from the frontier of technology and innovation.</h1>
            <p className="panel-lede">Explore the latest insights, ideas, and perspectives from Optimais Labs.</p>
            <p className="panel-lede" style={{ marginTop: 12 }}>
              Discover research-driven thinking, emerging deep-tech trends, and innovative solutions shaping the future of business, industry, technology, and society. From artificial intelligence and intelligent systems to energy, infrastructure, manufacturing, and digital transformation, our insights highlight the ideas driving sustainable innovation and long-term impact.
            </p>
          </div>
          <aside className="insight-card">
            <h3>Explore by Topic</h3>
            <div className="career-links">
              {["Expert Perspectives", "Client Stories", "Latest Publications", "Newsroom", "Events"].map(t => (
                <a key={t} href="#" className="career-link-item">
                  <span>{t}</span><ArrowRight />
                </a>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
