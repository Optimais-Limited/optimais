import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSiteViewer } from "@/lib/site-viewer";

// Shared chrome for the public site pages (/industries, /innovation, /markets, ...).
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getSiteViewer();
  return (
    <div className="opt-root">
      <SiteHeader isAuthenticated={viewer.isAuthenticated} initials={viewer.initials} />
      <main className="page-main">{children}</main>
      <SiteFooter />
    </div>
  );
}
