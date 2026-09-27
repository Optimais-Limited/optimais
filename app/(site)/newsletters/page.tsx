import type { Metadata } from "next";
import { listNewsletters } from "@/lib/newsletters";
import { formatNewsletterDate, newsletterImageUrl } from "@/lib/newsletter-shared";

export const metadata: Metadata = {
  title: "Newsletters | Optimais Labs",
  description: "The latest Optimais Labs newsletter and every edition before it."
};

// Reads the database on each request so a newly posted newsletter shows up immediately.
export const dynamic = "force-dynamic";

export default async function NewslettersPage() {
  const posts = await listNewsletters();

  return (
    <section className="page-section">
      <div className="shell">
        <p className="kicker">Newsletters</p>
        <h1 className="page-title">Our newsletters</h1>
        <p className="panel-lede">The latest edition and every one before it.</p>

        {posts.length === 0 ? (
          <div className="empty-state">No newsletters have been published yet. Please check back soon.</div>
        ) : (
          <div className="newsletter-grid">
            {posts.map((post, i) => {
              const date = formatNewsletterDate(post.createdAt);
              return (
                <article key={post.id} className="newsletter-item">
                  <a className="newsletter-image" href={newsletterImageUrl(post.id)} target="_blank" rel="noopener noreferrer" aria-label={`Open the full-size newsletter from ${date}`}>
                    <img src={newsletterImageUrl(post.id)} width={post.imageWidth} height={post.imageHeight} loading={i < 2 ? "eager" : "lazy"} alt={`Newsletter, ${date}`} />
                  </a>
                  <div className="newsletter-item-body">
                    <p className="newsletter-date">
                      {date}
                      {i === 0 && <span className="newsletter-badge">Latest</span>}
                    </p>
                    {post.comment && <p className="newsletter-comment">{post.comment}</p>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
