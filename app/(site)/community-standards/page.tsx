import type { Metadata } from "next";
import { getSitePage } from "@/lib/site-pages";
import { SitePageBody } from "@/components/SitePageBody";

export const metadata: Metadata = {
  title: "Community Standards | Optimais Labs",
  description: "What we expect from everyone posting to Exhibitions and Discussions."
};

export const dynamic = "force-dynamic";

export default async function CommunityStandardsPage() {
  const page = await getSitePage("community-standards");

  return (
    <section className="page-section">
      <div className="shell legal-shell">
        <p className="kicker">Policies</p>
        <h1 className="page-title">{page.title}</h1>
        <SitePageBody body={page.body} />
      </div>
    </section>
  );
}
