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

export function CrudResource({ title, description, endpoint, fields = [] }: CrudResourceProps) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setStatus("");
    const formData = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = {};

    fields.forEach((field) => {
      const value = String(formData.get(field.name) ?? "");
      if (field.name.endsWith("[]")) {
        payload[field.name.replace("[]", "")] = value.split(",").map((item) => item.trim()).filter(Boolean);
      } else if (field.name === "isPublished") {
        payload[field.name] = value === "true";
      } else {
        payload[field.name] = value;
      }
    });

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Save failed.");
      setStatus("Saved.");
      event.currentTarget.reset();
      await load();
    } catch {
      setError("Could not save record. Check required fields and try again.");
    } finally {
      setSaving(false);
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
        <form className="admin-panel form-grid" onSubmit={submit}>
          {fields.map((field) => (
            <label className={field.full ? "full" : ""} key={field.name}>
              {field.label}
              {field.type === "textarea" ? (
                <textarea className="field" name={field.name} placeholder={field.placeholder} />
              ) : field.type === "select" ? (
                <select className="field" name={field.name}>
                  {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : (
                <input className="field" name={field.name} type={field.type ?? "text"} placeholder={field.placeholder} />
              )}
            </label>
          ))}
          <button className="button full" disabled={saving} type="submit">{saving ? "Saving..." : "Save"}</button>
          {status && <p className="status">{status}</p>}
          {error && <p className="status error">{error}</p>}
        </form>
      )}

      <section className="admin-panel">
        {loading ? (
          <p className="status">Loading records...</p>
        ) : error ? (
          <p className="status error">{error}</p>
        ) : (
          <div className="list">
            {items.length ? items.map((item) => (
              <article className="list-item" key={String(item.id ?? JSON.stringify(item).slice(0, 30))}>
                <h3>{String(item.title ?? item.email ?? item.name ?? item.provider ?? "Record")}</h3>
                <p>{String(item.summary ?? item.message ?? item.excerpt ?? item.status ?? item.createdAt ?? "")}</p>
              </article>
            )) : <p className="status">No records yet.</p>}
          </div>
        )}
      </section>
    </>
  );
}
