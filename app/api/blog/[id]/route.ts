import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blogPostSchema } from "@/lib/validators";
import { requireAdminSession } from "@/lib/api-auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdminSession();
  if (response) return response;

  const { id } = await params;
  const parsed = blogPostSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid post data.", details: parsed.error.flatten() }, { status: 400 });
  }

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      ...parsed.data,
      publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null
    }
  });

  return NextResponse.json({ post });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdminSession();
  if (response) return response;

  const { id } = await params;
  await prisma.blogPost.delete({ where: { id } });
  return NextResponse.json({ message: "Post deleted." });
}
