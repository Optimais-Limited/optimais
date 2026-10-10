import { requireStaffPage } from "@/lib/api-auth";
import { listDiscussionRooms } from "@/lib/discussions";
import { DiscussionModeration } from "@/components/admin/DiscussionModeration";

export const dynamic = "force-dynamic";

export default async function AdminDiscussionsPage() {
  const session = await requireStaffPage();
  const rooms = await listDiscussionRooms(session?.user?.id);
  return <DiscussionModeration initialRooms={rooms} />;
}
