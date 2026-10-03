import { NextResponse } from "next/server";
import { getTeamMemberPhotoPath } from "@/lib/team";
import { createSignedViewUrl } from "@/lib/storage";

type Params = { params: Promise<{ id: string }> };

// Team photos are always public — there's no moderation state to gate, unlike Exhibitions.
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const path = await getTeamMemberPhotoPath(id);
  if (!path) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const url = await createSignedViewUrl(path, 3600);
  if (!url) return NextResponse.json({ error: "Photo is temporarily unavailable." }, { status: 502 });
  return NextResponse.redirect(url, { status: 302, headers: { "Cache-Control": "public, max-age=1800" } });
}
