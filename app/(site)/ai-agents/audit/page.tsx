import type { Metadata } from "next";
import Link from "next/link";
import { AGENT_SERVICES, RESPONSE_WINDOW } from "@/lib/ai-agents";
import { List } from "@/components/ai-agents/parts";
import { EnquiryForm } from "./enquiry-form";

export const metadata: Metadata = {
  title: "Request a workflow audit | AI Agent Integration | Optimais Labs",
  description: "Tell us about one workflow. A person at Optimais Labs replies within two business days. No account needed."
};

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  const preset = AGENT_SERVICES.find((s) => s.slug === service)?.name ?? "";
  return (
    <section className="page-section">
      <div className="shell">
        <div className="panel-layout">
          <div>
            <p className="kicker">Workflow audit</p>
            <h1 className="page-title">Find out whether one workflow is worth automating.</h1>
            <p className="panel-lede">The audit is a paid, fixed-scope review of a single process. It ends with a written recommendation, including when the honest answer is &ldquo;don&rsquo;t build this&rdquo;.</p>
            <EnquiryForm services={AGENT_SERVICES.map((s) => s.name)} preset={preset} />
          </div>
          <aside className="insight-card aa-aside">
            <h3>What the audit includes</h3>
            <List items={["A diagram of the process as it runs today", "Volume and a baseline measurement", "Which tasks are viable, which we rejected and why", "A scoped proposal for a pilot, if one is justified"]} />
            <h3>Who it fits</h3>
            <List items={["A team with one repeated task that takes real hours", "Rules that are written down or could be", "Someone who owns the process and can decide"]} />
            <h3>What happens next</h3>
            <List items={[`A person replies by email within ${RESPONSE_WINDOW}`, "A short call to understand the process", "A written audit scope and fee for you to accept or decline"]} />
            <p className="aa-note">Not sure it fits? Try the <Link className="aa-inline-link" href="/ai-agents/resources">readiness checklist</Link>.</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
