"use client";

import Link from "next/link";
import { useState } from "react";
import { ExhibitionComposer } from "@/components/ExhibitionComposer";
import { formatExhibitionDate, type ExhibitionSummary } from "@/lib/exhibitions-shared";

function StatusBadge({ status }: { status: ExhibitionSummary["status"] }) {
  if (status === "APPROVED") return null;
  return <span className={`exh-status-badge exh-status-${status.toLowerCase()}`}>{status === "PENDING" ? "Pending review" : "Not approved"}</span>;
}

function ExhibitionCard({ post }: { post: ExhibitionSummary }) {
  const reactionEntries = Object.entries(post.reactionCounts).filter(([, count]) => (count ?? 0) > 0);
  return (
    <Link href={`/exhibitions/${post.id}`} className="exh-card">
      <div className="exh-card-media">
        {post.mediaType === "IMAGE"
          ? <img src={post.mediaUrl} alt={post.title} loading="lazy" width={post.mediaWidth ?? undefined} height={post.mediaHeight ?? undefined} />
          : <video src={post.mediaUrl} preload="metadata" muted playsInline />}
      </div>
      <div className="exh-card-body">
        <p className="exh-card-meta">
          {formatExhibitionDate(post.createdAt)} · {post.authorName}
          {post.isOwn && <StatusBadge status={post.status} />}
        </p>
        <h3 className="exh-card-title">{post.title}</h3>
        <div className="exh-card-stats">
          {reactionEntries.length > 0 && (
            <span className="exh-reaction-summary">{reactionEntries.map(([emoji, count]) => `${emoji} ${count}`).join("  ")}</span>
          )}
          <span className="exh-comment-count">{post.commentCount} comment{post.commentCount === 1 ? "" : "s"}</span>
        </div>
      </div>
    </Link>
  );
}

export function ExhibitionsBoard({ initialPosts, canPost }: { initialPosts: ExhibitionSummary[]; canPost: boolean }) {
  const [posts, setPosts] = useState(initialPosts);

  return (
    <>
      {canPost ? (
        <ExhibitionComposer onPosted={(post) => setPosts((p) => [post, ...p])} />
      ) : (
        <p className="status exh-signin-prompt"><Link href="/login">Sign in</Link> to share your own project and to comment or react.</p>
      )}

      {posts.length === 0 ? (
        <div className="empty-state">No exhibitions have been shared yet. Be the first.</div>
      ) : (
        <div className="exh-grid">
          {posts.map((post) => <ExhibitionCard key={post.id} post={post} />)}
        </div>
      )}
    </>
  );
}
