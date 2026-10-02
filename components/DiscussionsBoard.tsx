"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { DISCUSSION_DESCRIPTION_MAX, DISCUSSION_TITLE_MAX, type DiscussionRoomSummary } from "@/lib/discussions-shared";

function RoomCard({ room }: { room: DiscussionRoomSummary }) {
  return (
    <Link href={`/discussions/${room.id}`} className="exh-card disc-card">
      <div className="exh-card-body">
        <p className="exh-card-meta">
          Hosted by {room.hostName}
          {room.status === "CLOSED" && <span className="exh-status-badge">Ended</span>}
        </p>
        <h3 className="exh-card-title">{room.title}</h3>
        <p className="disc-card-description">{room.description}</p>
        <div className="exh-card-stats">
          <span className="exh-comment-count">{room.messageCount} message{room.messageCount === 1 ? "" : "s"}</span>
        </div>
      </div>
    </Link>
  );
}

export function DiscussionsBoard({ initialRooms, canPost }: { initialRooms: DiscussionRoomSummary[]; canPost: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  async function start(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    if (title.length < 3) { setError("Please give your discussion a title."); return; }
    if (description.length < 10) { setError("Please add a little more detail about what you'll discuss."); return; }

    setStarting(true);
    try {
      const res = await fetch("/api/discussions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, description }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || "Could not start the discussion."); return; }
      router.push(`/discussions/${data.room.id}`);
    } catch {
      setError("Could not start the discussion. Check your connection and try again.");
    } finally {
      setStarting(false);
    }
  }

  return (
    <>
      {canPost ? (
        <form className="admin-panel form-grid disc-composer" onSubmit={start}>
          <label className="full">
            Title
            <input className="field" name="title" maxLength={DISCUSSION_TITLE_MAX} placeholder="What do you want to talk about?" required />
          </label>
          <label className="full">
            Description
            <textarea className="field" name="description" rows={3} maxLength={DISCUSSION_DESCRIPTION_MAX} placeholder="Give people a reason to join in." required />
          </label>
          <button className="button full" type="submit" disabled={starting}>{starting ? "Starting…" : "Start a discussion"}</button>
          {error && <p className="status error" role="alert">{error}</p>}
        </form>
      ) : (
        <p className="status exh-signin-prompt"><Link href="/login">Sign in</Link> to host or join a discussion.</p>
      )}

      {initialRooms.length === 0 ? (
        <div className="empty-state">No discussions yet. Be the first to start one.</div>
      ) : (
        <div className="exh-grid">
          {initialRooms.map((room) => <RoomCard key={room.id} room={room} />)}
        </div>
      )}
    </>
  );
}
