import { NewsletterPosts } from "@/components/admin/NewsletterPosts";
import { listNewsletters } from "@/lib/newsletters";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPostsPage() {
  const posts = await listNewsletters();
  return <NewsletterPosts initialPosts={posts} />;
}
