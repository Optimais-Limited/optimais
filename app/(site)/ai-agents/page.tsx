import type { Metadata } from "next";
import Link from "next/link";
import { AGENT_FAQ, AGENT_SERVICES, ENGAGEMENT_STEPS, READINESS_LABELS } from "@/lib/ai-agents";
import { AuditCta, ReadinessTag } from "@/components/ai-agents/parts";

export const metadata: Metadata = {
  title: "AI Agent Integration | Optimais Labs",
  description: "Optimais Labs connects approved AI workflows to the tools your team already uses, with human oversight, measurable results and support after launch."
};

const OUTCOMES = [
  { h: "Routine work gets prepared for you", p: "The agent reads the enquiry, ticket or document and prepares the record or reply. Your team reviews instead of retyping." },
  { h: "A person approves what matters", p: "Every action in a pilot waits for someone you name. Nothing is sent, written or changed on the agent's own authority." },
  { h: "You can see what it did and why", p: "Each run keeps its source, the proposed action, who approved it and the result, so a mistake can be traced and fixed." }
];

export default function AiAgentsPage() {
  return (
    <>
      <section className="page-section">
        <div className="shell">
          <p className="kicker">AI Agent Integration</p>
          <h1 className="page-title">AI agents that help your business get work done.</h1>
          <p className="panel-lede">Optimais Labs connects approved AI workflows to the tools your team already uses, with human oversight, measurable results and support after launch.</p>
          <div className="aa-cta-actions">
            <Link className="button" href="/ai-agents/audit">Request a workflow audit</Link>
            <Link className="button secondary" href="/ai-agents/demos">See a working example</Link>
          </div>
          <div className="aa-grid aa-grid-3" style={{ marginTop: 48 }}>
            {OUTCOMES.map((o) => (
              <div key={o.h} className="aa-card"><h3>{o.h}</h3><p>{o.p}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section aa-band">
        <div className="shell">
          <h2 className="aa-h2">Four kinds of work we take on</h2>
          <p className="panel-lede">Each starts with one workflow and at most two systems. The label shows how far each has been proven.</p>
          <div className="aa-grid aa-grid-2">
            {AGENT_SERVICES.map((s) => (
              <Link key={s.slug} href={`/ai-agents/services/${s.slug}`} className="aa-card aa-card-link">
                <div className="aa-card-head"><h3>{s.name}</h3><ReadinessTag value={s.readiness} /></div>
                <p>{s.short}</p>
                <span className="aa-more">See what it does and where a person decides →</span>
              </Link>
            ))}
          </div>
          <p className="aa-note">
            {Object.values(READINESS_LABELS).map((r) => <span key={r.label}><strong>{r.label}:</strong> {r.meaning} </span>)}
          </p>
        </div>
      </section>

      <section className="page-section">
        <div className="shell">
          <h2 className="aa-h2">How an engagement runs</h2>
          <ol className="aa-steps">
            {ENGAGEMENT_STEPS.map((step, i) => (
              <li key={step.name}><span className="aa-step-n">{i + 1}</span><div><h3>{step.name}</h3><p>{step.summary}</p></div></li>
            ))}
          </ol>
          <p><Link className="aa-inline-link" href="/ai-agents/how-it-works">What you provide and what you receive at each step →</Link></p>
        </div>
      </section>

      <section className="page-section aa-band">
        <div className="shell aa-grid aa-grid-2">
          <div className="aa-card">
            <p className="tag">Demonstration · synthetic data</p>
            <h3>Watch an enquiry become a CRM record</h3>
            <p>Four invented enquiries run through the same steps a pilot uses: a normal case, a possible duplicate, a missing detail and one held at approval. Nothing in it is a real customer or a live system.</p>
            <Link className="aa-inline-link" href="/ai-agents/demos">Open the demo →</Link>
          </div>
          <div className="aa-card">
            <p className="tag">Trust</p>
            <h3>What keeps it under control</h3>
            <p>Actions are limited to an agreed list, approvals are tied to the exact change shown, and the workflow can be paused. We hold no security certifications and don&rsquo;t claim any.</p>
            <Link className="aa-inline-link" href="/ai-agents/trust">Read how data and approvals are handled →</Link>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="shell">
          <h2 className="aa-h2">Common questions</h2>
          <div className="aa-faq">
            {AGENT_FAQ.map((item) => (
              <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>
            ))}
          </div>
          <AuditCta />
        </div>
      </section>
    </>
  );
}
