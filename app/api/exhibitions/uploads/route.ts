import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createSignedUploadUrl } from "@/lib/storage";
import { extensionForMime } from "@/lib/exhibitions";
import { mimeCapFor, type ExhibitionMediaKind } from "@/lib/exhibitions-shared";
import { consume } from "@/lib/rate-limit";

const POST_LIMIT = 5;
const POST_WINDOW_MS = 60 * 60 * 1000;

// Step 1 of posting to Exhibitions: get a URL the browser can upload the file to directly,
// bypassing Vercel's request-size limit. Step 2 is POST /api/exhibitions once that finishes.
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in to post." }, { status: 401 });

  const limited = consume(`exhupload:${session.user.id}`, POST_LIMIT, POST_WINDOW_MS);
  if (limited.limited) {
    return NextResponse.json({ error: "You're posting too quickly. Please try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const mediaType = body?.mediaType as ExhibitionMediaKind | undefined;
  const mime = typeof body?.mime === "string" ? body.mime : "";
  const size = Number(body?.size);

  if (mediaType !== "IMAGE" && mediaType !== "VIDEO") {
    return NextResponse.json({ error: "Choose a photo or a video to upload." }, { status: 400 });
  }
  const cap = mimeCapFor(mediaType);
  if (!cap.types.includes(mime)) {
    return NextResponse.json({ error: mediaType === "IMAGE" ? "Please upload a PNG, JPEG or WEBP image." : "Please upload an MP4, WEBM or MOV video." }, { status: 400 });
  }
  if (!Number.isFinite(size) || size <= 0 || size > cap.maxBytes) {
    return NextResponse.json({ error: `The file is too large. The limit is ${Math.round(cap.maxBytes / 1024 / 1024)} MB.` }, { status: 413 });
  }

  const path = `${session.user.id}/${crypto.randomUUID()}.${extensionForMime(mime)}`;
  const signed = await createSignedUploadUrl(path, mime);
  if ("error" in signed) return NextResponse.json({ error: signed.error }, { status: 503 });

  return NextResponse.json({ uploadUrl: signed.uploadUrl, path });
}
