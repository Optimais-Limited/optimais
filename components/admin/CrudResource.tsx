"use client";

import { FormEvent, useEffect, useState } from "react";

type Field = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "url" | "email" | "datetime-local" | "select";
  options?: string[];
  placeholder?: string;
  full?: boolean;
};

type CrudResourceProps = {
  title: string;
  description: string;
  endpoint: string;
  fields?: Field[];
};

function defaultValueFor(field: Field, item: Record<string, unknown> | null): string {
  if (!item) return "";
  const raw = item[field.name.replace("[]", "")];
  if (field.name.endsWith("[]")) return Array.isArray(raw) ? raw.join(", ") : "";
  if (field.name === "isPublished") return String(Boolean(raw));
  if (field.type === "datetime-local") {
    if (typeof raw !== "string" || !raw) return "";
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return "";
    // datetime-local wants local time with no timezone. Seconds are kept (the input has step=1)
    // so a 23:59:59 deadline doesn't lose 59 seconds every time the record is edited.
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }
  return typeof raw === "string" ? raw : raw == null ? "" : String(raw);
}

export function CrudResource({ title, description, endpoint, fields = [] }: CrudResourceProps) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Create posts to `endpoint` as-is (it may carry ?admin=true); edit/delete need the bare
  // resource path, since the [id] routes live under the path without that query string.
  const basePath = endpoint.split("?")[0];
  const editable = fields.length > 0; // the two resources with a creation form (scholarships, blog)
  // are the only ones whose [id] route supports PUT/DELETE — the others are read-only admin views.
  const editingItem = editingId ? items.find((item) => item.id === editingId) ?? null : null;

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      const firstArray = Object.values(data).find(Array.isArray) as Record<string, unknown>[] | undefined;
      setItems(firstArray ?? []);
    } catch {
      setError("Could not load records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [endpoint]);

  function cancelEdit() {
    setEditingId(null);
    setStatus("");
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Captured now: React nulls event.currentTarget once this handler's synchronous phase ends,
    // so reading it after the `await fetch` below (to reset the form) would throw on every save —
    // including successful ones, which then wrongly reported "Could not save record."
    const form = event.currentTarget;
    const wasEditing = editingId;
    setSaving(true);
    setError("");
    setStatus("");
    const formData = new FormData(form);
    const payload: Record<string, unknown> = {};

    fields.forEach((field) => {
      const value = String(formData.get(field.name) ?? "");
      if (field.name.endsWith("[]")) {
        const key = field.name.replace("[]", "");
        const original = editingItem?.[key];
        // An untouched list goes back exactly as stored: splitting on commas would break an
        // entry that itself contains one ("Korea, Republic of").
        payload[key] = editingItem && Array.isArray(original) && value === defaultValueFor(field, editingItem)
          ? original
          : value.split(",").map((item) => item.trim()).filter(Boolean);
      } else if (field.name === "isPublished") {
        payload[field.name] = value === "true";
      } else if (field.type === "datetime-local") {
        // scholarshipSchema.deadline requires full ISO-8601 (z.string().datetime()); the browser's
        // datetime-local value ("2026-08-01T12:00") is missing seconds and a timezone and fails
        // that check outright, so every scholarship with a deadline failed to save.
        payload[field.name] = value ? new Date(value).toISOString() : "";
      } else {
        payload[field.name] = value;
      }
    });

    try {
      const response = await fetch(wasEditing ? `${basePath}/${wasEditing}` : endpoint, {
        method: wasEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const fieldErrors = body?.details?.fieldErrors as Record<string, string[]> | undefined;
        const detail = fieldErrors
          ? Object.entries(fieldErrors).map(([k, v]) => `${k}: ${v.join("; ")}`).join(" · ")
          : body?.error;
        throw new Error(detail || "Save failed.");
      }
      setStatus(wasEditing ? "Changes saved." : "Saved.");
      if (wasEditing) setEditingId(null); else form.reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save record. Check required fields and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string, label: string) {
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
    setError("");
    try {
      const response = await fetch(`${basePath}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || "Delete failed.");
      if (editingId === id) setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete record.");
    }
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <p className="eyebrow">Admin CRUD</p>
          <h1>{title}</h1>
        </div>
      </div>
      <p className="status">{description}</p>

      {!!fields.length && (
        <form className="admin-panel form-grid" onSubmit={submit} key={editingId ?? "new"}>
          {editingItem && <p className="status full">Editing &ldquo;{String(editingItem.title ?? editingItem.name ?? editingId)}&rdquo;.</p>}
          {fields.map((field) => (
            <label className={field.full ? "full" : ""} key={field.name}>
              {field.label}
              {field.type === "textarea" ? (
                <textarea className="field" name={field.name} placeholder={field.placeholder} defaultValue={defaultValueFor(field, editingItem)} />
              ) : field.type === "select" ? (
                <select className="field" name={field.name} defaultValue={defaultValueFor(field, editingItem)}>
                  {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : (
                <input className="field" name={field.name} type={field.type ?? "text"} step={field.type === "datetime-local" ? 1 : undefined} placeholder={field.placeholder} defaultValue={defaultValueFor(field, editingItem)} />
              )}
            </label>
          ))}
          <div className="nl-admin-actions full" style={{ marginTop: 0 }}>
            <button className="button" disabled={saving} type="submit">{saving ? "Saving..." : editingItem ? "Save changes" : "Save"}</button>
            {editingItem && <button className="button secondary" type="button" onClick={cancelEdit} disabled={saving}>Cancel</button>}
          </div>
          {status && <p className="status">{status}</p>}
          {error && <p className="status error">{error}</p>}
        </form>
      )}

      <section className="admin-panel">
        {loading ? (
          <p className="status">Loading records...</p>
        ) : error && !items.length ? (
          <p className="status error">{error}</p>
        ) : (
          <div className="list">
            {items.length ? items.map((item) => {
              const id = item.id ? String(item.id) : "";
              const label = String(item.title ?? item.email ?? item.name ?? item.provider ?? "Record");
              return (
                <article className="list-item" key={id || JSON.stringify(item).slice(0, 30)}>
                  <h3>{label}</h3>
                  <p>{String(item.summary ?? item.message ?? item.excerpt ?? item.status ?? item.createdAt ?? "")}</p>
                  {editable && id && (
                    <div className="nl-admin-actions">
                      <button type="button" className="button secondary" onClick={() => { setEditingId(id); setStatus(""); setError(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit</button>
                      <button type="button" className="button secondary" onClick={() => remove(id, label)}>Delete</button>
                    </div>
                  )}
                </article>
              );
            }) : <p className="status">No records yet.</p>}
          </div>
        )}
      </section>
    </>
  );
}
