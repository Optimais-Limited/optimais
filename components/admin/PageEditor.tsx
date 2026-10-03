"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SitePageContent, SitePageSlug } from "@/lib/site-pages-shared";

const LABELS: Record<SitePageSlug, string> = {
  "about-us": "About Us",
  "privacy-policy": "Privacy Policy",
  "terms-of-use": "Terms of Use",
  "community-standards": "Community Standards"
};

const fmt = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) + " UTC";

export function PageEditor({ initialPages }: { initialPages: SitePageContent[] }) {
  const router = useRouter();
  const [pages, setPages] = useState(initialPages);
  const [selected, setSelected] = useState<SitePageSlug>(initialPages[0]?.slug ?? "about-us");
  const [drafts, setDrafts] = useState<Record<string, { title: string; body: string }>>({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const current = pages.find((p) => p.slug === selected)!;
  const draft = drafts[selected] ?? { title: current.title, body: current.body };
  const changed = draft.title !== current.title || draft.body !== current.body;

  function select(slug: SitePageSlug) {
    setSelected(slug);
    setStatus("");
    setError("");
  }

  async function save() {
    setSaving(true);
    setStatus("");
    setError("");
    try {
      const res = await fetch(`/api/site-pages/${selected}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || "Could not save this page."); return; }
      setPages((list) => list.map((p) => (p.slug === selected ? data.page : p)));
      setDrafts(({ [selected]: _removed, ...rest }) => rest);
      setStatus("Saved. The live page now shows this content.");
      router.refresh();
    } catch {
      setError("Could not save this page. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  const publicPath = `/${selected}`;

  return (
    <>
      <div className="admin-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Pages</h1>
        </div>
      </div>
      <p className="status">
        Edit the About Us page and the three policy pages. Start a line with <code>## </code> for a heading, or <code>- </code> for a bullet point; blank lines separate paragraphs.
      </p>

      <div className="admin-panel form-grid">
        <label className="full">
          Page
          <select className="field" value={selected} onChange={(e) => select(e.target.value as SitePageSlug)}>
            {pages.map((p) => <option key={p.slug} value={p.slug}>{LABELS[p.slug]}</option>)}
          </select>
        </label>
        <p className="status full" style={{ margin: 0 }}>
          {current.updatedAt ? `Last updated ${fmt(current.updatedAt)}` : "Not yet customized — showing the built-in default."}
          {" · "}
          <a href={publicPath} target="_blank" rel="noopener noreferrer">View live page</a>
        </p>
        <label className="full">
          Title
          <input className="field" value={draft.title} onChange={(e) => setDrafts((d) => ({ ...d, [selected]: { ...draft, title: e.target.value } }))} />
        </label>
        <label className="full">
          Body
          <textarea className="field" rows={18} value={draft.body} onChange={(e) => setDrafts((d) => ({ ...d, [selected]: { ...draft, body: e.target.value } }))} />
        </label>
        <button className="button full" type="button" disabled={!changed || saving} onClick={save}>{saving ? "Saving…" : "Save page"}</button>
        {status && <p className="status success full">{status}</p>}
        {error && <p className="status error full" role="alert">{error}</p>}
      </div>
    </>
  );
}
