"use client";

import { FormEvent, useState } from "react";

export function ApplicationForm() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setStatus("");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/application-tracker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        provider: form.get("provider"),
        status: form.get("status"),
        deadline: form.get("deadline") ? `${form.get("deadline")}T00:00:00.000Z` : "",
        nextStep: form.get("nextStep"),
        notes: form.get("notes"),
        documents: []
      })
    });

    setLoading(false);
    if (!response.ok) {
      setError("Could not add application.");
      return;
    }
    setStatus("Application added. Refresh to see the updated list.");
    event.currentTarget.reset();
  }

  return (
    <form className="admin-panel form-grid" onSubmit={submit}>
      <label>
        Opportunity title
        <input className="field" name="title" required />
      </label>
      <label>
        Provider
        <input className="field" name="provider" />
      </label>
      <label>
        Status
        <select className="field" name="status">
          {["SAVED", "SHORTLISTED", "IN_PROGRESS", "SUBMITTED", "INTERVIEW", "AWARDED", "REJECTED", "ARCHIVED"].map((item) => (
            <option key={item} value={item}>{item.replaceAll("_", " ")}</option>
          ))}
        </select>
      </label>
      <label>
        Deadline
        <input className="field" name="deadline" type="date" />
      </label>
      <label className="full">
        Next step
        <input className="field" name="nextStep" placeholder="Request transcript, draft essay, email recommender..." />
      </label>
      <label className="full">
        Notes
        <textarea className="field" name="notes" />
      </label>
      <button className="button full" disabled={loading} type="submit">{loading ? "Adding..." : "Add application"}</button>
      {status && <p className="status full">{status}</p>}
      {error && <p className="status error full">{error}</p>}
    </form>
  );
}
