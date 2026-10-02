import { ExhibitionModeration } from "@/components/admin/ExhibitionModeration";
import { listExhibitionsForModeration } from "@/lib/exhibitions";

export const dynamic = "force-dynamic";

export default async function AdminExhibitionsPage() {
  const posts = await listExhibitionsForModeration();
  return <ExhibitionModeration initialPosts={posts} />;
}
