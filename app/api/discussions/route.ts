import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createDiscussionRoom, listDiscussionRooms } from "@/lib/discussions";
import { DISCUSSION_DESCRIPTION_MAX, DISCUSSION_TITLE_MAX } from "@/lib/discussions-shared";
import { consume } from "@/lib/rate-limit";

const ROOM_LIMIT = 10;
const ROOM_WINDOW_MS = 60 * 60 * 1000;

export async function GET() {
  const session = await getServerSession(authOptions);
  const rooms = await listDiscussionRooms(session?.user?.id);
  return NextResponse.json({ rooms });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in to start a discussion." }, { status: 401 });

  const limited = consume(`discroom:${session.user.id}`, ROOM_LIMIT, ROOM_WINDOW_MS);
  if (limited.limited) return NextResponse.json({ error: "Please wait before starting another discussion." }, { status: 429 });

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  if (title.length < 3 || title.length > DISCUSSION_TITLE_MAX) {
    return NextResponse.json({ error: `Please give your discussion a title (3–${DISCUSSION_TITLE_MAX} characters).` }, { status: 400 });
  }
  if (description.length < 10 || description.length > DISCUSSION_DESCRIPTION_MAX) {
    return NextResponse.json({ error: `Please describe what you'll discuss (10–${DISCUSSION_DESCRIPTION_MAX} characters).` }, { status: 400 });
  }

  const room = await createDiscussionRoom(session.user.id, title, description);
  return NextResponse.json({ room }, { status: 201 });
}
