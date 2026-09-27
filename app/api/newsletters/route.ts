import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { NEWSLETTER_MAX_BYTES, NEWSLETTER_MAX_COMMENT, inspectPng } from "@/lib/newsletters";

// Admin only: post a newsletter as a PNG image plus a typed comment (multipart form).
export async function POST(request: Request) {
  const { response } = await requireAdminSession();
  if (response) return response;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Could not read the upload. Please try again." }, { status: 400 });
  }

  const file = form.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Please choose a PNG image to upload." }, { status: 400 });
  }
  if (file.size > NEWSLETTER_MAX_BYTES) {
    return NextResponse.json({ error: `The image is too large. The limit is ${NEWSLETTER_MAX_BYTES / 1024 / 1024} MB.` }, { status: 413 });
  }

  const comment = String(form.get("comment") ?? "").trim();
  if (comment.length > NEWSLETTER_MAX_COMMENT) {
    return NextResponse.json({ error: `The comment is too long (maximum ${NEWSLETTER_MAX_COMMENT} characters).` }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const png = inspectPng(bytes);
  if ("error" in png) return NextResponse.json({ error: png.error }, { status: 400 });

  const post = await prisma.newsletterPost.create({
    data: { comment, imageData: bytes, imageType: "image/png", imageSize: bytes.length, imageWidth: png.width, imageHeight: png.height },
    select: { id: true, comment: true, createdAt: true, imageWidth: true, imageHeight: true }
  });

  return NextResponse.json({ post }, { status: 201 });
}
