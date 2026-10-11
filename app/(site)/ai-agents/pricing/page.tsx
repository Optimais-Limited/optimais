import type { Metadata } from "next";
import { AuditCta, List } from "@/components/ai-agents/parts";

export const metadata: Metadata = {
  title: "Pricing | AI Agent Integration | Optimais Labs",
  description: "How the audit, the build and ongoing care are quoted, and what drives each cost."
};

const PARTS = [
  { name: "Audit", how: "A fixed fee, agreed before we start.", drivers: ["How many steps and exceptions the process has", "How easily a sample of cases can be provided", "Whether rules are written down or need to be gathered"] },
  { name: "Build and pilot", how: "A fixed fee for the scope in the audit's recommendation.", drivers: ["The number of systems to connect (a pilot has at most two)", "The number of rules and exception paths", "How the systems grant access"] },
  { name: "Care", how: "A monthly fee, during agreed support hours.", drivers: ["Monthly volume", "How often your rules or systems change", "The response times you need"] }
];

export default function PricingPage() {
  return (
    <section className="page-section">
      <div className="shell">
        <p className="kicker">Pricing</p>
        <h1 className="page-title">Three separate fees, each quoted in writing.</h1>
        <p className="panel-lede">We quote after seeing the process, so we don&rsquo;t publish a price list. This page explains how a quote is put together so nothing in it is a surprise.</p>
        <div className="aa-grid aa-grid-3">
          {PARTS.map((part) => (
            <div key={part.name} className="aa-card"><h2>{part.name}</h2><p>{part.how}</p><h3>What drives it</h3><List items={part.drivers} /></div>
          ))}
        </div>
        <div className="aa-grid aa-grid-2" style={{ marginTop: 24 }}>
          <div className="aa-card"><h2>Usage costs</h2><p>Model and hosting usage is metered. Where the workflow runs in accounts you own, you pay those providers directly. Where we run it for you, usage is itemised on the care invoice, with a ceiling agreed in advance.</p></div>
          <div className="aa-card"><h2>Not included unless scoped</h2><List items={["Additional workflows, systems or languages", "Voice and messaging channels", "Changes to your own systems", "Support outside the agreed hours"]} /></div>
        </div>
        <AuditCta heading="Ask for a quote on one workflow." />
      </div>
    </section>
  );
}
