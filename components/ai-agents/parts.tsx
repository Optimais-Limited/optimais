import Link from "next/link";
import { READINESS_LABELS, RESPONSE_WINDOW, type Readiness } from "@/lib/ai-agents";

export function ReadinessTag({ value }: { value: Readiness }) {
  const { label, meaning } = READINESS_LABELS[value];
  return <span className={`tag aa-readiness aa-readiness-${value.toLowerCase()}`} title={meaning}>{label}</span>;
}

export function AuditCta({ heading = "Start with one workflow." }: { heading?: string }) {
  return (
    <div className="aa-cta">
      <div>
        <h2>{heading}</h2>
        <p>Tell us about a task your team repeats. A person replies within {RESPONSE_WINDOW}. No account needed.</p>
      </div>
      <div className="aa-cta-actions">
        <Link className="button" href="/ai-agents/audit">Request a workflow audit</Link>
        <Link className="button secondary" href="/ai-agents/demos">See a working example</Link>
      </div>
    </div>
  );
}

export function List({ items }: { items: string[] }) {
  return <ul className="aa-list">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}
