import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteDiscussionRoom, getDiscussionRoom, setDiscussionRoomStatus } from "@/lib/discussions";
import { logAdminAction } from "@/lib/activity-log";

type Params = { params: Promise<{ id: string }> };

function isModeratorRole(role?: string) {
  return role === "ADMIN" || role === "EDITOR";
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const room = await getDiscussionRoom(id, session?.user?.id);
  if (!room) return NextResponse.json({ error: "Discussion not found." }, { status: 404 });
  return NextResponse.json({ room });
}

// The host, or an admin/editor, can end a discussion. Once closed it stays closed (read-only).
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (body?.status !== "CLOSED") return NextResponse.json({ error: "Status must be CLOSED." }, { status: 400 });

  const room = await setDiscussionRoomStatus(id, "CLOSED", session.user.id, isModeratorRole(session.user.role));
  if (!room) return NextResponse.json({ error: "Discussion not found." }, { status: 404 });
  // Only log a moderator ending someone else's discussion — the host closing their own isn't a moderation action.
  if (isModeratorRole(session.user.role) && !room.isHost) {
    await logAdminAction({ actor: { name: session.user.name ?? null, email: session.user.email! }, action: "discussion.closed", targetType: "DiscussionRoom", targetId: id, summary: `Ended "${room.title}" (hosted by ${room.hostName})` });
  }
  return NextResponse.json({ room });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const existing = await getDiscussionRoom(id, session.user.id);
  const deleted = await deleteDiscussionRoom(id, session.user.id, isModeratorRole(session.user.role));
  if (!deleted) return NextResponse.json({ error: "Discussion not found." }, { status: 404 });
  if (existing && isModeratorRole(session.user.role) && !existing.isHost) {
    await logAdminAction({ actor: { name: session.user.name ?? null, email: session.user.email! }, action: "discussion.deleted", targetType: "DiscussionRoom", targetId: id, summary: `Deleted "${existing.title}" (hosted by ${existing.hostName})` });
  }
  return NextResponse.json({ ok: true });
}
