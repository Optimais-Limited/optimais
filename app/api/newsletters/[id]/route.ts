import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { NEWSLETTER_MAX_COMMENT } from "@/lib/newsletters";

type Params = { params: Promise<{ id: string }> };

// Admin only: fix the wording of a comment without re-uploading the image.
export async function PATCH(request: Request, { params }: Params) {
  const { response } = await requireAdminSession();
  if (response) return response;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const comment = typeof body?.comment === "string" ? body.comment.trim() : null;
  if (comment === null || comment.length > NEWSLETTER_MAX_COMMENT) {
    return NextResponse.json({ error: `Please provide a comment of up to ${NEWSLETTER_MAX_COMMENT} characters.` }, { status: 400 });
  }

  try {
    const post = await prisma.newsletterPost.update({
      where: { id },
      data: { comment },
      select: { id: true, comment: true, createdAt: true, imageWidth: true, imageHeight: true }
    });
    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: "Newsletter not found." }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { response } = await requireAdminSession();
  if (response) return response;
  const { id } = await params;

  const result = await prisma.newsletterPost.deleteMany({ where: { id } });
  if (result.count === 0) return NextResponse.json({ error: "Newsletter not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
