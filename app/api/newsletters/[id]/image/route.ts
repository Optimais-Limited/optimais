import { prisma } from "@/lib/prisma";

// Public: the newsletter pages embed this URL. Only the image bytes are read here.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.newsletterPost.findUnique({ where: { id }, select: { imageData: true, imageType: true, imageSize: true } });
  if (!post) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(post.imageData), {
    headers: {
      "Content-Type": post.imageType,
      "Content-Length": String(post.imageSize),
      // An image never changes once posted, so let browsers and the CDN keep it for a day.
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "Content-Disposition": "inline"
    }
  });
}
