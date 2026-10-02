import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { removeMessageReaction, upsertMessageReaction } from "@/lib/discussions";
import { DISCUSSION_REACTIONS, type DiscussionReactionEmoji } from "@/lib/discussions-shared";
import { consume } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string; messageId: string }> };

const REACTION_LIMIT = 60;
const REACTION_WINDOW_MS = 10 * 60 * 1000;

// Sets (or changes) the signed-in visitor's reaction to this message. Allowed even once the
// discussion has closed — you're reacting to something already said, not posting new content.
export async function POST(request: Request, { params }: Params) {
  const { id, messageId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in to react." }, { status: 401 });

  const limited = consume(`discmsgreaction:${session.user.id}`, REACTION_LIMIT, REACTION_WINDOW_MS);
  if (limited.limited) return NextResponse.json({ error: "Please slow down." }, { status: 429 });

  const body = await request.json().catch(() => null);
  const emoji = body?.emoji as DiscussionReactionEmoji | undefined;
  if (!emoji || !(DISCUSSION_REACTIONS as readonly string[]).includes(emoji)) {
    return NextResponse.json({ error: "Unsupported reaction." }, { status: 400 });
  }

  const ok = await upsertMessageReaction(id, messageId, session.user.id, emoji);
  if (!ok) return NextResponse.json({ error: "Message not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { messageId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  await removeMessageReaction(messageId, session.user.id);
  return NextResponse.json({ ok: true });
}
