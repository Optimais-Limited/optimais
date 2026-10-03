import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/activity-log";
import { SITE_PAGE_SLUGS, type SitePageContent, type SitePageSlug } from "@/lib/site-pages-shared";

export * from "@/lib/site-pages-shared";

// Shown until an admin edits the page from /admin/pages — written so the site never regresses
// to a blank page, and so the admin editor starts from real, reviewable copy.
const DEFAULTS: Record<SitePageSlug, { title: string; body: string }> = {
  "about-us": {
    title: "About Us",
    body: `Optimais Labs is an AI research, optimization and technology company building practical solutions for businesses, institutions and communities across Africa.

## What we do
We work across industries — from infrastructure and energy to public services — translating applied research into systems that actually run in production. Our focus is optimization: using AI and data to help organizations make better decisions, move faster, and use resources more efficiently.

## Our mission
Intelligent Systems. Sustainable Futures. We believe technology built with rigor and translated into practical solutions can transform how businesses and communities operate, grow and thrive.

## Leadership
Our executive team's backgrounds span operations, investment and product — you can read more about each of them below.`
  },
  "privacy-policy": {
    title: "Privacy Policy",
    body: `Optimais Labs ("we", "us", "our") builds AI research, optimization and technology solutions. This policy explains what information we collect through optimaislabs.com, why, and the choices you have.

## Information we collect
When you create an account, apply for a scholarship, message us, post to Exhibitions, or join a Discussion, we collect what you give us directly: your name, email address, and the content you submit. We also collect basic technical information (such as browser type and general usage) to keep the site secure and working well.

## How we use it
- To provide the account, scholarship, Exhibitions and Discussions features you use.
- To respond to messages sent through the contact form.
- To send newsletters or updates you've asked for, and to let you unsubscribe at any time.
- To keep the platform secure and prevent abuse.

## What we don't do
We don't sell your personal information. We share it only with service providers that help us run the site (such as hosting, database and storage providers), and only as needed to provide the service.

## Your choices
You can review and update your account details from your profile at any time, or ask us to delete your account and associated data by contacting us below. Some information, such as public Exhibition posts or Discussion messages, may remain visible to others until you remove it yourself.

## Contact us
Questions about this policy? Reach us through our contact page or see Report a concern.`
  },
  "terms-of-use": {
    title: "Terms of Use",
    body: `By creating an account or using optimaislabs.com, you agree to these terms. Please read them, along with our Privacy Policy and Community Standards.

## Your account
You're responsible for the accuracy of the information you provide and for keeping your password secure. You must be eligible to hold an account under applicable law in your location.

## Content you submit
When you post a project to Exhibitions, start or join a Discussion, or submit any other content, you confirm it's yours to share and that it follows our Community Standards. You keep ownership of what you post; you grant us the right to display it on the platform. We may remove content, or restrict an account, that breaks these terms.

## Acceptable use
Don't use the platform to infringe someone else's rights, upload malicious code, scrape or misuse other users' data, or interfere with the service. Admin and editor accounts moderate Exhibitions and Discussions and may approve, reject or remove content at their discretion.

## Scholarships and opportunities
Opportunities listed on the platform are provided for informational purposes. Optimais Labs is not the funder for third-party scholarships and isn't responsible for the terms, deadlines or decisions of the organizations offering them.

## No warranty
The platform is provided "as is." We work to keep it reliable and secure but don't guarantee uninterrupted availability.

## Changes
We may update these terms as the platform evolves. Continued use after a change means you accept the updated terms.

## Contact us
Questions? Reach us through our contact page.`
  },
  "community-standards": {
    title: "Community Standards",
    body: `Exhibitions and Discussions exist so African researchers, innovators and curious minds can share real work and have real conversations. These standards keep that space useful and respectful.

## Share what's yours
Only post photos, videos, descriptions and messages that are genuinely yours to share, or that you have permission to share. Give credit where it's due.

## Be respectful
Disagree with ideas, not with people. Harassment, hate speech, threats, or content that targets someone's identity, has no place here.

## Keep it honest
Don't misrepresent your work, your credentials, or someone else's. Don't impersonate another person or organization.

## No spam or exploitation
Don't use Exhibitions or Discussions to advertise unrelated products, run scams, or collect people's information without their consent.

## How moderation works
Every Exhibition post from a non-admin account is reviewed before it goes public. Comments, reactions and Discussion messages are visible immediately but can be removed, and a discussion can be ended, by its host or by an admin, if they don't meet these standards.

## Report something
If you see content or behaviour that concerns you, please use Report a concern rather than responding in kind.`
  }
};

function toContent(slug: SitePageSlug, row: { title: string; body: string; updatedAt: Date } | null): SitePageContent {
  if (row) return { slug, title: row.title, body: row.body, updatedAt: row.updatedAt.toISOString() };
  return { slug, title: DEFAULTS[slug].title, body: DEFAULTS[slug].body, updatedAt: null };
}

// Falls back to the built-in default (never 404s, never blank) if the DB is unavailable or the
// page hasn't been customized yet.
export async function getSitePage(slug: SitePageSlug): Promise<SitePageContent> {
  try {
    const row = await prisma.sitePage.findUnique({ where: { slug } });
    return toContent(slug, row);
  } catch (err) {
    console.error(`getSitePage(${slug}) failed:`, err);
    return toContent(slug, null);
  }
}

export async function listSitePagesForAdmin(): Promise<SitePageContent[]> {
  try {
    const rows = await prisma.sitePage.findMany({ where: { slug: { in: [...SITE_PAGE_SLUGS] } } });
    const bySlug = new Map(rows.map((r) => [r.slug, r]));
    return SITE_PAGE_SLUGS.map((slug) => toContent(slug, (bySlug.get(slug) as { title: string; body: string; updatedAt: Date }) ?? null));
  } catch (err) {
    console.error("listSitePagesForAdmin failed:", err);
    return SITE_PAGE_SLUGS.map((slug) => toContent(slug, null));
  }
}

export async function upsertSitePage(slug: SitePageSlug, title: string, body: string, actor: { name: string | null; email: string }): Promise<SitePageContent> {
  const row = await prisma.sitePage.upsert({
    where: { slug },
    update: { title, body },
    create: { slug, title, body }
  });
  await logAdminAction({ actor, action: "page.updated", targetType: "SitePage", targetId: slug, summary: `Updated the "${title}" page` });
  return toContent(slug, row);
}
