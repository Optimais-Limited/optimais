import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Industries | Optimais Labs",
  description: "Explore the industries and sectors where Optimais Labs delivers intelligent, lasting impact.",
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
    // keeps the page's original body text color now that the old page wrapper is gone
    <div style={{ color: "var(--text, #f7f3ea)" }}>
      <section style={{ padding: "80px 0 48px" }}>
        <div className="shell">
          <p className="section-label">Sectors We Serve</p>
          <h1 style={{ fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, margin: "16px 0 24px" }}>
            Industries where Optimais Labs delivers intelligent, lasting impact.
          </h1>
          <p style={{ maxWidth: 680, fontSize: "1.05rem", lineHeight: 1.75, color: "rgba(var(--ink-rgb),0.68)", marginBottom: 0 }}>
            From AI-driven platforms and autonomous systems to energy infrastructure and strategic advisory, Optimais Labs brings deep technical capability across a wide range of industry verticals.
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
              At Optimais Labs, we believe that the future belongs to organizations that combine scientific discovery, technological innovation, and practical implementation to create lasting value for businesses, governments, institutions, and society.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
