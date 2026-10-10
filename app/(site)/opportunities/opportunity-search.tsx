"use client";

import { useEffect, useMemo, useState } from "react";

interface Scholarship {
  id: string;
  title: string;
  provider: string;
  summary: string;
  source: string;
  levels: string[];
  countries: string[];
  fields: string[];
  deadline: string | null;
  deadlineLabel: string | null;
  fundingTypes: string[];
  keywords: string[];
}

// The one canonical level model: JSON and the database both normalize to these keys, and this
// is the only place that maps a key to the label people actually read — previously the filter
// used these same keys but compared them against the JSON file's human-readable labels
// ("Master's", "PhD"), so every level filter silently matched zero records.
const LEVEL_LABELS: Record<string, string> = {
  BACHELORS: "Bachelor's",
  MASTERS: "Master's",
  PHD: "PhD",
  POSTDOC: "Postdoc",
  PROFESSIONAL_TRAINING: "Professional Training"
};
const LABEL_TO_LEVEL: Record<string, string> = Object.fromEntries(Object.entries(LEVEL_LABELS).map(([k, v]) => [v, k]));
const PAGE_SIZE = 10;

type JsonScholarship = {
  title: string; provider: string; summary: string; source: string;
  levels?: string[]; countries?: string[]; fields?: string[]; deadline?: string; fundingTypes?: string[]; keywords?: string[];
};
type DbScholarship = {
  id: string; title: string; provider: string; summary: string; applicationUrl: string;
  eligibleLevels?: string[]; eligibleCountries?: string[]; fields?: string[];
  deadline?: string | null; deadlineLabel?: string | null; fundingTypes?: string[];
};

function fromJson(s: JsonScholarship, index: number): Scholarship {
  return {
    id: `json-${index}`,
    title: s.title,
    provider: s.provider,
    summary: s.summary,
    source: s.source,
    levels: (s.levels ?? []).map((l) => LABEL_TO_LEVEL[l] ?? l),
    countries: s.countries ?? [],
    fields: s.fields ?? [],
    deadline: s.deadline ?? null,
    deadlineLabel: null,
    fundingTypes: s.fundingTypes ?? [],
    keywords: s.keywords ?? []
  };
}

function fromDb(s: DbScholarship): Scholarship {
  return {
    id: s.id,
    title: s.title,
    provider: s.provider,
    summary: s.summary,
    source: s.applicationUrl,
    levels: s.eligibleLevels ?? [],
    countries: s.eligibleCountries ?? [],
    fields: s.fields ?? [],
    deadline: s.deadline ?? null,
    deadlineLabel: s.deadlineLabel ?? null,
    fundingTypes: s.fundingTypes ?? [],
    keywords: []
  };
}

function formatDeadline(s: Scholarship): string | null {
  if (s.deadlineLabel) return s.deadlineLabel;
  if (!s.deadline) return null;
  if (s.deadline.toLowerCase() === "rolling") return "Rolling";
  const date = new Date(s.deadline);
  if (Number.isNaN(date.getTime())) return null;
  // A deadline is a calendar date, stored as UTC midnight; formatting it in the visitor's own
  // timezone showed the previous day to anyone west of UTC.
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

const ArrowRight = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export function OpportunitySearch() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("");
  const [field, setField] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    // The curated JSON list and anything an admin has published through the CMS are both real,
    // current opportunities, so the public finder shows both rather than picking one source.
    Promise.all([
      fetch("/data/scholarships.json").then((r) => r.json()).catch(() => []),
      fetch("/api/scholarships").then((r) => (r.ok ? r.json() : { scholarships: [] })).catch(() => ({ scholarships: [] }))
    ]).then(([json, dbRes]: [JsonScholarship[], { scholarships: DbScholarship[] }]) => {
      setScholarships([...(dbRes.scholarships ?? []).map(fromDb), ...(json ?? []).map(fromJson)]);
    });
  }, []);

  const fieldOptions = useMemo(() => [...new Set(scholarships.flatMap((s) => s.fields))].sort(), [scholarships]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scholarships.filter((s) => {
      if (q) {
        const haystack = [s.title, s.provider, s.summary, ...s.countries, ...s.fields, ...s.keywords].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (level && !s.levels.includes(level)) return false;
      if (field && !s.fields.includes(field)) return false;
      return true;
    });
  }, [scholarships, query, level, field]);

  useEffect(() => setVisible(PAGE_SIZE), [query, level, field]);
  const shown = filtered.slice(0, visible);

  return (
    <>
      <div className="opportunity-tools">
        <input className="filter search-bar" type="search" placeholder="Search provider, country, field or title…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search scholarships" />
        <select className="filter" value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Filter by level">
          <option value="">All levels</option>
          {Object.entries(LEVEL_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select className="filter" value={field} onChange={(e) => setField(e.target.value)} aria-label="Filter by field">
          <option value="">All fields</option>
          {fieldOptions.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        <button className="button" type="button" onClick={() => { setQuery(""); setLevel(""); setField(""); }}>Clear filters</button>
      </div>

      <p className="opportunity-count">
        {filtered.length === 0 ? "No opportunities match your filters." : `Showing ${shown.length} of ${filtered.length} opportunit${filtered.length === 1 ? "y" : "ies"}.`}
      </p>

      <div className="opportunity-list">
        {filtered.length === 0 && (
          <div className="empty-state">No opportunities match your filters — try broadening your search.</div>
        )}
        {shown.map((s) => {
          const deadline = formatDeadline(s);
          return (
            <div key={s.id} className="opportunity-card">
              <h3>{s.title}</h3>
              <div className="opportunity-meta">
                <span className="tag">{s.provider}</span>
                {s.levels.map((l) => <span key={l} className="tag">{LEVEL_LABELS[l] ?? l}</span>)}
                {s.fundingTypes.slice(0, 1).map((f) => <span key={f} className="tag">{f.replace(/_/g, " ")}</span>)}
                {deadline && <span className="tag deadline">Deadline: {deadline}</span>}
              </div>
              <p>{s.summary}</p>
              <a href={s.source} target="_blank" rel="noopener noreferrer">
                Apply / Learn more <ArrowRight />
              </a>
            </div>
          );
        })}
      </div>

      {visible < filtered.length && (
        <button className="button secondary" type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
          Show more ({filtered.length - visible} remaining)
        </button>
      )}
    </>
  );
}
