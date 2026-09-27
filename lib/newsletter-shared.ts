// Dependency-free, so it is safe to import from both server code and browser components
// (lib/newsletters.ts pulls in Prisma and must stay server-only).

// Vercel rejects request bodies over 4.5 MB, so stay under that.
export const NEWSLETTER_MAX_BYTES = 4 * 1024 * 1024;
export const NEWSLETTER_MAX_COMMENT = 5000;

export type NewsletterSummary = {
  id: string;
  comment: string;
  createdAt: string;
  imageWidth: number;
  imageHeight: number;
};

export const newsletterImageUrl = (id: string) => `/api/newsletters/${id}/image`;

export function formatNewsletterDate(iso: string): string {
  // Fixed to UTC so the server render and the browser always agree.
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
