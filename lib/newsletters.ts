import { prisma } from "@/lib/prisma";

import type { NewsletterSummary } from "@/lib/newsletter-shared";

export { NEWSLETTER_MAX_BYTES, NEWSLETTER_MAX_COMMENT } from "@/lib/newsletter-shared";
export type { NewsletterSummary } from "@/lib/newsletter-shared";

const MAX_DIMENSION = 12000;

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** Checks the real file signature and reads the size from the IHDR chunk. Returns an error message, or the dimensions. */
export function inspectPng(bytes: Uint8Array): { error: string } | { width: number; height: number } {
  if (bytes.length < 33) return { error: "That file is not a valid PNG image." };
  for (let i = 0; i < PNG_SIGNATURE.length; i++) {
    if (bytes[i] !== PNG_SIGNATURE[i]) return { error: "That file is not a PNG image. Please upload a .png file." };
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const chunkType = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]);
  if (chunkType !== "IHDR") return { error: "That file is not a valid PNG image." };
  const width = view.getUint32(16);
  const height = view.getUint32(20);
  if (width < 1 || height < 1 || width > MAX_DIMENSION || height > MAX_DIMENSION) {
    return { error: `Image dimensions must be between 1 and ${MAX_DIMENSION}px.` };
  }
  return { width, height };
}

const summarySelect = { id: true, comment: true, createdAt: true, imageWidth: true, imageHeight: true } as const;

function toSummary(row: { id: string; comment: string; createdAt: Date; imageWidth: number; imageHeight: number }): NewsletterSummary {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

// Listings never select imageData, so pages stay light no matter how many images are stored.
// Failures return an empty result so a database hiccup never takes down the landing page.
export async function getLatestNewsletter(): Promise<NewsletterSummary | null> {
  try {
    const row = await prisma.newsletterPost.findFirst({ orderBy: { createdAt: "desc" }, select: summarySelect });
    return row ? toSummary(row) : null;
  } catch (err) {
    console.error("getLatestNewsletter failed:", err);
    return null;
  }
}

export async function listNewsletters(limit = 100): Promise<NewsletterSummary[]> {
  try {
    const rows = await prisma.newsletterPost.findMany({ orderBy: { createdAt: "desc" }, take: limit, select: summarySelect });
    return rows.map(toSummary);
  } catch (err) {
    console.error("listNewsletters failed:", err);
    return [];
  }
}


