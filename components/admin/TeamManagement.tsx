"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TEAM_PHOTO_MIME_TYPES, type TeamMemberSummary } from "@/lib/team-shared";

async function uploadPhoto(file: File): Promise<{ path: string } | { error: string }> {
  const signRes = await fetch("/api/team/uploads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mime: file.type, size: file.size }) });
  const signData = await signRes.json().catch(() => ({}));
  if (!signRes.ok) return { error: signData.error || "Could not start the upload." };
  const putRes = await fetch(signData.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  if (!putRes.ok) return { error: "The upload didn't go through. Please try again." };
  return { path: signData.path };
}

function AddMemberForm({ onAdded }: { onAdded: (member: TeamMemberSummary) => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const file = form.get("photo");
    if (!(file instanceof File) || file.size === 0) { setError("Please choose a photo."); return; }
    const name = String(form.get("name") ?? "").trim();
    const role = String(form.get("role") ?? "").trim();
    const affiliation = String(form.get("affiliation") ?? "").trim();
    const statement = String(form.get("statement") ?? "").trim();

    setPosting(true);
    try {
      const uploaded = await uploadPhoto(file);
      if ("error" in uploaded) { setError(uploaded.error); return; }
      const res = await fetch("/api/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, role, affiliation, statement, path: uploaded.path }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || "Could not add team member."); return; }
      formRef.current?.reset();
      setPreview(null);
      onAdded(data.member);
    } catch {
      setError("Could not add team member. Check your connection and try again.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <form ref={formRef} className="admin-panel form-grid nl-admin-form" onSubmit={submit}>
      <h2 className="full" style={{ margin: 0 }}>Add a team member</h2>
      <label className="full">
        Photo
        <input className="field" type="file" accept={TEAM_PHOTO_MIME_TYPES.join(",")} required onChange={(e) => { const f = e.target.files?.[0]; setPreview(f ? URL.createObjectURL(f) : null); }} />
      </label>
      {preview && <div className="full nl-admin-preview"><img src={preview} alt="Preview" /></div>}
      <label>
        Name
        <input className="field" name="name" required />
      </label>
      <label>
        Title at Optimais Labs
        <input className="field" name="role" placeholder="e.g. CEO, Optimais Labs" required />
      </label>
      <label className="full">
        Day-job affiliation
        <input className="field" name="affiliation" placeholder="e.g. Asst. Operations Manager, Pipeline Infrastructures Nig. Ltd." />
      </label>
      <label className="full">
        Statement
        <textarea className="field" name="statement" rows={3} placeholder="A short quote introducing their role." />
      </label>
      <button className="button full" type="submit" disabled={posting}>{posting ? "Adding…" : "Add team member"}</button>
      {error && <p className="status error full" role="alert">{error}</p>}
    </form>
  );
}

function MemberRow({ member, isFirst, isLast, onChanged }: { member: TeamMemberSummary; isFirst: boolean; isLast: boolean; onChanged: () => void }) {
  const [drafts, setDrafts] = useState({ name: member.name, role: member.role, affiliation: member.affiliation, statement: member.statement });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const changed = drafts.name !== member.name || drafts.role !== member.role || drafts.affiliation !== member.affiliation || drafts.statement !== member.statement;

  async function save() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/team/${member.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(drafts) });
      if (!res.ok) { const data = await res.json().catch(() => ({})); setMessage({ text: data.error || "Could not save.", error: true }); return; }
      setMessage({ text: "Saved.", error: false });
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function replacePhoto(file: File) {
    setBusy(true);
    setMessage(null);
    try {
      const uploaded = await uploadPhoto(file);
      if ("error" in uploaded) { setMessage({ text: uploaded.error, error: true }); return; }
      const res = await fetch(`/api/team/${member.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: uploaded.path }) });
      if (!res.ok) { const data = await res.json().catch(() => ({})); setMessage({ text: data.error || "Could not save.", error: true }); return; }
      setMessage({ text: "Photo updated.", error: false });
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function move(direction: "up" | "down") {
    setBusy(true);
    try {
      await fetch(`/api/team/${member.id}/move`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ direction }) });
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Remove ${member.name} from the team section?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/team/${member.id}`, { method: "DELETE" });
      if (!res.ok) { setMessage({ text: "Could not remove. Please try again.", error: true }); return; }
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="nl-admin-item">
      <div>
        <a href={member.photoUrl} target="_blank" rel="noopener noreferrer" className="nl-admin-thumb" aria-label="Open full-size photo">
          <img src={member.photoUrl} alt={member.name} loading="lazy" />
        </a>
        <label className="button secondary full" style={{ marginTop: 10, textAlign: "center", cursor: "pointer" }}>
          Replace photo
          <input type="file" accept={TEAM_PHOTO_MIME_TYPES.join(",")} style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) replacePhoto(f); }} />
        </label>
      </div>
      <div className="nl-admin-body">
        <div className="nl-admin-actions" style={{ marginTop: 0, marginBottom: 10 }}>
          <button className="button secondary" type="button" disabled={busy || isFirst} onClick={() => move("up")}>↑ Move up</button>
          <button className="button secondary" type="button" disabled={busy || isLast} onClick={() => move("down")}>↓ Move down</button>
          <button className="button secondary" type="button" disabled={busy} onClick={remove}>Remove</button>
        </div>
        <label>
          Name
          <input className="field" value={drafts.name} onChange={(e) => setDrafts((d) => ({ ...d, name: e.target.value }))} />
        </label>
        <label>
          Title at Optimais Labs
          <input className="field" value={drafts.role} onChange={(e) => setDrafts((d) => ({ ...d, role: e.target.value }))} />
        </label>
        <label>
          Day-job affiliation
          <input className="field" value={drafts.affiliation} onChange={(e) => setDrafts((d) => ({ ...d, affiliation: e.target.value }))} />
        </label>
        <label>
          Statement
          <textarea className="field" rows={3} value={drafts.statement} onChange={(e) => setDrafts((d) => ({ ...d, statement: e.target.value }))} />
        </label>
        <div className="nl-admin-actions">
          <button className="button" type="button" disabled={!changed || busy} onClick={save}>{busy ? "Saving…" : "Save changes"}</button>
          {message && <span className={`status ${message.error ? "error" : "success"}`}>{message.text}</span>}
        </div>
      </div>
    </article>
  );
}

export function TeamManagement({ initialMembers }: { initialMembers: TeamMemberSummary[] }) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);

  function refresh() {
    router.refresh();
    fetch("/api/team").then((r) => r.json()).then((data) => setMembers(data.members ?? []));
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Team</h1>
        </div>
      </div>
      <p className="status">Manage the Leadership section shown on the landing page. Order here is the order it's shown in.</p>

      <AddMemberForm onAdded={(member) => setMembers((m) => [...m, member])} />

      <section className="admin-panel">
        {members.length === 0 ? (
          <p className="status">No team members yet.</p>
        ) : (
          <div className="nl-admin-list">
            {members.map((member, i) => (
              <MemberRow key={member.id} member={member} isFirst={i === 0} isLast={i === members.length - 1} onChanged={refresh} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
