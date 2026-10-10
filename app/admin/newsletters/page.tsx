import { requireStaffPage } from "@/lib/api-auth";
import { NewsletterPosts } from "@/components/admin/NewsletterPosts";
import { listNewsletters } from "@/lib/newsletters";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPostsPage() {
  await requireStaffPage();
  const posts = await listNewsletters();
  return <NewsletterPosts initialPosts={posts} />;
}
