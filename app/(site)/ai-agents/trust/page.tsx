import type { Metadata } from "next";
import { AGENTS_CONTACT_EMAIL } from "@/lib/ai-agents";
import { AuditCta, List } from "@/components/ai-agents/parts";

export const metadata: Metadata = {
  title: "Trust | AI Agent Integration | Optimais Labs",
  description: "How data is handled, how actions are approved, where a workflow can run, and what support covers."
};

const SECTIONS = [
  { h: "How actions are approved", items: ["The agent proposes; your application of record only changes after an approval.", "An approval covers the exact change shown. If the change, the rules or the target record alter, it must be approved again.", "Approvals expire. A stale one cannot be used later.", "Money movement, access changes and anything else you class as high-impact always need a person.", "A workflow can be paused. Pending actions wait and are re-checked before they run."] },
  { h: "How data is handled", items: ["Before a pilot we agree in writing which records are used, where they are stored and for how long.", "Text in emails, documents and web pages is treated as data to read, never as instructions to follow.", "Logs keep what is needed to explain a decision: the source, the proposed action, the approval and the result.", "Passwords and access tokens are kept in a secrets store, never in a page or a log.", "The public demo uses invented data only."] },
  { h: "Where a workflow can run", items: ["In accounts you own, when ownership and handover matter most to you.", "In an environment we manage for you under a separate agreement, with credentials and records kept apart from other clients.", "Either way we document where execution, storage, backups, logs and model processing take place."] },
  { h: "What support covers", items: ["A named contact during agreed business hours.", "A daily check of failed runs, waiting actions and spend.", "For a serious incident: pause the workflow, tell your named contact, work out what was affected, fix, retest, and restart only when you accept the fix.", "When care ends you receive the agreed export, the configuration, and confirmation that our access has been removed."] }
];

export default function TrustPage() {
  return (
    <section className="page-section">
      <div className="shell">
        <p className="kicker">Trust</p>
        <h1 className="page-title">An agent&rsquo;s output is a proposal until your rules approve it.</h1>
        <p className="panel-lede">These are the controls we build into every workflow. They are enforced in the software around the model, not left to the model to remember.</p>
        <div className="aa-grid aa-grid-2">
          {SECTIONS.map((s) => <div key={s.h} className="aa-card"><h2>{s.h}</h2><List items={s.items} /></div>)}
        </div>
        <div className="aa-card" style={{ marginTop: 24 }}>
          <h2>What we do not claim</h2>
          <p>Optimais Labs holds no security or privacy certifications for this service, and we won&rsquo;t imply otherwise. Model providers may retain request data for a period even when they don&rsquo;t train on it; we tell you which provider is used and what its settings are. Data-protection law differs by country, and you should take your own advice for yours.</p>
          <p>Questions about any of this: <a className="aa-inline-link" href={`mailto:${AGENTS_CONTACT_EMAIL}`}>{AGENTS_CONTACT_EMAIL}</a></p>
        </div>
        <AuditCta />
      </div>
    </section>
  );
}
