import type { Metadata } from "next";
import { InnovationAccordion } from "./innovation-accordion";

export const metadata: Metadata = {
  title: "R&D and Innovation | Optimais Labs",
  description: "Applied research, validated through engineering and designed to perform in the real world."
};

export default function InnovationPage() {
  return (
    <section className="page-section">
      <div className="shell">
        <div className="panel-layout">
          <div>
            <p className="kicker">R&amp;D and Innovation</p>
            <h1 className="page-title">Built from research. Delivered at scale.</h1>
            <p className="panel-lede">Optimais Labs was founded on the belief that applied research should drive practical solutions. Every solution we build is grounded in research, validated through engineering, and designed to perform in the real world.</p>
            <InnovationAccordion />
          </div>
          <aside className="insight-card">
            <h3>Research Areas</h3>
            <p>Mathematical optimisation · Machine learning · Reinforcement learning · Control systems · Computational modelling · Renewable energy systems</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
