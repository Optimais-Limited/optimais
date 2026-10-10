import { prismaFailure, validationFailure } from "@/lib/api-errors";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blogPostSchema } from "@/lib/validators";
import { requireAdminSession } from "@/lib/api-auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdminSession();
  if (response) return response;

  const { id } = await params;
  const parsed = blogPostSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return validationFailure("Invalid post data.", parsed.error);
  }

  const existing = await prisma.blogPost.findUnique({ where: { id }, select: { publishedAt: true } });
  if (!existing) return NextResponse.json({ error: "That post no longer exists." }, { status: 404 });

  try {
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...parsed.data,
        // The first publish stamps the date; later edits keep it, so fixing a typo doesn't
        // re-date the post and jump it to the top of Insights.
        publishedAt: parsed.data.status === "PUBLISHED" ? existing.publishedAt ?? new Date() : existing.publishedAt
      }
    });
    return NextResponse.json({ post });
  } catch (err) {
    const failure = prismaFailure(err, "post");
    if (failure) return failure;
    throw err;
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdminSession();
  if (response) return response;

  const { id } = await params;
  await prisma.blogPost.deleteMany({ where: { id } });
  return NextResponse.json({ message: "Post deleted." });
}
