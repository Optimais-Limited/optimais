import type { Metadata } from "next";
import { getSitePage } from "@/lib/site-pages";
import { SitePageBody } from "@/components/SitePageBody";

export const metadata: Metadata = {
  title: "About Us | Optimais Labs",
  description: "Who Optimais Labs is and what we build."
};

export const dynamic = "force-dynamic";

export default async function AboutUsPage() {
  const page = await getSitePage("about-us");

  return (
    <section className="page-section">
      <div className="shell legal-shell">
        <p className="kicker">Optimais Labs</p>
        <h1 className="page-title">{page.title}</h1>
        <SitePageBody body={page.body} />
      </div>
    </section>
  );
}
