import type { Metadata } from "next";
import Link from "next/link";
import { listPublishedPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export const metadata: Metadata = {
  title: "Insights | Optimais Labs",
  description: "Research-driven thinking, emerging deep-tech trends and perspectives from Optimais Labs."
};

const ArrowRight = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export default async function InsightsPage() {
  const posts = await listPublishedPosts();

  return (
    <section className="page-section">
      <div className="shell">
        <div className="panel-layout">
          <div>
            <p className="kicker">Ideas &amp; Perspectives</p>
            <h1 className="page-title">Insights from the frontier of technology and innovation.</h1>
            <p className="panel-lede">Explore the latest insights, ideas, and perspectives from Optimais Labs.</p>
            <p className="panel-lede" style={{ marginTop: 12 }}>
              Discover research-driven thinking, emerging deep-tech trends, and innovative solutions shaping the future of business, industry, technology, and society. From artificial intelligence and intelligent systems to energy, infrastructure, manufacturing, and digital transformation, our insights highlight the ideas driving sustainable innovation and long-term impact.
            </p>
          </div>
          <aside className="insight-card">
            <h3>{posts.length > 0 ? "Latest Insights" : "More to come"}</h3>
            {posts.length > 0 ? (
              <div className="career-links">
                {posts.map((post) => (
                  <Link key={post.id} href={`/insights/${post.slug}`} className="career-link-item">
                    <span>{post.title}</span><ArrowRight />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="panel-lede" style={{ margin: 0 }}>We&rsquo;re preparing our first articles. Check back soon, or <Link href="/contact">get in touch</Link> if you&rsquo;d like to collaborate on research.</p>
            )}
          </aside>
        </div>
        {posts.length > 0 && (
          <div className="opportunity-list" style={{ marginTop: 48 }}>
            {posts.map((post) => (
              <article key={post.id} className="opportunity-card">
                <h3><Link href={`/insights/${post.slug}`}>{post.title}</Link></h3>
                <div className="opportunity-meta">
                  {post.publishedAt && <span className="tag">{formatDate(post.publishedAt)}</span>}
                  {post.tags.slice(0, 3).map((tag) => <span key={tag} className="tag">{tag}</span>)}
                </div>
                {post.excerpt && <p>{post.excerpt}</p>}
                <Link href={`/insights/${post.slug}`}>Read more <ArrowRight /></Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
