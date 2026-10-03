"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminUserRow, RoleName } from "@/lib/admin-users";

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export function UserRoles({ initialUsers, viewerId, isAdmin }: { initialUsers: AdminUserRow[]; viewerId: string; isAdmin: boolean }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, RoleName>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<Record<string, { text: string; error: boolean }>>({});

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
          ? "Give someone admin or editor access, or remove it. You can't change your own role — ask another admin if yours needs to change."
          : "Only admins can change roles. You can view the list, but the controls below are disabled."}
      </p>

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
