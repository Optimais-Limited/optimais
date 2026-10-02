"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatExhibitionDate, type ExhibitionSummary } from "@/lib/exhibitions-shared";

export function ExhibitionModeration({ initialPosts }: { initialPosts: ExhibitionSummary[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<Record<string, string>>({});

  async function moderate(id: string, status: "APPROVED" | "REJECTED") {
    setBusyId(id);
    try {
      const res = await fetch(`/api/exhibitions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (!res.ok) { setMessage((m) => ({ ...m, [id]: "Could not update. Please try again." })); return; }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this exhibition post permanently? This cannot be undone.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/exhibitions/${id}`, { method: "DELETE" });
      if (!res.ok) { setMessage((m) => ({ ...m, [id]: "Could not delete. Please try again." })); return; }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  const pendingCount = initialPosts.filter((p) => p.status === "PENDING").length;

  return (
    <>
      <div className="admin-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Exhibitions</h1>
        </div>
      </div>
      <p className="status">
        Approve or reject what users share to the Exhibitions section. Your own posts go live immediately.
        {pendingCount > 0 && ` ${pendingCount} awaiting review.`}
      </p>

      <section className="admin-panel">
        {initialPosts.length === 0 ? (
          <p className="status">No exhibitions posted yet.</p>
        ) : (
          <div className="nl-admin-list">
            {initialPosts.map((post) => (
              <article key={post.id} className="nl-admin-item">
                <a href={post.mediaUrl} target="_blank" rel="noopener noreferrer" className="nl-admin-thumb" aria-label="Open the full-size media">
                  {post.mediaType === "IMAGE"
                    ? <img src={post.mediaUrl} alt={post.title} loading="lazy" width={post.mediaWidth ?? undefined} height={post.mediaHeight ?? undefined} />
                    : <video src={post.mediaUrl} preload="metadata" muted />}
                </a>
                <div className="nl-admin-body">
                  <p className="nl-admin-meta">
                    {formatExhibitionDate(post.createdAt)} · {post.authorName}
                    <span className={`nl-badge exh-status-${post.status.toLowerCase()}`}>{post.status}</span>
                  </p>
                  <p className="exh-admin-title"><strong>{post.title}</strong></p>
                  <p className="exh-admin-description">{post.description}</p>
                  <div className="nl-admin-actions">
                    {post.status !== "APPROVED" && (
                      <button className="button" type="button" disabled={busyId === post.id} onClick={() => moderate(post.id, "APPROVED")}>Approve</button>
                    )}
                    {post.status !== "REJECTED" && (
                      <button className="button secondary" type="button" disabled={busyId === post.id} onClick={() => moderate(post.id, "REJECTED")}>Reject</button>
                    )}
                    <button className="button secondary" type="button" disabled={busyId === post.id} onClick={() => remove(post.id)}>Delete</button>
                    {message[post.id] && <span className="status error">{message[post.id]}</span>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
