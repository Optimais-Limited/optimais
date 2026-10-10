import { prisma } from "@/lib/prisma";

export type BlogPostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  tags: string[];
  publishedAt: string | null;
};

export type BlogPostDetail = BlogPostSummary & { content: string; coverImage: string | null };

const summarySelect = { id: true, title: true, slug: true, excerpt: true, tags: true, publishedAt: true } as const;

// A database hiccup here shouldn't take the public Insights page down, so failures return an
// empty list rather than throwing — the admin's own CMS list (CrudResource) still surfaces errors.
export async function listPublishedPosts(limit = 50): Promise<BlogPostSummary[]> {
  try {
    const rows = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: limit,
      select: summarySelect
    });
    return rows.map((row) => ({ ...row, publishedAt: row.publishedAt?.toISOString() ?? null }));
  } catch (err) {
    console.error("listPublishedPosts failed:", err);
    return [];
  }
}

export async function getPublishedPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  try {
    const row = await prisma.blogPost.findFirst({ where: { slug, status: "PUBLISHED" } });
    if (!row) return null;
    return { ...row, publishedAt: row.publishedAt?.toISOString() ?? null };
  } catch (err) {
    console.error("getPublishedPostBySlug failed:", err);
    return null;
  }
}
