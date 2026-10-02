import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getObjectInfo, readObjectPrefix, deleteObject } from "@/lib/storage";
import { createExhibitionPost, listExhibitions, sniffImageType } from "@/lib/exhibitions";
import { EXHIBITION_DESCRIPTION_MAX, EXHIBITION_TITLE_MAX, mimeCapFor, type ExhibitionMediaKind } from "@/lib/exhibitions-shared";
import { consume } from "@/lib/rate-limit";

const POST_LIMIT = 5;
const POST_WINDOW_MS = 60 * 60 * 1000;

export async function GET() {
  const session = await getServerSession(authOptions);
  const posts = await listExhibitions(session?.user?.id);
  return NextResponse.json({ posts });
}

// Step 2 of posting: the file is already in storage (see /api/exhibitions/uploads); this records
// it as a post. We re-check what Supabase actually received rather than trusting the request body.
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in to post." }, { status: 401 });

  const limited = consume(`exhpost:${session.user.id}`, POST_LIMIT, POST_WINDOW_MS);
  if (limited.limited) {
    return NextResponse.json({ error: "You're posting too quickly. Please try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const mediaType = body?.mediaType as ExhibitionMediaKind | undefined;
  const path = typeof body?.path === "string" ? body.path : "";

  if (title.length < 3 || title.length > EXHIBITION_TITLE_MAX) {
    return NextResponse.json({ error: `Please give your project a title (3–${EXHIBITION_TITLE_MAX} characters).` }, { status: 400 });
  }
  if (description.length < 10 || description.length > EXHIBITION_DESCRIPTION_MAX) {
    return NextResponse.json({ error: `Please describe your project (10–${EXHIBITION_DESCRIPTION_MAX} characters).` }, { status: 400 });
  }
  if (mediaType !== "IMAGE" && mediaType !== "VIDEO") {
    return NextResponse.json({ error: "Choose a photo or a video to upload." }, { status: 400 });
  }
  // Uploaded paths are "{userId}/{uuid}.{ext}" — reject anything that isn't this user's own upload.
  if (!path.startsWith(`${session.user.id}/`)) {
    return NextResponse.json({ error: "We couldn't find the uploaded file. Please try again." }, { status: 400 });
  }

  const info = await getObjectInfo(path);
  if (!info) {
    return NextResponse.json({ error: "We couldn't find the uploaded file. Please try again." }, { status: 400 });
  }

  const cap = mimeCapFor(mediaType);
  const fail = async (error: string) => {
    await deleteObject(path);
    return NextResponse.json({ error }, { status: 400 });
  };
  if (info.size <= 0 || info.size > cap.maxBytes) {
    return fail(`The file is too large. The limit is ${Math.round(cap.maxBytes / 1024 / 1024)} MB.`);
  }
  if (!cap.types.includes(info.contentType)) {
    return fail(mediaType === "IMAGE" ? "Please upload a PNG, JPEG or WEBP image." : "Please upload an MP4, WEBM or MOV video.");
  }

  let width: number | null = null;
  let height: number | null = null;
  if (mediaType === "IMAGE") {
    // Content-Type alone is only what the browser claimed at upload time — check the real bytes.
    const prefix = await readObjectPrefix(path, 16);
    const sniffed = prefix ? sniffImageType(prefix) : null;
    if (!sniffed || sniffed !== info.contentType) {
      return fail("That file doesn't look like a valid image.");
    }
    const w = Number(body?.width);
    const h = Number(body?.height);
    if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0 && w <= 20000 && h <= 20000) {
      width = Math.round(w);
      height = Math.round(h);
    }
  }

  const isModerator = session.user.role === "ADMIN" || session.user.role === "EDITOR";
  const post = await createExhibitionPost({
    authorId: session.user.id,
    title,
    description,
    mediaType,
    mediaPath: path,
    mediaMime: info.contentType,
    mediaSize: info.size,
    mediaWidth: width,
    mediaHeight: height,
    autoApprove: isModerator
  });

  return NextResponse.json({ post }, { status: 201 });
}
