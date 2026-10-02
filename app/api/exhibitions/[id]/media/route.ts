import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSignedViewUrl } from "@/lib/storage";

type Params = { params: Promise<{ id: string }> };

// The R2 bucket is private, so every view goes through here: we check the post is APPROVED (or
// the viewer is its author or a moderator) and only then hand out a short-lived signed URL.
// Redirecting (rather than proxying the bytes ourselves) lets R2 serve the file directly,
// including Range requests for video seeking.
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const post = await prisma.exhibitionPost.findUnique({ where: { id }, select: { mediaPath: true, status: true, authorId: true } });
  if (!post) return NextResponse.json({ error: "Not found." }, { status: 404 });

  if (post.status !== "APPROVED") {
    const session = await getServerSession(authOptions);
    const isModerator = session?.user?.role === "ADMIN" || session?.user?.role === "EDITOR";
    if (post.authorId !== session?.user?.id && !isModerator) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
  }

  const url = await createSignedViewUrl(post.mediaPath);
  if (!url) return NextResponse.json({ error: "Media is temporarily unavailable." }, { status: 502 });

  // Never let a shared/cached copy of this redirect leak a pending post's signed URL to someone else.
  const cache = post.status === "APPROVED" ? "private, max-age=240" : "private, no-store";
  return NextResponse.redirect(url, { status: 302, headers: { "Cache-Control": cache } });
}
