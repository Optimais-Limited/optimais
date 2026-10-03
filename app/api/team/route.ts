import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-auth";
import { createTeamMember, listTeamMembers, sniffTeamPhotoType } from "@/lib/team";
import { getObjectInfo, readObjectPrefix, deleteObject } from "@/lib/storage";
import { TEAM_PHOTO_MAX_BYTES, TEAM_PHOTO_MIME_TYPES } from "@/lib/team-shared";

export async function GET() {
  const members = await listTeamMembers();
  return NextResponse.json({ members });
}

// Step 2: the photo is already in storage (see /api/team/uploads); this records the person.
export async function POST(request: Request) {
  const { response } = await requireAdminSession();
  if (response) return response;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const role = typeof body?.role === "string" ? body.role.trim() : "";
  const affiliation = typeof body?.affiliation === "string" ? body.affiliation.trim() : "";
  const statement = typeof body?.statement === "string" ? body.statement.trim() : "";
  const path = typeof body?.path === "string" ? body.path : "";

  if (!name) return NextResponse.json({ error: "Please enter a name." }, { status: 400 });
  if (!role) return NextResponse.json({ error: "Please enter their title at Optimais Labs." }, { status: 400 });
  if (!path.startsWith("team/")) return NextResponse.json({ error: "We couldn't find the uploaded photo. Please try again." }, { status: 400 });

  const info = await getObjectInfo(path);
  if (!info) return NextResponse.json({ error: "We couldn't find the uploaded photo. Please try again." }, { status: 400 });

  const fail = async (error: string) => { await deleteObject(path); return NextResponse.json({ error }, { status: 400 }); };
  if (info.size <= 0 || info.size > TEAM_PHOTO_MAX_BYTES) return fail(`The image is too large. The limit is ${Math.round(TEAM_PHOTO_MAX_BYTES / 1024 / 1024)} MB.`);
  if (!(TEAM_PHOTO_MIME_TYPES as readonly string[]).includes(info.contentType)) return fail("Please upload a PNG, JPEG or WEBP image.");

  const prefix = await readObjectPrefix(path, 16);
  const sniffed = prefix ? sniffTeamPhotoType(prefix) : null;
  if (!sniffed || sniffed !== info.contentType) return fail("That file doesn't look like a valid image.");

  const member = await createTeamMember({ name, role, affiliation, statement, photoPath: path, photoMime: info.contentType });
  return NextResponse.json({ member }, { status: 201 });
}
