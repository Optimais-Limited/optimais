"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  DISCUSSION_MESSAGE_MAX,
  DISCUSSION_POLL_MS,
  formatDiscussionDate,
  formatMessageTime,
  type DiscussionMessage,
  type DiscussionRoomSummary
} from "@/lib/discussions-shared";
import { DiscussionVoicePanel } from "@/components/DiscussionVoicePanel";

export function DiscussionRoomView({
  room,
  initialMessages,
  canPost,
  canClose,
  voiceEnabled
}: {
  room: DiscussionRoomSummary;
  initialMessages: DiscussionMessage[];
  canPost: boolean;
  canClose: boolean;
  voiceEnabled: boolean;
}) {
  const [status, setStatus] = useState(room.status);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [closing, setClosing] = useState(false);
  const listEndRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef<string | undefined>(initialMessages[initialMessages.length - 1]?.id);

  useEffect(() => {
    if (status !== "OPEN") return;
    const timer = setInterval(async () => {
      try {
        const url = `/api/discussions/${room.id}/messages${lastIdRef.current ? `?after=${lastIdRef.current}` : ""}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (data.messages?.length) {
          lastIdRef.current = data.messages[data.messages.length - 1].id;
          setMessages((m) => [...m, ...data.messages]);
        }
      } catch {
        // A missed poll just tries again next tick.
      }
    }, DISCUSSION_POLL_MS);
    return () => clearInterval(timer);
  }, [room.id, status]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    try {
      const res = await fetch(`/api/discussions/${room.id}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || "Could not send your message."); if (res.status === 400 && /ended/i.test(data.error || "")) setStatus("CLOSED"); return; }
      lastIdRef.current = data.message.id;
      setMessages((m) => [...m, data.message]);
      setDraft("");
    } catch {
      setError("Could not send your message. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  async function closeRoom() {
    if (!window.confirm("End this discussion? No one will be able to post new messages afterwards.")) return;
    setClosing(true);
    try {
      const res = await fetch(`/api/discussions/${room.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "CLOSED" }) });
      if (res.ok) setStatus("CLOSED");
    } finally {
      setClosing(false);
    }
  }

  return (
    <>
      <header className="disc-room-header">
        <p className="exh-card-meta">Hosted by {room.hostName} · Started {formatDiscussionDate(room.createdAt)}{status === "CLOSED" && <span className="exh-status-badge">Ended</span>}</p>
        <h1 className="page-title exh-detail-title">{room.title}</h1>
        <p className="exh-detail-description">{room.description}</p>
        {canClose && status === "OPEN" && (
          <button className="button secondary" type="button" disabled={closing} onClick={closeRoom}>{closing ? "Ending…" : "End discussion"}</button>
        )}
      </header>

      {voiceEnabled && <DiscussionVoicePanel discussionId={room.id} isHost={room.isHost} roomOpen={status === "OPEN"} />}

      <div className="disc-messages">
        {messages.length === 0 && <p className="status">No messages yet. {status === "OPEN" ? "Say hello." : ""}</p>}
        {messages.map((message) => (
          <div key={message.id} className={`disc-message${message.isOwn ? " own" : ""}`}>
            <p className="disc-message-meta"><strong>{message.authorName}</strong> · {formatMessageTime(message.createdAt)}</p>
            <p className="disc-message-body">{message.body}</p>
          </div>
        ))}
        <div ref={listEndRef} />
      </div>

      {status === "OPEN" ? (
        canPost ? (
          <form className="disc-compose" onSubmit={send}>
            <textarea
              className="field"
              rows={2}
              maxLength={DISCUSSION_MESSAGE_MAX}
              placeholder="Write a message…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="Write a message"
            />
            <button className="button" type="submit" disabled={sending || !draft.trim()}>Send</button>
          </form>
        ) : (
          <p className="status exh-signin-prompt"><a href="/login">Sign in</a> to join the conversation.</p>
        )
      ) : (
        <p className="status">This discussion has ended.</p>
      )}
      {error && <p className="status error" role="alert">{error}</p>}
    </>
  );
}
