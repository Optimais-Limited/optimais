"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminUserRow, RoleName } from "@/lib/admin-users";

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export function UserRoles({ initialUsers, viewerId, isAdmin }: { initialUsers: AdminUserRow[]; viewerId: string; isAdmin: boolean }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, RoleName>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<Record<string, { text: string; error: boolean }>>({});
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [addStatus, setAddStatus] = useState("");

  async function save(id: string) {
    const role = drafts[id];
    if (!role) return;
    setBusyId(id);
    setMessage((m) => ({ ...m, [id]: { text: "", error: false } }));
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMessage((m) => ({ ...m, [id]: { text: data.error || "Could not save.", error: true } })); return; }
      setDrafts(({ [id]: _removed, ...rest }) => rest);
      setMessage((m) => ({ ...m, [id]: { text: "Role updated.", error: false } }));
      router.refresh();
    } catch {
      setMessage((m) => ({ ...m, [id]: { text: "Could not save. Please try again.", error: true } }));
    } finally {
      setBusyId(null);
    }
  }

  async function toggleSuspend(user: AdminUserRow) {
    const next = !user.suspended;
    if (next && !window.confirm(`Suspend ${user.name || user.email}? They won't be able to sign in until unsuspended.`)) return;
    setBusyId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ suspended: next }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMessage((m) => ({ ...m, [user.id]: { text: data.error || "Could not save.", error: true } })); return; }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function addStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddError("");
    setAddStatus("");
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const role = String(form.get("role") ?? "EDITOR");
    setAdding(true);
    try {
      const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, role }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setAddError(data.error || "Could not add staff member."); return; }
      setAddStatus(`${name} was added as ${role === "ADMIN" ? "an Admin" : "an Editor"}. They've been emailed a link to set their password.`);
      event.currentTarget.reset();
      router.refresh();
    } catch {
      setAddError("Could not add staff member. Check your connection and try again.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Members and roles</h1>
        </div>
      </div>
      <p className="status">
        {isAdmin
          ? "Give someone admin or editor access, suspend an account, or add a new staff member directly. You can't change your own role or suspend yourself — ask another admin if yours needs to change."
          : "Only admins can change roles or suspend accounts. You can view the list, but the controls below are disabled."}
      </p>

      {isAdmin && (
        <form className="admin-panel form-grid" onSubmit={addStaff}>
          <h2 className="full" style={{ margin: 0 }}>Add a staff member</h2>
          <label>
            Name
            <input className="field" name="name" required />
          </label>
          <label>
            Email
            <input className="field" name="email" type="email" required />
          </label>
          <label>
            Role
            <select className="field" name="role" defaultValue="EDITOR">
              <option value="EDITOR">Editor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          <button className="button full" type="submit" disabled={adding}>{adding ? "Adding…" : "Add staff member"}</button>
          {addStatus && <p className="status success full">{addStatus}</p>}
          {addError && <p className="status error full" role="alert">{addError}</p>}
        </form>
      )}

      <section className="admin-panel">
        <div className="nl-admin-list">
          {initialUsers.map((user) => {
            const isSelf = user.id === viewerId;
            const draft = drafts[user.id] ?? user.role;
            const changed = draft !== user.role;
            const msg = message[user.id];
            return (
              <article key={user.id} className="nl-admin-item user-role-item">
                <div className="nl-admin-body">
                  <p className="nl-admin-meta">
                    <strong>{user.name || "Unnamed"}</strong> · {user.email}
                    {isSelf && <span className="nl-badge">You</span>}
                    {user.suspended && <span className="nl-badge exh-status-rejected">Suspended</span>}
                  </p>
                  <p className="exh-admin-description">Joined {fmt(user.createdAt)}{user.accountType ? ` · ${user.accountType}` : ""}</p>
                  <div className="nl-admin-actions">
                    <select
                      className="field user-role-select"
                      value={draft}
                      disabled={!isAdmin || isSelf || busyId === user.id}
                      onChange={(e) => setDrafts((d) => ({ ...d, [user.id]: e.target.value as RoleName }))}
                      aria-label={`Role for ${user.email}`}
                    >
                      <option value="USER">User</option>
                      <option value="EDITOR">Editor</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    {isAdmin && !isSelf && (
                      <button className="button" type="button" disabled={!changed || busyId === user.id} onClick={() => save(user.id)}>
                        {busyId === user.id ? "Saving…" : "Save"}
                      </button>
                    )}
                    {isAdmin && !isSelf && (
                      <button className="button secondary" type="button" disabled={busyId === user.id} onClick={() => toggleSuspend(user)}>
                        {user.suspended ? "Unsuspend" : "Suspend"}
                      </button>
                    )}
                    {msg?.text && <span className={`status ${msg.error ? "error" : "success"}`}>{msg.text}</span>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
