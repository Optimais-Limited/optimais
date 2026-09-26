import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Markets Served | Optimais Labs",
  description: "Serving public, private and industrial markets, and the communities they support."
};

const MARKETS = ["Public Sector & Government", "Private Enterprise", "Industrial Operations", "Community Development", "Academic & Research Institutions", "International Development"];

export default function MarketsPage() {
  return (
    <section className="page-section">
      <div className="shell">
        <div className="panel-layout">
          <div>
            <p className="kicker">Where We Work</p>
            <h1 className="page-title">Serving public, private and industrial markets globally.</h1>
            <p className="panel-lede">Optimais Labs serves a broad range of clients and markets — from governments and public institutions to private enterprises, industrial operators, and community development programmes.</p>
            <div className="market-pills">
              {MARKETS.map(m => <span key={m}>{m}</span>)}
            </div>
          </div>
          <aside className="insight-card">
            <h3>Geographic Focus</h3>
            <p>Primary: Nigeria and West Africa<br />Global reach through partnerships</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
