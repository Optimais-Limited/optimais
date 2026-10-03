// Dependency-free, so it is safe to import from both server code and browser components
// (lib/site-pages.ts pulls in Prisma and must stay server-only).

export const SITE_PAGE_SLUGS = ["about-us", "privacy-policy", "terms-of-use", "community-standards"] as const;
export type SitePageSlug = (typeof SITE_PAGE_SLUGS)[number];
export function isSitePageSlug(value: unknown): value is SitePageSlug {
  return typeof value === "string" && (SITE_PAGE_SLUGS as readonly string[]).includes(value);
}

export type SitePageContent = { slug: SitePageSlug; title: string; body: string; updatedAt: string | null };

export type SitePageBlock = { type: "h2"; text: string } | { type: "p"; text: string } | { type: "ul"; items: string[] };

/**
 * Lightweight markdown so admins can write plain text in a textarea: a line starting with
 * "## " is a heading, lines starting with "- " group into a bullet list, and blank-line-
 * separated text becomes paragraphs. No HTML is parsed or injected — every block renders as
 * plain React text, so there's no sanitization to get wrong.
 */
export function parseSitePageBody(body: string): SitePageBlock[] {
  const blocks: SitePageBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => { if (paragraph.length) { blocks.push({ type: "p", text: paragraph.join(" ") }); paragraph = []; } };
  const flushList = () => { if (list.length) { blocks.push({ type: "ul", items: list }); list = []; } };

  for (const rawLine of body.split("\n")) {
    const line = rawLine.trim();
    if (!line) { flushParagraph(); flushList(); continue; }
    if (line.startsWith("## ")) { flushParagraph(); flushList(); blocks.push({ type: "h2", text: line.slice(3).trim() }); continue; }
    if (line.startsWith("- ")) { flushParagraph(); list.push(line.slice(2).trim()); continue; }
    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return blocks;
}
