import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPostBySlug } from "@/lib/blog";
import { SitePageBody } from "@/components/SitePageBody";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  return {
    title: post ? `${post.title} | Insights | Optimais Labs` : "Insights | Optimais Labs",
    description: post?.excerpt || undefined
  };
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export default async function InsightPostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  return (
    <section className="page-section">
      <div className="shell" style={{ maxWidth: 760 }}>
        <p className="breadcrumb"><Link href="/insights">Insights</Link> / {post.title}</p>
        {post.coverImage && <img src={post.coverImage} alt="" style={{ width: "100%", borderRadius: "var(--radius)", marginBottom: 24 }} />}
        <h1 className="page-title">{post.title}</h1>
        <p className="opportunity-meta" style={{ marginBottom: 28 }}>
          {post.publishedAt && <span className="tag">{formatDate(post.publishedAt)}</span>}
          {post.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
        </p>
        <SitePageBody body={post.content} />
      </div>
    </section>
  );
}
