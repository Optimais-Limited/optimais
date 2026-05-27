"use client";

import { FormEvent, useState } from "react";

export function SavedScholarshipForm({ scholarships }: { scholarships: { id: string; title: string }[] }) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setStatus("");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/saved-scholarships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scholarshipId: form.get("scholarshipId"),
        notes: form.get("notes")
      })
    });

    setLoading(false);
    if (!response.ok) {
      setError("Could not save scholarship.");
      return;
    }
    setStatus("Saved. Refresh to see the updated list.");
    event.currentTarget.reset();
  }

  return (
    <form className="admin-panel form-grid" onSubmit={submit}>
      <label className="full">
        Scholarship
        <select className="field" name="scholarshipId" required>
          <option value="">Select a published scholarship</option>
          {scholarships.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
      </label>
      <label className="full">
        Notes
        <textarea className="field" name="notes" placeholder="Why this opportunity matters, requirements, reminders..." />
      </label>
      <button className="button full" disabled={loading} type="submit">{loading ? "Saving..." : "Save scholarship"}</button>
      {status && <p className="status full">{status}</p>}
      {error && <p className="status error full">{error}</p>}
    </form>
  );
}
