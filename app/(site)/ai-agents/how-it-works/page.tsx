import type { Metadata } from "next";
import { ENGAGEMENT_STEPS } from "@/lib/ai-agents";
import { AuditCta, List } from "@/components/ai-agents/parts";

export const metadata: Metadata = {
  title: "How it works | AI Agent Integration | Optimais Labs",
  description: "Audit, scoped pilot, measured rollout and care: what you provide and what you receive at each step."
};

export default function HowItWorksPage() {
  return (
    <section className="page-section">
      <div className="shell">
        <p className="kicker">How it works</p>
        <h1 className="page-title">Four steps, each with something you can hold us to.</h1>
        <p className="panel-lede">We don&rsquo;t switch an agent on and hope. Each step ends with a written deliverable, and you decide whether to go on to the next.</p>
        <div className="aa-stack">
          {ENGAGEMENT_STEPS.map((step, i) => (
            <article key={step.name} className="aa-card">
              <div className="aa-card-head"><h2><span className="aa-step-n">{i + 1}</span> {step.name}</h2></div>
              <p>{step.summary}</p>
              <div className="aa-grid aa-grid-2">
                <div><h3>You receive</h3><List items={step.deliverables} /></div>
                <div><h3>You provide</h3><List items={step.clientDuties} /></div>
              </div>
              <p className="aa-note"><strong>Timing:</strong> {step.timing} We give dates in the written scope, once we have seen the process.</p>
            </article>
          ))}
        </div>
        <AuditCta />
      </div>
    </section>
  );
}
