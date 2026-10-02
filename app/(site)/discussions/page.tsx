import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listDiscussionRooms } from "@/lib/discussions";
import { DiscussionsBoard } from "@/components/DiscussionsBoard";

export const metadata: Metadata = {
  title: "Discussions | Optimais Labs",
  description: "Join a global community of African researchers and innovators in live text discussions."
};

// Reads the database on each request so a newly started discussion shows up immediately.
export const dynamic = "force-dynamic";

export default async function DiscussionsPage() {
  const session = await getServerSession(authOptions);
  const rooms = await listDiscussionRooms(session?.user?.id);

  return (
    <section className="page-section">
      <div className="shell">
        <p className="kicker">Discussions</p>
        <h1 className="page-title">Great minds connect. Ideas grow.</h1>
        <p className="panel-lede">
          Join a global community of African researchers, innovators, and curious minds. Start a text or voice discussion,
          share your perspective, or simply listen and learn. Connect across borders to explore ideas and build what comes next.
        </p>
        <DiscussionsBoard initialRooms={rooms} canPost={Boolean(session?.user?.id)} />
      </div>
    </section>
  );
}
