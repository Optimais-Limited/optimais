import type { MetadataRoute } from "next";
import { listExhibitions } from "@/lib/exhibitions";
import { listPublishedPosts } from "@/lib/blog";

const SITE_URL = "https://optimaislabs.com";

// Rebuilt hourly rather than once at build time, so new exhibitions and posts get listed without a deploy.
export const revalidate = 3600;

const STATIC_ROUTES = [
  "",
  "/industries",
  "/ai-agents",
  "/ai-agents/services/front-desk",
  "/ai-agents/services/revenue",
  "/ai-agents/services/support",
  "/ai-agents/services/back-office",
  "/ai-agents/how-it-works",
  "/ai-agents/audit",
  "/ai-agents/demos",
  "/ai-agents/pricing",
  "/ai-agents/trust",
  "/ai-agents/case-studies",
  "/ai-agents/resources",
  "/innovation",
  "/markets",
  "/opportunities",
  "/insights",
  "/newsletters",
  "/exhibitions",
  "/discussions",
  "/careers",
  "/deep-tech",
  "/culture-benefits",
  "/our-stories",
  "/contact",
  "/about-us",
  "/privacy-policy",
  "/terms-of-use",
  "/community-standards",
  "/report-a-concern"
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly"
  }));

  // listExhibitions() with no viewer id already filters to APPROVED posts only.
  const exhibitions = await listExhibitions(undefined, 200);
  const exhibitionEntries: MetadataRoute.Sitemap = exhibitions.map((post) => ({
    url: `${SITE_URL}/exhibitions/${post.id}`,
    lastModified: new Date(post.createdAt),
    changeFrequency: "yearly"
  }));

  const posts = await listPublishedPosts(200);
  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/insights/${post.slug}`,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : undefined,
    changeFrequency: "yearly"
  }));

  return [...staticEntries, ...exhibitionEntries, ...postEntries];
}
