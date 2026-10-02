"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  EXHIBITION_DESCRIPTION_MAX,
  EXHIBITION_IMAGE_MIME_TYPES,
  EXHIBITION_TITLE_MAX,
  EXHIBITION_VIDEO_MIME_TYPES,
  mimeCapFor,
  type ExhibitionMediaKind,
  type ExhibitionSummary
} from "@/lib/exhibitions-shared";

type Picked = { file: File; mediaType: ExhibitionMediaKind; previewUrl: string; width: number | null; height: number | null };

function mediaKindFor(mime: string): ExhibitionMediaKind | null {
  if ((EXHIBITION_IMAGE_MIME_TYPES as readonly string[]).includes(mime)) return "IMAGE";
  if ((EXHIBITION_VIDEO_MIME_TYPES as readonly string[]).includes(mime)) return "VIDEO";
  return null;
}

// Reads pixel dimensions off the file itself (before upload) purely so the card can reserve
// the right aspect ratio. It's cosmetic only — the server re-checks the file's real signature.
function readDimensions(file: File, mediaType: ExhibitionMediaKind): Promise<{ width: number | null; height: number | null }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const done = (width: number | null, height: number | null) => { URL.revokeObjectURL(url); resolve({ width, height }); };
    if (mediaType === "IMAGE") {
      const img = new Image();
      img.onload = () => done(img.naturalWidth || null, img.naturalHeight || null);
      img.onerror = () => done(null, null);
      img.src = url;
    } else {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => done(video.videoWidth || null, video.videoHeight || null);
      video.onerror = () => done(null, null);
      video.src = url;
    }
  });
}

export function ExhibitionComposer({ onPosted }: { onPosted: (post: ExhibitionSummary) => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [progress, setProgress] = useState<"idle" | "uploading" | "saving">("idle");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => () => { if (picked) URL.revokeObjectURL(picked.previewUrl); }, [picked]);

  async function onFileChange(file: File | undefined) {
    setError("");
    setStatus("");
    setPicked(null);
    if (!file) return;
    const mediaType = mediaKindFor(file.type);
    if (!mediaType) { setError("Please choose a PNG, JPEG, WEBP image or an MP4, WEBM, MOV video."); return; }
    const cap = mimeCapFor(mediaType);
    if (file.size > cap.maxBytes) { setError(`That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${Math.round(cap.maxBytes / 1024 / 1024)} MB.`); return; }
    const { width, height } = await readDimensions(file, mediaType);
    setPicked({ file, mediaType, previewUrl: URL.createObjectURL(file), width, height });
  }

  async function post(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");
    if (!picked) { setError("Please choose a photo or video."); return; }
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    if (title.length < 3) { setError("Please give your project a title."); return; }
    if (description.length < 10) { setError("Please add a little more detail about your project."); return; }

    setProgress("uploading");
    try {
      const signRes = await fetch("/api/exhibitions/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaType: picked.mediaType, mime: picked.file.type, size: picked.file.size })
      });
      const signData = await signRes.json().catch(() => ({}));
      if (!signRes.ok) { setError(signData.error || "Could not start the upload. Please try again."); return; }

      const putRes = await fetch(signData.uploadUrl, { method: "PUT", headers: { "Content-Type": picked.file.type }, body: picked.file });
      if (!putRes.ok) { setError("The upload didn't go through. Please try again."); return; }

      setProgress("saving");
      const postRes = await fetch("/api/exhibitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, mediaType: picked.mediaType, path: signData.path, width: picked.width, height: picked.height })
      });
      const postData = await postRes.json().catch(() => ({}));
      if (!postRes.ok) { setError(postData.error || "Could not post. Please try again."); return; }

      formRef.current?.reset();
      setPicked(null);
      setStatus(postData.post.status === "APPROVED" ? "Posted! It's now live in Exhibitions." : "Thanks! Your post is awaiting admin approval before it goes public.");
      onPosted(postData.post);
    } catch {
      setError("Could not post. Check your connection and try again.");
    } finally {
      setProgress("idle");
    }
  }

  const busy = progress !== "idle";

  return (
    <form ref={formRef} className="admin-panel form-grid exh-composer" onSubmit={post}>
      <label className="full">
        Photo or video
        <input
          className="field"
          type="file"
          accept={[...EXHIBITION_IMAGE_MIME_TYPES, ...EXHIBITION_VIDEO_MIME_TYPES].join(",")}
          required
          onChange={(e) => onFileChange(e.target.files?.[0])}
        />
      </label>
      {picked && (
        <div className="full exh-preview">
          {picked.mediaType === "IMAGE"
            ? <img src={picked.previewUrl} alt="Preview of the file you selected" />
            : <video src={picked.previewUrl} controls preload="metadata" />}
        </div>
      )}
      <label className="full">
        Title
        <input className="field" name="title" maxLength={EXHIBITION_TITLE_MAX} placeholder="What are you sharing?" required />
      </label>
      <label className="full">
        Tell us about your project
        <textarea className="field" name="description" rows={4} maxLength={EXHIBITION_DESCRIPTION_MAX} placeholder="What is it, and what makes it worth sharing?" required />
      </label>
      <button className="button full" disabled={busy} type="submit">
        {progress === "uploading" ? "Uploading…" : progress === "saving" ? "Posting…" : "Share your project"}
      </button>
      {status && <p className="status success">{status}</p>}
      {error && <p className="status error" role="alert">{error}</p>}
    </form>
  );
}
