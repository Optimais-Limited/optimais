// Dependency-free, so it is safe to import from both server code and browser components
// (lib/exhibitions.ts pulls in Prisma and must stay server-only).

export const EXHIBITION_TITLE_MAX = 120;
export const EXHIBITION_DESCRIPTION_MAX = 4000;
export const EXHIBITION_COMMENT_MAX = 2000;

// Uploads go straight from the browser to Supabase Storage, so these caps aren't limited
// by Vercel's ~4.5 MB request body cap the way newsletter images are.
export const EXHIBITION_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
export const EXHIBITION_VIDEO_MAX_BYTES = 80 * 1024 * 1024;

export const EXHIBITION_IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const EXHIBITION_VIDEO_MIME_TYPES = ["video/mp4", "video/webm", "video/quicktime"] as const;

export type ExhibitionMediaKind = "IMAGE" | "VIDEO";
export type ExhibitionStatusKind = "PENDING" | "APPROVED" | "REJECTED";

// A fixed set keeps the reaction bar meaningful and stops the field being used to store arbitrary text.
export const EXHIBITION_REACTIONS = ["👍", "❤️", "👌", "🎉", "👏", "😮"] as const;
export type ExhibitionReactionEmoji = (typeof EXHIBITION_REACTIONS)[number];

export function mimeCapFor(mediaType: ExhibitionMediaKind): { types: readonly string[]; maxBytes: number } {
  return mediaType === "IMAGE"
    ? { types: EXHIBITION_IMAGE_MIME_TYPES, maxBytes: EXHIBITION_IMAGE_MAX_BYTES }
    : { types: EXHIBITION_VIDEO_MIME_TYPES, maxBytes: EXHIBITION_VIDEO_MAX_BYTES };
}

export type ExhibitionSummary = {
  id: string;
  title: string;
  description: string;
  mediaType: ExhibitionMediaKind;
  mediaUrl: string;
  mediaWidth: number | null;
  mediaHeight: number | null;
  status: ExhibitionStatusKind;
  isOwn: boolean;
  authorName: string;
  createdAt: string;
  commentCount: number;
  reactionCounts: Partial<Record<ExhibitionReactionEmoji, number>>;
  viewerReaction: ExhibitionReactionEmoji | null;
};

export type ExhibitionComment = {
  id: string;
  body: string;
  createdAt: string;
  authorName: string;
  isOwn: boolean;
};

// Media is served through our own route (never a direct storage URL), so we can enforce that
// pending/rejected posts stay private to their author and to moderators until approved.
export const exhibitionMediaUrl = (id: string) => `/api/exhibitions/${id}/media`;

export function formatExhibitionDate(iso: string): string {
  // Fixed to UTC so the server render and the browser always agree.
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
