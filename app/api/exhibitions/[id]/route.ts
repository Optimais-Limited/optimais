import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdminSession } from "@/lib/api-auth";
import { deleteExhibitionPostAndMedia, getExhibitionForViewer, moderateExhibitionPost } from "@/lib/exhibitions";
import { logAdminAction } from "@/lib/activity-log";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

function isModeratorRole(role?: string) {
  return role === "ADMIN" || role === "EDITOR";
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const post = await getExhibitionForViewer(id, session?.user?.id, isModeratorRole(session?.user?.role));
  if (!post) return NextResponse.json({ error: "Exhibition post not found." }, { status: 404 });
  return NextResponse.json({ post });
}

// Admin only: approve or reject a submission.
export async function PATCH(request: Request, { params }: Params) {
  const { session, response } = await requireAdminSession();
  if (response) return response;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const status = body?.status;
  if (status !== "APPROVED" && status !== "REJECTED") {
    return NextResponse.json({ error: "Status must be APPROVED or REJECTED." }, { status: 400 });
  }

  const post = await moderateExhibitionPost(id, session!.user!.id, status);
  if (!post) return NextResponse.json({ error: "Exhibition post not found." }, { status: 404 });
  await logAdminAction({
    actor: { name: session!.user!.name ?? null, email: session!.user!.email! },
    action: status === "APPROVED" ? "exhibition.approved" : "exhibition.rejected",
    targetType: "ExhibitionPost",
    targetId: post.id,
    summary: `${status === "APPROVED" ? "Approved" : "Rejected"} "${post.title}" by ${post.authorName}`
  });
  return NextResponse.json({ post });
}

// The author of a post, or an admin/editor, can take it down.
export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const existing = await prisma.exhibitionPost.findUnique({ where: { id }, select: { authorId: true, title: true } });
  if (!existing) return NextResponse.json({ error: "Exhibition post not found." }, { status: 404 });
  const isModerator = isModeratorRole(session.user.role);
  if (existing.authorId !== session.user.id && !isModerator) {
    return NextResponse.json({ error: "You can only delete your own posts." }, { status: 403 });
  }

  await deleteExhibitionPostAndMedia(id);
  // Only log a moderator removing someone else's post — deleting your own isn't a moderation action.
  if (isModerator && existing.authorId !== session.user.id) {
    await logAdminAction({
      actor: { name: session.user.name ?? null, email: session.user.email! },
      action: "exhibition.deleted",
      targetType: "ExhibitionPost",
      targetId: id,
      summary: `Deleted "${existing.title}"`
    });
  }
  return NextResponse.json({ ok: true });
}
