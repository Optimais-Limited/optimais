import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDiscussionRoom, listDiscussionMessages } from "@/lib/discussions";
import { livekitConfigured } from "@/lib/livekit";
import { DiscussionRoomView } from "@/components/DiscussionRoomView";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const room = await getDiscussionRoom(id);
  return { title: room ? `${room.title} | Discussions | Optimais Labs` : "Discussions | Optimais Labs" };
}

export default async function DiscussionRoomPage({ params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const room = await getDiscussionRoom(id, session?.user?.id);
  if (!room) notFound();

  const messages = await listDiscussionMessages(id, undefined, session?.user?.id);
  const isModerator = session?.user?.role === "ADMIN" || session?.user?.role === "EDITOR";

  return (
    <section className="page-section">
      <div className="shell disc-room-shell">
        <DiscussionRoomView
          room={room}
          initialMessages={messages}
          canPost={Boolean(session?.user?.id)}
          canClose={room.isHost || isModerator}
          voiceEnabled={livekitConfigured() && Boolean(session?.user?.id)}
        />
      </div>
    </section>
  );
}
