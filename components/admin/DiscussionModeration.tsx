"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDiscussionDate, type DiscussionRoomSummary } from "@/lib/discussions-shared";

export function DiscussionModeration({ initialRooms }: { initialRooms: DiscussionRoomSummary[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<Record<string, string>>({});

  async function close(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/discussions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "CLOSED" }) });
      if (!res.ok) { setMessage((m) => ({ ...m, [id]: "Could not end it. Please try again." })); return; }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this discussion permanently? Every message in it goes with it. This cannot be undone.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/discussions/${id}`, { method: "DELETE" });
      if (!res.ok) { setMessage((m) => ({ ...m, [id]: "Could not delete it. Please try again." })); return; }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Discussions</h1>
        </div>
      </div>
      <p className="status">End a discussion early, or remove one entirely. Hosts can already do this for their own room — these controls work on anyone's.</p>

      <section className="admin-panel">
        {initialRooms.length === 0 ? (
          <p className="status">No discussions started yet.</p>
        ) : (
          <div className="nl-admin-list">
            {initialRooms.map((room) => (
              <article key={room.id} className="nl-admin-item user-role-item">
                <div className="nl-admin-body">
                  <p className="nl-admin-meta">
                    <strong>{room.title}</strong> · Hosted by {room.hostName} · Started {formatDiscussionDate(room.createdAt)}
                    <span className={`nl-badge${room.status === "CLOSED" ? " exh-status-rejected" : ""}`}>{room.status}</span>
                  </p>
                  <p className="exh-admin-description">{room.description} — {room.messageCount} message{room.messageCount === 1 ? "" : "s"}</p>
                  <div className="nl-admin-actions">
                    {room.status === "OPEN" && (
                      <button className="button" type="button" disabled={busyId === room.id} onClick={() => close(room.id)}>{busyId === room.id ? "Ending…" : "End discussion"}</button>
                    )}
                    <button className="button secondary" type="button" disabled={busyId === room.id} onClick={() => remove(room.id)}>Delete</button>
                    {message[room.id] && <span className="status error">{message[room.id]}</span>}
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
