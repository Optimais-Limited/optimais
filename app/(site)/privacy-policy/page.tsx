import type { Metadata } from "next";
import { getSitePage } from "@/lib/site-pages";
import { SitePageBody } from "@/components/SitePageBody";

export const metadata: Metadata = {
  title: "Privacy Policy | Optimais Labs",
  description: "How Optimais Labs collects, uses and protects your information."
};

export const dynamic = "force-dynamic";

export default async function PrivacyPolicyPage() {
  const page = await getSitePage("privacy-policy");

  return (
    <section className="page-section">
      <div className="shell legal-shell">
        <p className="kicker">Policies</p>
        <h1 className="page-title">{page.title}</h1>
        <SitePageBody body={page.body} />
        <p className="legal-note">This page is a general template and isn't a substitute for advice from a qualified lawyer about your specific obligations.</p>
      </div>
    </section>
  );
}
