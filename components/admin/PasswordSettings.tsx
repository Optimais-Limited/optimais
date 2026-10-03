"use client";

import { FormEvent, useState } from "react";

export function PasswordSettings() {
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");
    const form = new FormData(event.currentTarget);
    const currentPassword = String(form.get("currentPassword") ?? "");
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    if (newPassword !== confirmPassword) { setError("The new password and confirmation don't match."); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/password", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword, newPassword }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || "Could not change your password."); return; }
      setStatus("Password changed.");
      event.currentTarget.reset();
    } catch {
      setError("Could not change your password. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-panel form-grid">
      <h2 className="full" style={{ margin: 0 }}>Change your password</h2>
      <form className="full form-grid" onSubmit={submit}>
        <label className="full">
          Current password
          <input className="field" name="currentPassword" type="password" autoComplete="current-password" required />
        </label>
        <label>
          New password
          <input className="field" name="newPassword" type="password" autoComplete="new-password" minLength={8} required />
        </label>
        <label>
          Confirm new password
          <input className="field" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required />
        </label>
        <button className="button full" type="submit" disabled={saving}>{saving ? "Saving…" : "Change password"}</button>
        {status && <p className="status success full">{status}</p>}
        {error && <p className="status error full" role="alert">{error}</p>}
      </form>
      <p className="status full">More settings are on the way. For now this only covers your own password.</p>
    </section>
  );
}
