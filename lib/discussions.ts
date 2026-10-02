import { prisma } from "@/lib/prisma";
import { endVoiceRoom } from "@/lib/livekit";
import type { DiscussionMessage, DiscussionRoomSummary, DiscussionStatusKind } from "@/lib/discussions-shared";

export * from "@/lib/discussions-shared";

const authorSelect = { select: { name: true } } as const;

function displayName(author: { name: string | null } | null): string {
  return author?.name?.trim() || "Member";
}

function toSummary(row: {
  id: string; title: string; description: string; status: string; hostId: string;
  createdAt: Date; updatedAt: Date; host: { name: string | null } | null; _count: { messages: number };
}, viewerId?: string): DiscussionRoomSummary {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as DiscussionStatusKind,
    hostName: displayName(row.host),
    isHost: row.hostId === viewerId,
    messageCount: row._count.messages,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

const roomInclude = { host: authorSelect, _count: { select: { messages: true } } } as const;

// A DB hiccup returns an empty list instead of a 500 — the page just looks quiet.
export async function listDiscussionRooms(viewerId?: string, limit = 60): Promise<DiscussionRoomSummary[]> {
  try {
    const rows = await prisma.discussionRoom.findMany({ orderBy: { updatedAt: "desc" }, take: limit, include: roomInclude });
    return rows.map((row) => toSummary(row, viewerId));
  } catch (err) {
    console.error("listDiscussionRooms failed:", err);
    return [];
  }
}

// Returns null if the room doesn't exist or a DB error occurs, so the page shows "not found" instead of crashing.
export async function getDiscussionRoom(id: string, viewerId?: string): Promise<DiscussionRoomSummary | null> {
  try {
    const row = await prisma.discussionRoom.findUnique({ where: { id }, include: roomInclude });
    return row ? toSummary(row, viewerId) : null;
  } catch (err) {
    console.error("getDiscussionRoom failed:", err);
    return null;
  }
}

export async function createDiscussionRoom(hostId: string, title: string, description: string): Promise<DiscussionRoomSummary> {
  const row = await prisma.discussionRoom.create({ data: { hostId, title, description }, include: roomInclude });
  return toSummary(row, hostId);
}

/** Sets a room's status if the requester hosts it or is a moderator. Returns null if not allowed or missing. */
export async function setDiscussionRoomStatus(id: string, status: DiscussionStatusKind, requesterId: string, isModerator: boolean): Promise<DiscussionRoomSummary | null> {
  const where = isModerator ? { id } : { id, hostId: requesterId };
  const result = await prisma.discussionRoom.updateMany({ where, data: { status } });
  if (result.count === 0) return null;
  if (status === "CLOSED") await endVoiceRoom(id);
  return getDiscussionRoom(id, requesterId);
}

/** Deletes a room if the requester hosts it or is a moderator. Returns whether it deleted anything. */
export async function deleteDiscussionRoom(id: string, requesterId: string, isModerator: boolean): Promise<boolean> {
  const where = isModerator ? { id } : { id, hostId: requesterId };
  const result = await prisma.discussionRoom.deleteMany({ where });
  if (result.count > 0) await endVoiceRoom(id);
  return result.count > 0;
}

export async function createDiscussionMessage(roomId: string, authorId: string, body: string): Promise<DiscussionMessage> {
  const [row] = await prisma.$transaction([
    prisma.discussionMessage.create({ data: { roomId, authorId, body }, include: { author: authorSelect } }),
    prisma.discussionRoom.update({ where: { id: roomId }, data: { updatedAt: new Date() } })
  ]);
  return { id: row.id, body: row.body, createdAt: row.createdAt.toISOString(), authorName: displayName(row.author), isOwn: true };
}

export async function listDiscussionMessages(roomId: string, afterId?: string, viewerId?: string, limit = 300): Promise<DiscussionMessage[]> {
  const rows = await prisma.discussionMessage.findMany({
    where: { roomId },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: limit,
    include: { author: authorSelect },
    ...(afterId ? { cursor: { id: afterId }, skip: 1 } : {})
  });
  return rows.map((row) => ({
    id: row.id,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    authorName: displayName(row.author),
    isOwn: row.authorId === viewerId
  }));
}
