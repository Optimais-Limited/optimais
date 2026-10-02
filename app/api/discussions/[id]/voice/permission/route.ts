import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setVoicePublishPermission } from "@/lib/livekit";

type Params = { params: Promise<{ id: string }> };

// The host (or a moderator) grants or revokes a participant's ability to speak. LiveKit pushes
// the change to that participant's already-open connection — no reconnect needed on their end.
export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const room = await prisma.discussionRoom.findUnique({ where: { id }, select: { hostId: true } });
  if (!room) return NextResponse.json({ error: "Discussion not found." }, { status: 404 });

  const isModerator = session.user.role === "ADMIN" || session.user.role === "EDITOR";
  if (room.hostId !== session.user.id && !isModerator) {
    return NextResponse.json({ error: "Only the host can do that." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const identity = typeof body?.identity === "string" ? body.identity : "";
  const canPublish = Boolean(body?.canPublish);
  if (!identity) return NextResponse.json({ error: "Missing participant." }, { status: 400 });

  const ok = await setVoicePublishPermission(id, identity, canPublish);
  if (!ok) return NextResponse.json({ error: "Could not update that participant." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
