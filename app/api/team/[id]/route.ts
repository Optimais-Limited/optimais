import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-auth";
import { deleteTeamMember, sniffTeamPhotoType, updateTeamMember } from "@/lib/team";
import { getObjectInfo, readObjectPrefix, deleteObject } from "@/lib/storage";
import { TEAM_PHOTO_MAX_BYTES, TEAM_PHOTO_MIME_TYPES } from "@/lib/team-shared";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { response } = await requireAdminSession();
  if (response) return response;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const data: Record<string, string> = {};
  for (const field of ["name", "role", "affiliation", "statement"] as const) {
    if (typeof body?.[field] === "string" && body[field].trim()) data[field] = body[field].trim();
  }

  const path = typeof body?.path === "string" ? body.path : undefined;
  if (path) {
    if (!path.startsWith("team/")) return NextResponse.json({ error: "We couldn't find the uploaded photo. Please try again." }, { status: 400 });
    const info = await getObjectInfo(path);
    if (!info) return NextResponse.json({ error: "We couldn't find the uploaded photo. Please try again." }, { status: 400 });
    const fail = async (error: string) => { await deleteObject(path); return NextResponse.json({ error }, { status: 400 }); };
    if (info.size <= 0 || info.size > TEAM_PHOTO_MAX_BYTES) return fail(`The image is too large. The limit is ${Math.round(TEAM_PHOTO_MAX_BYTES / 1024 / 1024)} MB.`);
    if (!(TEAM_PHOTO_MIME_TYPES as readonly string[]).includes(info.contentType)) return fail("Please upload a PNG, JPEG or WEBP image.");
    const prefix = await readObjectPrefix(path, 16);
    const sniffed = prefix ? sniffTeamPhotoType(prefix) : null;
    if (!sniffed || sniffed !== info.contentType) return fail("That file doesn't look like a valid image.");
    data.photoPath = path;
    data.photoMime = info.contentType;
  }

  const member = await updateTeamMember(id, data);
  if (!member) return NextResponse.json({ error: "Team member not found." }, { status: 404 });
  return NextResponse.json({ member });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { response } = await requireAdminSession();
  if (response) return response;
  const { id } = await params;

  const deleted = await deleteTeamMember(id);
  if (!deleted) return NextResponse.json({ error: "Team member not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
