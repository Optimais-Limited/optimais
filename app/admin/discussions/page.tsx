import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listDiscussionRooms } from "@/lib/discussions";
import { DiscussionModeration } from "@/components/admin/DiscussionModeration";

export const dynamic = "force-dynamic";

export default async function AdminDiscussionsPage() {
  const session = await getServerSession(authOptions);
  const rooms = await listDiscussionRooms(session?.user?.id);
  return <DiscussionModeration initialRooms={rooms} />;
}
