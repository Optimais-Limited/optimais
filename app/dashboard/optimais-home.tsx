"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useMemo, useState } from "react";

const panels = [
  {
    id: "industries",
    label: "Industries",
    title: "Industries where Optimais delivers intelligent, lasting impact.",
    text: "AI systems, renewable energy, engineering delivery, smart industry, advisory, infrastructure, training, aerospace, agritech, logistics and telecommunications.",
    items: ["AI Systems & Digital Platforms", "Renewable Energy & Smart Grids", "Engineering & Infrastructure", "Industrial Automation"]
  },
  {
    id: "innovation",
    label: "Innovation",
    title: "R&D shaped into deployable technology.",
    text: "Optimais commercializes research outputs, proprietary technologies and strategic partnerships into practical systems for real operating environments.",
    items: ["Research to deployment", "Rapid prototyping", "IP commercialization", "Technology transfer"]
  },
  {
    id: "markets",
    label: "Markets",
    title: "Built for public, private, industrial and community needs.",
    text: "The company supports businesses, governments, institutions and communities across Nigeria and international markets.",
    items: ["Government and institutions", "Industrial operators", "Commercial clients", "Development programs"]
  },
  {
    id: "opportunities",
    label: "Opportunities",
    title: "Scholarships, grants and funded research resources.",
    text: "Users can save opportunities, track applications and use the Optimais tools to organize scholarship and fellowship plans.",
    items: ["Scholarship finder", "Saved scholarships", "Application tracker", "Research support"]
  },
  {
    id: "insights",
    label: "Insights",
    title: "Technical insight for decision makers.",
    text: "Optimais publishes perspectives across intelligent systems, renewable infrastructure, advanced engineering and development strategy.",
    items: ["AI for infrastructure", "Clean energy systems", "Industrial intelligence", "Strategic advisory"]
  },
  {
    id: "careers",
    label: "Careers",
    title: "Capacity building for engineers, researchers and builders.",
    text: "Optimais supports education, technical training, research institutions, innovation hubs and entrepreneurship programs.",
    items: ["Training centers", "Research programs", "Workshops", "Innovation hubs"]
  },
  {
    id: "deeptech",
    label: "Deep Tech",
    title: "Decision intelligence, simulation and autonomous systems.",
    text: "Deep technical work spans digital twins, mathematical optimization, robotics, AI systems and smart industrial operations.",
    items: ["Digital twins", "Optimization", "Robotics", "Autonomous systems"]
  },
  {
    id: "contact",
    label: "Contact",
    title: "Start a project or partnership conversation.",
    text: "Reach Optimais for technology, energy, infrastructure, research, training or advisory initiatives.",
    items: ["optimaislimited@gmail.com", "+1 6038040701", "+234 8067040090", "Nigeria and United States"]
  }
];

function initialsFromName(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.split("@")[0] || "Optimais User";
  const parts = source.split(/\s+/).filter(Boolean);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : source.slice(0, 2);
  return initials.toUpperCase();
}

export function OptimaisHome({ name, email }: { name?: string | null; email?: string | null }) {
  const [active, setActive] = useState("industries");
  const activePanel = panels.find((panel) => panel.id === active) || panels[0];
  const initials = useMemo(() => initialsFromName(name, email), [name, email]);

  function goToPanel(panelId: string) {
    setActive(panelId);
    document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="full-site">
      <header className="full-header">
        <nav className="full-nav">
          <Link className="full-brand" href="/dashboard" aria-label="Optimais home">
            <img src="/optimais-logo.svg" alt="Optimais" />
          </Link>
          <div className="full-links" aria-label="Optimais navigation">
            {panels.map((panel) => (
              <button className={active === panel.id ? "active" : ""} key={panel.id} onClick={() => goToPanel(panel.id)} type="button">
                {panel.label}
              </button>
            ))}
          </div>
          <div className="full-actions">
            <button className="profile-chip" title={name || email || "Profile"} type="button">
              {initials}
            </button>
            <button className="button" onClick={() => goToPanel("contact")} type="button">Start a Project</button>
          </div>
        </nav>
      </header>

      <section className="full-hero" id="top">
        <div className="full-shell full-hero-grid">
          <div className="full-hero-copy">
            <p className="pill">R&D driven technology, energy and infrastructure</p>
            <h1>Intelligent systems for sustainable industrial growth.</h1>
            <p>
              Optimais Limited designs, develops, implements and operates advanced technology,
              renewable energy and engineering solutions for businesses, governments and institutions.
            </p>
            <div className="hero-actions">
              <button className="button" onClick={() => goToPanel("industries")} type="button">Explore Industries</button>
              <button className="button secondary" onClick={() => goToPanel("innovation")} type="button">View Approach</button>
            </div>
          </div>
          <div className="full-phone" aria-label="Optimais mobile interface preview">
            <div className="phone">
              <div className="phone-top"><span>9:41</span><span>•••</span></div>
              <div className="phone-header"><strong>Optimais</strong><span>AI</span></div>
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
              <div className="phone-alert"><span />All systems operational · Nigeria & international</div>
              <nav className="phone-tabs" aria-label="Preview tabs"><span>Home</span><span>Services</span><span>Markets</span><span>Contact</span></nav>
            </div>
          </div>
        </div>
      </section>

      <section className="full-approach">
        <div className="full-shell">
          <p className="section-label">How we work</p>
          <h2>A structured approach, for clear-headed execution.</h2>
          <div className="approach-list">
            {["Research to deployment", "Multi-discipline engineering delivery", "Institutional capacity and continuous improvement"].map((title, index) => (
              <article className="approach-card" key={title}>
                <strong>{String(index + 1).padStart(2, "0")}</strong>
                <div>
                  <h3>{title}</h3>
                  <p>
                    {index === 0 && "Research outputs and technologies are shaped into products, platforms and services that solve infrastructure and industrial challenges."}
                    {index === 1 && "Delivery spans mechanical, electrical, civil, systems, renewable energy and infrastructure engineering."}
                    {index === 2 && "Optimais builds training centers, innovation hubs, workshops and strategic alliances that sustain impact."}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="full-workspace" id="workspace">
        <div className="full-shell">
          <div className="section-head">
            <div>
              <p className="section-label">Interactive overview</p>
              <h2>Explore Optimais Limited without leaving the page.</h2>
            </div>
            <p>Use the tabs to open each focus area in place. Everything stays on one responsive page.</p>
          </div>
          <div className="console-panel">
            <aside>
              <p>Open a focus area</p>
              {panels.map((panel, index) => (
                <button className={active === panel.id ? "active" : ""} key={panel.id} onClick={() => setActive(panel.id)} type="button">
                  <strong>{String(index + 1).padStart(2, "0")}</strong>
                  <span>{panel.label}</span>
                </button>
              ))}
            </aside>
            <article>
              <p className="kicker">{activePanel.label}</p>
              <h2>{activePanel.title}</h2>
              <p>{activePanel.text}</p>
              <div className="focus-grid">
                {activePanel.items.map((item) => <span key={item}>{item}</span>)}
              </div>
              {activePanel.id === "opportunities" && (
                <div className="portal-links">
                  <Link className="button" href="/dashboard/saved-scholarships">Saved Scholarships</Link>
                  <Link className="button secondary" href="/dashboard/applications">Application Tracker</Link>
                </div>
              )}
            </article>
          </div>
        </div>
      </section>

      <section className="stats-band">
        <div className="full-shell stats-grid">
          <div><strong>6</strong><span>core capability domains</span></div>
          <div><strong>12+</strong><span>engineering and technology disciplines</span></div>
          <div><strong>4</strong><span>deployment markets</span></div>
          <div><strong>360°</strong><span>strategy, engineering, deployment and operations</span></div>
        </div>
      </section>

      <section className="full-founder">
        <div className="full-shell">
          <p className="section-label">Leadership</p>
          <h2>Founder & CEO</h2>
          <div className="founder-card-full">
            <img src="/brand_assets/CEO_image.png" alt="Ahmed Senior Ismail, Founder and CEO of Optimais Limited" />
            <div>
              <p className="kicker">Ph.D. Candidate · University of New Hampshire</p>
              <h3>Ahmed Senior Ismail</h3>
              <strong>Founder & CEO, Optimais Limited</strong>
              <p>
                Ahmed Senior Ismail brings together applied mathematics, machine learning, optimization,
                engineering computing and practical infrastructure problem-solving to support responsible AI,
                intelligent systems, energy solutions, infrastructure development and capacity building.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="full-contact">
        <div className="full-shell contact-card">
          <div>
            <p className="section-label">Schedule</p>
            <h2>Let's Work Together</h2>
            <p>Book a strategy call to discuss technology, energy, infrastructure, research or advisory goals.</p>
          </div>
          <a className="button" href="mailto:optimaislimited@gmail.com">Book a Call</a>
        </div>
      </section>

      <footer className="full-footer">
        <span>Optimais Limited — Intelligent Systems. Sustainable Futures.</span>
        <button onClick={() => signOut({ callbackUrl: "/" })} type="button">Sign out</button>
      </footer>
    </main>
  );
}
