import type { Metadata } from "next";
import { OpportunitySearch } from "./opportunity-search";

export const metadata: Metadata = {
  title: "Scholarships & Grants | Optimais Labs",
  description: "Curated scholarships, grants and academic funding opportunities from leading institutions worldwide."
};

export default function OpportunitiesPage() {
  return (
    <section className="page-section">
      <div className="shell">
        <p className="kicker">Scholarships &amp; Grants</p>
        <h1 className="page-title">Find funding for your academic journey.</h1>
        <p className="panel-lede">Optimais Labs curates scholarships, grants, and academic funding opportunities from leading institutions and organisations worldwide.</p>
        <OpportunitySearch />
      </div>
    </section>
  );
}
