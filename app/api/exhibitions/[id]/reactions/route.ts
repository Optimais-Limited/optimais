import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { removeExhibitionReaction, upsertExhibitionReaction } from "@/lib/exhibitions";
import { EXHIBITION_REACTIONS, type ExhibitionReactionEmoji } from "@/lib/exhibitions-shared";
import { prisma } from "@/lib/prisma";
import { consume } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string }> };

const REACTION_LIMIT = 60;
const REACTION_WINDOW_MS = 10 * 60 * 1000;

async function requireApprovedPost(id: string) {
  const post = await prisma.exhibitionPost.findUnique({ where: { id }, select: { status: true } });
  return post?.status === "APPROVED";
}

// Sets (or changes) the signed-in visitor's reaction to this post. One reaction per person.
export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in to react." }, { status: 401 });

  const limited = consume(`exhreaction:${session.user.id}`, REACTION_LIMIT, REACTION_WINDOW_MS);
  if (limited.limited) return NextResponse.json({ error: "Please slow down." }, { status: 429 });

  const body = await request.json().catch(() => null);
  const emoji = body?.emoji as ExhibitionReactionEmoji | undefined;
  if (!emoji || !(EXHIBITION_REACTIONS as readonly string[]).includes(emoji)) {
    return NextResponse.json({ error: "Unsupported reaction." }, { status: 400 });
  }
  if (!(await requireApprovedPost(id))) return NextResponse.json({ error: "Exhibition post not found." }, { status: 404 });

  await upsertExhibitionReaction(id, session.user.id, emoji);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  await removeExhibitionReaction(id, session.user.id);
  return NextResponse.json({ ok: true });
}
