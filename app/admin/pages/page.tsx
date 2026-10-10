import { requireStaffPage } from "@/lib/api-auth";
import { PageEditor } from "@/components/admin/PageEditor";
import { listSitePagesForAdmin } from "@/lib/site-pages";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  await requireStaffPage();
  const pages = await listSitePagesForAdmin();
  return <PageEditor initialPages={pages} />;
}
