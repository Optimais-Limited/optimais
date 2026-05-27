import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blogPostSchema } from "@/lib/validators";
import { requireAdminSession } from "@/lib/api-auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const admin = searchParams.get("admin") === "true";

  if (admin) {
    const { response } = await requireAdminSession();
    if (response) return response;
  }

  const posts = await prisma.blogPost.findMany({
    where: admin ? {} : { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }]
  });

  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const { response } = await requireAdminSession();
  if (response) return response;

  const parsed = blogPostSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid post data.", details: parsed.error.flatten() }, { status: 400 });
  }

  const post = await prisma.blogPost.create({
    data: {
      ...parsed.data,
      publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null
    }
  });

  return NextResponse.json({ post }, { status: 201 });
}
