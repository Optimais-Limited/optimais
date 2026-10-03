import type { Metadata } from "next";
import { ConcernForm } from "./concern-form";

export const metadata: Metadata = {
  title: "Report a Concern | Optimais Labs",
  description: "Tell us about content or behaviour on Optimais Labs that concerns you."
};

export default function ReportConcernPage() {
  return (
    <section className="page-section">
      <div className="shell">
        <p className="kicker">Policies</p>
        <h1 className="page-title">Report a concern</h1>
        <p className="panel-lede">
          Seen an Exhibition post, Discussion, comment or message that breaks our <a href="/community-standards">Community Standards</a>? Let us know and an admin will review it. For anything urgent or involving your account security, you can also email us directly.
        </p>
        <ConcernForm />
      </div>
    </section>
  );
}
