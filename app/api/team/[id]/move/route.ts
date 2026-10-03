import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-auth";
import { moveTeamMember } from "@/lib/team";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { response } = await requireAdminSession();
  if (response) return response;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  if (body?.direction !== "up" && body?.direction !== "down") {
    return NextResponse.json({ error: "Direction must be up or down." }, { status: 400 });
  }

  const moved = await moveTeamMember(id, body.direction);
  return NextResponse.json({ ok: moved });
}
