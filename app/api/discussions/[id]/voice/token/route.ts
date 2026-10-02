import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mintVoiceToken } from "@/lib/livekit";

type Params = { params: Promise<{ id: string }> };

// Joining voice: the host can speak immediately; everyone else joins listening-only and can
// "raise a hand" in the room to ask the host to turn their microphone on (see the permission route).
export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in to join." }, { status: 401 });

  const room = await prisma.discussionRoom.findUnique({ where: { id }, select: { status: true, hostId: true } });
  if (!room) return NextResponse.json({ error: "Discussion not found." }, { status: 404 });
  if (room.status !== "OPEN") return NextResponse.json({ error: "This discussion has ended." }, { status: 400 });

  const isModerator = session.user.role === "ADMIN" || session.user.role === "EDITOR";
  const canPublish = room.hostId === session.user.id || isModerator;
  const result = await mintVoiceToken(id, session.user.id, session.user.name || "Member", canPublish);
  if (!result) return NextResponse.json({ error: "Live voice isn't set up yet." }, { status: 503 });

  return NextResponse.json({ ...result, canPublish });
}
