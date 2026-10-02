import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createDiscussionMessage, listDiscussionMessages } from "@/lib/discussions";
import { DISCUSSION_MESSAGE_MAX } from "@/lib/discussions-shared";
import { prisma } from "@/lib/prisma";
import { consume } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string }> };

const MESSAGE_LIMIT = 60;
const MESSAGE_WINDOW_MS = 10 * 60 * 1000;

// Polled every few seconds by an open room's page. ?after=<messageId> returns only what's new.
export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const after = new URL(request.url).searchParams.get("after") || undefined;
  const messages = await listDiscussionMessages(id, after, session?.user?.id);
  return NextResponse.json({ messages });
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in to post a message." }, { status: 401 });

  const limited = consume(`discmsg:${session.user.id}`, MESSAGE_LIMIT, MESSAGE_WINDOW_MS);
  if (limited.limited) return NextResponse.json({ error: "You're posting too quickly. Please slow down." }, { status: 429 });

  const body = await request.json().catch(() => null);
  const text = typeof body?.body === "string" ? body.body.trim() : "";
  if (!text || text.length > DISCUSSION_MESSAGE_MAX) {
    return NextResponse.json({ error: `Please write a message of up to ${DISCUSSION_MESSAGE_MAX} characters.` }, { status: 400 });
  }

  const room = await prisma.discussionRoom.findUnique({ where: { id }, select: { status: true } });
  if (!room) return NextResponse.json({ error: "Discussion not found." }, { status: 404 });
  if (room.status !== "OPEN") return NextResponse.json({ error: "This discussion has ended." }, { status: 400 });

  const message = await createDiscussionMessage(id, session.user.id, text);
  return NextResponse.json({ message }, { status: 201 });
}
