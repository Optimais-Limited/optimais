"use client";

import { useState } from "react";

export function ConcernForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  if (status === "success") {
    return (
      <div className="contact-success">
        <p>✓ Thank you — we've received your report and will look into it.</p>
      </div>
    );
  }

  return (
    <form
      className="contact-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus("idle");
        try {
          const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, subject: "Report a concern", message })
          });
          if (res.ok) {
            setStatus("success");
            setName("");
            setEmail("");
            setMessage("");
          } else {
            setStatus("error");
          }
        } catch {
          setStatus("error");
        } finally {
          setLoading(false);
        }
      }}
    >
      <input className="opt-field" type="text" placeholder="Your name" aria-label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <input className="opt-field" type="email" placeholder="Your email" aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <textarea className="opt-field" placeholder="What happened, and where (a link helps)?" aria-label="What's the concern?" value={message} onChange={(e) => setMessage(e.target.value)} required minLength={10} rows={5} />
      {status === "error" && <p style={{ color: "var(--danger, #d96c5f)", fontSize: "0.85rem", margin: "0 0 8px" }}>Something went wrong. Please try again.</p>}
      <button className="button" type="submit" disabled={loading}>
        {loading ? "Sending…" : "Send Report"}
      </button>
    </form>
  );
}
