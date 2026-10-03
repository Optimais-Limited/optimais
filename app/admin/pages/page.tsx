import { PageEditor } from "@/components/admin/PageEditor";
import { listSitePagesForAdmin } from "@/lib/site-pages";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const pages = await listSitePagesForAdmin();
  return <PageEditor initialPages={pages} />;
}
