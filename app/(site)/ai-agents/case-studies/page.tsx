import type { Metadata } from "next";
import Link from "next/link";
import { AuditCta } from "@/components/ai-agents/parts";

export const metadata: Metadata = {
  title: "Case studies | AI Agent Integration | Optimais Labs",
  description: "Measured client results, published only with permission."
};

export default function CaseStudiesPage() {
  return (
    <section className="page-section">
      <div className="shell">
        <p className="kicker">Case studies</p>
        <h1 className="page-title">No client results to show yet.</h1>
        <p className="panel-lede">This service is new. We will publish a case study only when a client deployment has measured results and the client has agreed to share them, with sample sizes and what was left out.</p>
        <div className="aa-card">
          <h2>In the meantime</h2>
          <p>The demo runs the first workflow we are offering, enquiry to CRM record, on invented data. It shows the steps, the approval and the cases that get held.</p>
          <Link className="aa-inline-link" href="/ai-agents/demos">Open the demo →</Link>
        </div>
        <AuditCta heading="Be the first measured pilot." />
      </div>
    </section>
  );
}
