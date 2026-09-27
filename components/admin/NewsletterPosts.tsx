"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { NEWSLETTER_MAX_BYTES, NEWSLETTER_MAX_COMMENT } from "@/lib/newsletter-shared";

export type AdminNewsletter = { id: string; comment: string; createdAt: string; imageWidth: number; imageHeight: number };

const fmt = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) + " UTC";

export function NewsletterPosts({ initialPosts }: { initialPosts: AdminNewsletter[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rowMessage, setRowMessage] = useState<Record<string, { text: string; error: boolean }>>({});

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function onFileChange(file: File | undefined) {
    setError("");
    setPreview(null);
    if (!file) return;
    if (file.type !== "image/png") { setError("Please choose a PNG image."); return; }
    if (file.size > NEWSLETTER_MAX_BYTES) { setError(`That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${NEWSLETTER_MAX_BYTES / 1024 / 1024} MB.`); return; }
    setPreview(URL.createObjectURL(file));
  }

  async function post(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");
    const formData = new FormData(event.currentTarget);
    const file = formData.get("image");
    if (!(file instanceof File) || file.size === 0) { setError("Please choose a PNG image."); return; }
    if (file.type !== "image/png") { setError("Please choose a PNG image."); return; }
    if (file.size > NEWSLETTER_MAX_BYTES) { setError(`The image is too large. The limit is ${NEWSLETTER_MAX_BYTES / 1024 / 1024} MB.`); return; }

    setPosting(true);
    try {
      const res = await fetch("/api/newsletters", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || "Could not post the newsletter. Please try again."); return; }
      formRef.current?.reset();
      setPreview(null);
      setStatus("Newsletter posted. It is now the latest one shown on the landing page.");
      router.refresh();
    } catch {
      setError("Could not post the newsletter. Check your connection and try again.");
    } finally {
      setPosting(false);
    }
  }

  async function saveComment(id: string) {
    setBusyId(id);
    setRowMessage((m) => ({ ...m, [id]: { text: "", error: false } }));
    try {
      const res = await fetch(`/api/newsletters/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ comment: drafts[id] }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setRowMessage((m) => ({ ...m, [id]: { text: data.error || "Could not save.", error: true } })); return; }
      setDrafts(({ [id]: _removed, ...rest }) => rest);
      setRowMessage((m) => ({ ...m, [id]: { text: "Comment saved.", error: false } }));
      router.refresh();
    } catch {
      setRowMessage((m) => ({ ...m, [id]: { text: "Could not save. Please try again.", error: true } }));
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this newsletter permanently? This cannot be undone.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/newsletters/${id}`, { method: "DELETE" });
      if (!res.ok) { setRowMessage((m) => ({ ...m, [id]: { text: "Could not delete. Please try again.", error: true } })); return; }
      router.refresh();
    } catch {
      setRowMessage((m) => ({ ...m, [id]: { text: "Could not delete. Please try again.", error: true } }));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Newsletter posts</h1>
        </div>
      </div>
      <p className="status">Post a newsletter as a PNG image with a comment. The newest post appears on the landing page; every post is listed on the public Newsletters page.</p>

      <form ref={formRef} className="admin-panel form-grid nl-admin-form" onSubmit={post}>
        <label className="full">
          Newsletter image (PNG, up to {NEWSLETTER_MAX_BYTES / 1024 / 1024} MB)
          <input className="field" name="image" type="file" accept="image/png" required onChange={(e) => onFileChange(e.target.files?.[0])} />
        </label>
        {preview && (
          <div className="full nl-admin-preview">
            <img src={preview} alt="Preview of the newsletter image you selected" />
          </div>
        )}
        <label className="full">
          Comment
          <textarea className="field" name="comment" rows={5} maxLength={NEWSLETTER_MAX_COMMENT} placeholder="Write a short note to go with this newsletter…" />
        </label>
        <button className="button full" disabled={posting} type="submit">{posting ? "Posting…" : "Post newsletter"}</button>
        {status && <p className="status success">{status}</p>}
        {error && <p className="status error" role="alert">{error}</p>}
      </form>

      <section className="admin-panel">
        {initialPosts.length === 0 ? (
          <p className="status">No newsletters posted yet.</p>
        ) : (
          <div className="nl-admin-list">
            {initialPosts.map((p, i) => {
              const draft = drafts[p.id];
              const changed = draft !== undefined && draft !== p.comment;
              const msg = rowMessage[p.id];
              return (
                <article key={p.id} className="nl-admin-item">
                  <a href={`/api/newsletters/${p.id}/image`} target="_blank" rel="noopener noreferrer" className="nl-admin-thumb" aria-label="Open the full-size image">
                    <img src={`/api/newsletters/${p.id}/image`} alt={`Newsletter posted ${fmt(p.createdAt)}`} loading="lazy" width={p.imageWidth} height={p.imageHeight} />
                  </a>
                  <div className="nl-admin-body">
                    <p className="nl-admin-meta">
                      {fmt(p.createdAt)}
                      {i === 0 && <span className="nl-badge">Shown on landing page</span>}
                    </p>
                    <textarea
                      className="field"
                      rows={4}
                      maxLength={NEWSLETTER_MAX_COMMENT}
                      aria-label="Comment"
                      value={draft ?? p.comment}
                      onChange={(e) => setDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
                    />
                    <div className="nl-admin-actions">
                      <button className="button" type="button" disabled={!changed || busyId === p.id} onClick={() => saveComment(p.id)}>Save comment</button>
                      <button className="button secondary" type="button" disabled={busyId === p.id} onClick={() => remove(p.id)}>Delete</button>
                      {msg?.text && <span className={`status ${msg.error ? "error" : "success"}`}>{msg.text}</span>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
