import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createExhibitionComment, listExhibitionComments } from "@/lib/exhibitions";
import { EXHIBITION_COMMENT_MAX } from "@/lib/exhibitions-shared";
import { prisma } from "@/lib/prisma";
import { consume } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string }> };

const COMMENT_LIMIT = 30;
const COMMENT_WINDOW_MS = 10 * 60 * 1000;

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const comments = await listExhibitionComments(id, session?.user?.id);
  return NextResponse.json({ comments });
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in to comment." }, { status: 401 });

  const limited = consume(`exhcomment:${session.user.id}`, COMMENT_LIMIT, COMMENT_WINDOW_MS);
  if (limited.limited) {
    return NextResponse.json({ error: "You're commenting too quickly. Please slow down." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const text = typeof body?.body === "string" ? body.body.trim() : "";
  if (!text || text.length > EXHIBITION_COMMENT_MAX) {
    return NextResponse.json({ error: `Please write a comment of up to ${EXHIBITION_COMMENT_MAX} characters.` }, { status: 400 });
  }

  // Only approved posts accept comments — the same rule GET uses to decide what to show.
  const post = await prisma.exhibitionPost.findUnique({ where: { id }, select: { status: true } });
  if (!post || post.status !== "APPROVED") {
    return NextResponse.json({ error: "This post isn't available for comments." }, { status: 404 });
  }

  const comment = await createExhibitionComment(id, session.user.id, text);
  return NextResponse.json({ comment }, { status: 201 });
}
