import type { Metadata } from "next";
import { AuditCta } from "@/components/ai-agents/parts";
import { CrmDemo } from "./crm-demo";

export const metadata: Metadata = {
  title: "Demo: enquiry to CRM record | AI Agent Integration | Optimais Labs",
  description: "A worked example on synthetic data: four invented enquiries run through validation, duplicate checks, routing and approval."
};

export default function DemosPage() {
  return (
    <section className="page-section">
      <div className="shell">
        <p className="kicker">Demonstration · synthetic data</p>
        <h1 className="page-title">Watch an enquiry become a CRM record.</h1>
        <p className="panel-lede">This runs the first workflow we offer, in your browser, against a pretend CRM. Every person and company is invented, nothing is sent anywhere, and no AI model or live system is called.</p>
        <CrmDemo />
        <div className="aa-card" style={{ marginTop: 24 }}>
          <h2>What this demo does not show</h2>
          <p>Reading free-form messages with a model, connecting to a real CRM, and performance on your own cases. Those are what a pilot measures. The demo shows the part that stays fixed: the checks, the approval and the cases that are held for a person.</p>
        </div>
        <AuditCta heading="See how your own enquiries would run." />
      </div>
    </section>
  );
}
