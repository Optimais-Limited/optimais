"use client";

import { useState } from "react";

const INNOVATION_ITEMS = [
  { label: "Research-first development", body: "Every engagement starts with evidence. We analyse domain constraints, identify the best-known methods, and build from a research-validated foundation." },
  { label: "Applied AI and optimisation", body: "We deploy reinforcement learning, robust optimisation and intelligent decision-making systems directly into industrial, infrastructure and operational workflows." },
  { label: "Systems integration", body: "Our solutions connect hardware, software, data and people inside a unified architecture — from sensor to cloud, from algorithm to action." },
];

export function InnovationAccordion() {
  const [open, setOpen] = useState(0);
  return (
    <div className="accordion">
      {INNOVATION_ITEMS.map((item, idx) => (
        <div key={item.label} className="accordion-item">
          <button className="accordion-trigger" type="button" aria-expanded={open === idx} onClick={() => setOpen(open === idx ? -1 : idx)}>
            <span className="icon">0{idx + 1}</span>
            {item.label}
            <span className="plus">+</span>
          </button>
          <div className={`accordion-panel${open === idx ? " open" : ""}`}>
            <div><p>{item.body}</p></div>
          </div>
        </div>
      ))}
    </div>
  );
}
