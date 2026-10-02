// Dependency-free, so it is safe to import from both server code and browser components
// (lib/discussions.ts pulls in Prisma and must stay server-only).

export const DISCUSSION_TITLE_MAX = 120;
export const DISCUSSION_DESCRIPTION_MAX = 2000;
export const DISCUSSION_MESSAGE_MAX = 4000;

// How often an open room's page polls for new messages. There's no realtime
// infrastructure yet (see lib/discussions.ts), so "live" means a short poll.
export const DISCUSSION_POLL_MS = 4000;

export type DiscussionStatusKind = "OPEN" | "CLOSED";

export type DiscussionRoomSummary = {
  id: string;
  title: string;
  description: string;
  status: DiscussionStatusKind;
  hostName: string;
  isHost: boolean;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
};

export type DiscussionMessage = {
  id: string;
  body: string;
  createdAt: string;
  authorName: string;
  isOwn: boolean;
};

export function formatDiscussionDate(iso: string): string {
  // Fixed to UTC so the server render and the browser always agree.
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
}
