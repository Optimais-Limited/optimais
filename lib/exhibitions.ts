import { prisma } from "@/lib/prisma";
import { deleteObject } from "@/lib/storage";
import {
  EXHIBITION_REACTIONS,
  exhibitionMediaUrl,
  type ExhibitionComment,
  type ExhibitionMediaKind,
  type ExhibitionReactionEmoji,
  type ExhibitionStatusKind,
  type ExhibitionSummary
} from "@/lib/exhibitions-shared";

export * from "@/lib/exhibitions-shared";

export function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/png": return "png";
    case "image/jpeg": return "jpg";
    case "image/webp": return "webp";
    case "video/mp4": return "mp4";
    case "video/webm": return "webm";
    case "video/quicktime": return "mov";
    default: return "bin";
  }
}

/** Sniffs the real file signature so a mislabelled or malicious upload can't pass as an image. */
export function sniffImageType(bytes: Uint8Array): "image/png" | "image/jpeg" | "image/webp" | null {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) {
    return "image/png";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return "image/webp";
  }
  return null;
}

const authorSelect = { select: { name: true } } as const;

function displayName(author: { name: string | null } | null): string {
  return author?.name?.trim() || "Member";
}

type RawPost = {
  id: string;
  title: string;
  description: string;
  mediaType: string;
  mediaPath: string;
  mediaWidth: number | null;
  mediaHeight: number | null;
  status: string;
  authorId: string;
  createdAt: Date;
  author: { name: string | null } | null;
  _count: { comments: number };
  reactions: { emoji: string; authorId: string }[];
};

function toSummary(post: RawPost, viewerId?: string): ExhibitionSummary {
  const reactionCounts: Partial<Record<ExhibitionReactionEmoji, number>> = {};
  let viewerReaction: ExhibitionReactionEmoji | null = null;
  for (const r of post.reactions) {
    if ((EXHIBITION_REACTIONS as readonly string[]).includes(r.emoji)) {
      const emoji = r.emoji as ExhibitionReactionEmoji;
      reactionCounts[emoji] = (reactionCounts[emoji] ?? 0) + 1;
    }
    if (viewerId && r.authorId === viewerId) viewerReaction = r.emoji as ExhibitionReactionEmoji;
  }
  return {
    id: post.id,
    title: post.title,
    description: post.description,
    mediaType: post.mediaType as ExhibitionMediaKind,
    mediaUrl: exhibitionMediaUrl(post.id),
    mediaWidth: post.mediaWidth,
    mediaHeight: post.mediaHeight,
    status: post.status as ExhibitionStatusKind,
    isOwn: post.authorId === viewerId,
    authorName: displayName(post.author),
    createdAt: post.createdAt.toISOString(),
    commentCount: post._count.comments,
    reactionCounts,
    viewerReaction
  };
}

const postInclude = {
  author: authorSelect,
  _count: { select: { comments: true } },
  reactions: { select: { emoji: true, authorId: true } }
} as const;

// Approved posts for everyone, plus the viewer's own posts whatever their status (so someone can
// see their pending/rejected submission). A DB hiccup returns an empty list instead of a 500.
export async function listExhibitions(viewerId?: string, limit = 60): Promise<ExhibitionSummary[]> {
  try {
    const rows = await prisma.exhibitionPost.findMany({
      where: viewerId ? { OR: [{ status: "APPROVED" }, { authorId: viewerId }] } : { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: postInclude
    });
    return rows.map((row) => toSummary(row, viewerId));
  } catch (err) {
    console.error("listExhibitions failed:", err);
    return [];
  }
}

export async function getLatestAdminExhibition(): Promise<ExhibitionSummary | null> {
  try {
    const row = await prisma.exhibitionPost.findFirst({
      where: { status: "APPROVED", author: { role: { in: ["ADMIN", "EDITOR"] } } },
      orderBy: { createdAt: "desc" },
      include: postInclude
    });
    return row ? toSummary(row) : null;
  } catch (err) {
    console.error("getLatestAdminExhibition failed:", err);
    return null;
  }
}

export async function listExhibitionsForModeration(): Promise<ExhibitionSummary[]> {
  try {
    const rows = await prisma.exhibitionPost.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: postInclude
    });
    // Pending posts need attention first; enum order (APPROVED, PENDING, REJECTED) isn't that, so sort in JS.
    const priority: Record<string, number> = { PENDING: 0, APPROVED: 1, REJECTED: 2 };
    return rows.map((row) => toSummary(row)).sort((a, b) => priority[a.status] - priority[b.status]);
  } catch (err) {
    console.error("listExhibitionsForModeration failed:", err);
    return [];
  }
}

/** Full row for one post, or null if it doesn't exist, the viewer isn't allowed to see it yet, or a DB error occurs (the page just shows "not found" instead of crashing). */
export async function getExhibitionForViewer(id: string, viewerId: string | undefined, isModerator: boolean): Promise<ExhibitionSummary | null> {
  try {
    const row = await prisma.exhibitionPost.findUnique({ where: { id }, include: postInclude });
    if (!row) return null;
    if (row.status !== "APPROVED" && row.authorId !== viewerId && !isModerator) return null;
    return toSummary(row, viewerId);
  } catch (err) {
    console.error("getExhibitionForViewer failed:", err);
    return null;
  }
}

export async function listExhibitionComments(postId: string, viewerId?: string): Promise<ExhibitionComment[]> {
  const rows = await prisma.exhibitionComment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    take: 500,
    include: { author: authorSelect }
  });
  return rows.map((row) => ({
    id: row.id,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    authorName: displayName(row.author),
    isOwn: row.authorId === viewerId
  }));
}

export async function deleteExhibitionPostAndMedia(id: string): Promise<void> {
  const row = await prisma.exhibitionPost.findUnique({ where: { id }, select: { mediaPath: true } });
  await prisma.exhibitionPost.delete({ where: { id } });
  if (row) await deleteObject(row.mediaPath);
}

export type NewExhibitionPost = {
  authorId: string;
  title: string;
  description: string;
  mediaType: ExhibitionMediaKind;
  mediaPath: string;
  mediaMime: string;
  mediaSize: number;
  mediaWidth: number | null;
  mediaHeight: number | null;
  autoApprove: boolean;
};

export async function createExhibitionPost(input: NewExhibitionPost): Promise<ExhibitionSummary> {
  const row = await prisma.exhibitionPost.create({
    data: {
      authorId: input.authorId,
      title: input.title,
      description: input.description,
      mediaType: input.mediaType,
      mediaPath: input.mediaPath,
      mediaMime: input.mediaMime,
      mediaSize: input.mediaSize,
      mediaWidth: input.mediaWidth,
      mediaHeight: input.mediaHeight,
      status: input.autoApprove ? "APPROVED" : "PENDING",
      reviewedById: input.autoApprove ? input.authorId : null,
      reviewedAt: input.autoApprove ? new Date() : null
    },
    include: postInclude
  });
  return toSummary(row, input.authorId);
}

export async function moderateExhibitionPost(id: string, reviewerId: string, status: "APPROVED" | "REJECTED"): Promise<ExhibitionSummary | null> {
  try {
    const row = await prisma.exhibitionPost.update({
      where: { id },
      data: { status, reviewedById: reviewerId, reviewedAt: new Date() },
      include: postInclude
    });
    return toSummary(row);
  } catch {
    return null;
  }
}

export async function createExhibitionComment(postId: string, authorId: string, body: string): Promise<ExhibitionComment> {
  const row = await prisma.exhibitionComment.create({
    data: { postId, authorId, body },
    include: { author: authorSelect }
  });
  return { id: row.id, body: row.body, createdAt: row.createdAt.toISOString(), authorName: displayName(row.author), isOwn: true };
}

/** Deletes a comment if the requester wrote it or is a moderator. Returns whether it deleted anything. */
export async function deleteExhibitionComment(commentId: string, requesterId: string, isModerator: boolean): Promise<boolean> {
  const where = isModerator ? { id: commentId } : { id: commentId, authorId: requesterId };
  const result = await prisma.exhibitionComment.deleteMany({ where });
  return result.count > 0;
}

export async function upsertExhibitionReaction(postId: string, authorId: string, emoji: ExhibitionReactionEmoji): Promise<void> {
  await prisma.exhibitionReaction.upsert({
    where: { postId_authorId: { postId, authorId } },
    update: { emoji },
    create: { postId, authorId, emoji }
  });
}

export async function removeExhibitionReaction(postId: string, authorId: string): Promise<void> {
  await prisma.exhibitionReaction.deleteMany({ where: { postId, authorId } });
}
