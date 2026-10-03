import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-auth";
import { createSignedUploadUrl } from "@/lib/storage";
import { TEAM_PHOTO_MAX_BYTES, TEAM_PHOTO_MIME_TYPES } from "@/lib/team-shared";

const EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

// Step 1 of adding/editing a team photo: get a URL to upload the file to directly.
export async function POST(request: Request) {
  const { response } = await requireAdminSession();
  if (response) return response;

  const body = await request.json().catch(() => null);
  const mime = typeof body?.mime === "string" ? body.mime : "";
  const size = Number(body?.size);

  if (!(TEAM_PHOTO_MIME_TYPES as readonly string[]).includes(mime)) {
    return NextResponse.json({ error: "Please upload a PNG, JPEG or WEBP image." }, { status: 400 });
  }
  if (!Number.isFinite(size) || size <= 0 || size > TEAM_PHOTO_MAX_BYTES) {
    return NextResponse.json({ error: `The image is too large. The limit is ${Math.round(TEAM_PHOTO_MAX_BYTES / 1024 / 1024)} MB.` }, { status: 413 });
  }

  const path = `team/${crypto.randomUUID()}.${EXT[mime]}`;
  const signed = await createSignedUploadUrl(path, mime);
  if ("error" in signed) return NextResponse.json({ error: signed.error }, { status: 503 });
  return NextResponse.json({ uploadUrl: signed.uploadUrl, path });
}
