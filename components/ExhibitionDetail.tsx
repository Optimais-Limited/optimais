"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  EXHIBITION_COMMENT_MAX,
  EXHIBITION_REACTIONS,
  formatExhibitionDate,
  type ExhibitionComment,
  type ExhibitionReactionEmoji,
  type ExhibitionSummary
} from "@/lib/exhibitions-shared";

export function ExhibitionDetail({
  post,
  initialComments,
  canInteract,
  canDeletePost,
  isModerator
}: {
  post: ExhibitionSummary;
  initialComments: ExhibitionComment[];
  canInteract: boolean;
  canDeletePost: boolean;
  isModerator: boolean;
}) {
  const router = useRouter();
  const [reactionCounts, setReactionCounts] = useState(post.reactionCounts);
  const [viewerReaction, setViewerReaction] = useState(post.viewerReaction);
  const [comments, setComments] = useState(initialComments);
  const [commentBody, setCommentBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function react(emoji: ExhibitionReactionEmoji) {
    if (!canInteract) return;
    const turningOff = viewerReaction === emoji;
    const previous = { counts: reactionCounts, reaction: viewerReaction };

    // Optimistic update so the bar feels instant; rolled back if the request fails.
    setReactionCounts((c) => {
      const next = { ...c };
      if (previous.reaction) next[previous.reaction] = Math.max(0, (next[previous.reaction] ?? 1) - 1);
      if (!turningOff) next[emoji] = (next[emoji] ?? 0) + 1;
      return next;
    });
    setViewerReaction(turningOff ? null : emoji);

    try {
      const res = turningOff
        ? await fetch(`/api/exhibitions/${post.id}/reactions`, { method: "DELETE" })
        : await fetch(`/api/exhibitions/${post.id}/reactions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ emoji }) });
      if (!res.ok) { setReactionCounts(previous.counts); setViewerReaction(previous.reaction); }
    } catch {
      setReactionCounts(previous.counts);
      setViewerReaction(previous.reaction);
    }
  }

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const body = commentBody.trim();
    if (!body) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/exhibitions/${post.id}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || "Could not post your comment."); return; }
      setComments((c) => [...c, data.comment]);
      setCommentBody("");
    } catch {
      setError("Could not post your comment. Check your connection and try again.");
    } finally {
      setPosting(false);
    }
  }

  async function removeComment(id: string) {
    if (!window.confirm("Delete this comment?")) return;
    const res = await fetch(`/api/exhibitions/${post.id}/comments/${id}`, { method: "DELETE" });
    if (res.ok) setComments((c) => c.filter((comment) => comment.id !== id));
  }

  async function removePost() {
    if (!window.confirm("Delete this exhibition post permanently? This cannot be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/exhibitions/${post.id}`, { method: "DELETE" });
    if (res.ok) router.push("/exhibitions");
    else setDeleting(false);
  }

  return (
    <>
      <article className="exh-detail">
        <div className="exh-detail-media">
          {post.mediaType === "IMAGE"
            ? <img src={post.mediaUrl} alt={post.title} width={post.mediaWidth ?? undefined} height={post.mediaHeight ?? undefined} />
            : <video src={post.mediaUrl} controls preload="metadata" />}
        </div>
        <div className="exh-detail-body">
          <p className="exh-card-meta">{formatExhibitionDate(post.createdAt)} · {post.authorName}</p>
          <h1 className="page-title exh-detail-title">{post.title}</h1>
          <p className="exh-detail-description">{post.description}</p>

          <div className="exh-reactions" role="group" aria-label="React to this post">
            {EXHIBITION_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={`exh-reaction-btn${viewerReaction === emoji ? " active" : ""}`}
                disabled={!canInteract}
                onClick={() => react(emoji)}
                aria-pressed={viewerReaction === emoji}
                title={canInteract ? undefined : "Sign in to react"}
              >
                <span>{emoji}</span>
                {(reactionCounts[emoji] ?? 0) > 0 && <span className="exh-reaction-count">{reactionCounts[emoji]}</span>}
              </button>
            ))}
          </div>

          {canDeletePost && (
            <button className="button secondary exh-delete-post" type="button" disabled={deleting} onClick={removePost}>
              {deleting ? "Deleting…" : "Delete this post"}
            </button>
          )}
        </div>
      </article>

      <section className="exh-comments">
        <h2 className="exh-comments-title">{comments.length} Comment{comments.length === 1 ? "" : "s"}</h2>
        {canInteract ? (
          <form className="exh-comment-form" onSubmit={submitComment}>
            <textarea
              className="field"
              rows={3}
              maxLength={EXHIBITION_COMMENT_MAX}
              placeholder="Share your thoughts…"
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              aria-label="Write a comment"
            />
            <button className="button" type="submit" disabled={posting || !commentBody.trim()}>{posting ? "Posting…" : "Comment"}</button>
            {error && <p className="status error" role="alert">{error}</p>}
          </form>
        ) : (
          <p className="status exh-signin-prompt"><a href="/login">Sign in</a> to join the conversation.</p>
        )}

        {comments.length > 0 && (
          <ul className="exh-comment-list">
            {comments.map((comment) => (
              <li key={comment.id} className="exh-comment">
                <p className="exh-comment-meta">
                  <strong>{comment.authorName}</strong> · {formatExhibitionDate(comment.createdAt)}
                  {(comment.isOwn || isModerator) && (
                    <button type="button" className="exh-comment-delete" onClick={() => removeComment(comment.id)} aria-label="Delete comment">Delete</button>
                  )}
                </p>
                <p className="exh-comment-body">{comment.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
