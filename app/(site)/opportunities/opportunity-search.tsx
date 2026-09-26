"use client";

import { useEffect, useMemo, useState } from "react";

interface Scholarship {
  title: string;
  provider: string;
  summary: string;
  source: string;
  levels?: string[];
  countries?: string[];
  fields?: string[];
  deadline?: string;
  fundingTypes?: string[];
  keywords?: string[];
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

  useEffect(() => {
    fetch("/data/scholarships.json")
      .then(r => r.json())
      .then((data: Scholarship[]) => setScholarships(data))
      .catch(() => setScholarships([]));
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return scholarships.filter(s => {
      if (q && !s.title.toLowerCase().includes(q) && !s.provider.toLowerCase().includes(q) && !(s.summary || "").toLowerCase().includes(q)) return false;
      if (level && !(s.levels || []).includes(level)) return false;
      if (field && !(s.fields || []).includes(field)) return false;
      return true;
    }).slice(0, 10);
  }, [scholarships, query, level, field]);

  return (
    <>
      <div className="opportunity-tools">
        <input className="filter search-bar" type="search" placeholder="Search provider, country, field or title…" value={query} onChange={e => setQuery(e.target.value)} aria-label="Search scholarships" />
        <select className="filter" value={level} onChange={e => setLevel(e.target.value)} aria-label="Filter by level">
          <option value="">All levels</option>
          <option value="BACHELORS">Bachelor&apos;s</option>
          <option value="MASTERS">Master&apos;s</option>
          <option value="PHD">PhD</option>
          <option value="POSTDOC">Postdoc</option>
          <option value="PROFESSIONAL_TRAINING">Professional Training</option>
        </select>
        <select className="filter" value={field} onChange={e => setField(e.target.value)} aria-label="Filter by field">
          <option value="">All fields</option>
          <option value="Engineering">Engineering</option>
          <option value="Technology">Technology</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Natural Sciences">Natural Sciences</option>
          <option value="Business">Business</option>
        </select>
        <button className="button" type="button" onClick={() => { setQuery(""); setLevel(""); setField(""); }}>Clear filters</button>
      </div>

      <div className="opportunity-list">
        {filtered.length === 0 && (
          <div className="empty-state">No opportunities match your filters — try broadening your search.</div>
        )}
        {filtered.map(s => (
          <div key={s.title} className="opportunity-card">
            <h3>{s.title}</h3>
            <div className="opportunity-meta">
              <span className="tag">{s.provider}</span>
              {(s.levels || []).map(l => <span key={l} className="tag">{l}</span>)}
              {(s.fundingTypes || []).slice(0, 1).map(f => <span key={f} className="tag">{f.replace("_", " ")}</span>)}
            </div>
            <p>{s.summary}</p>
            <a href={s.source} target="_blank" rel="noopener noreferrer">
              Apply / Learn more <ArrowRight />
            </a>
          </div>
        ))}
      </div>
    </>
  );
}
