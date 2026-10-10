import { requireStaffPage } from "@/lib/api-auth";
import { ExhibitionModeration } from "@/components/admin/ExhibitionModeration";
import { listExhibitionsForModeration } from "@/lib/exhibitions";

export const dynamic = "force-dynamic";

export default async function AdminExhibitionsPage() {
  await requireStaffPage();
  const posts = await listExhibitionsForModeration();
  return <ExhibitionModeration initialPosts={posts} />;
}
