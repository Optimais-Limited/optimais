import type { Metadata } from "next";
import Link from "next/link";
import { getSiteViewer } from "@/lib/site-viewer";

export const metadata: Metadata = {
  title: "Careers | Optimais Labs",
  description: "Join the team building the future of intelligent systems."
};

const ArrowRight = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export default async function CareersPage() {
  const { isAuthenticated } = await getSiteViewer();

  return (
    <section className="page-section">
      <div className="shell">
        <div className="panel-layout">
          <div>
            <p className="kicker">Join the Team</p>
            <h1 className="page-title">Build the future of intelligent systems with us.</h1>
            <p className="panel-lede">We&apos;re looking for passionate individuals who thrive in collaborative environments, value openness, and are eager to learn, grow, and help others succeed.</p>
            <p className="panel-lede" style={{ marginTop: 12 }}>
              If you&apos;re ready to apply your knowledge, skills, and experience to meaningful and innovative challenges, this is your opportunity to take your career to the next level with us.
            </p>
            <Link className="button" href={isAuthenticated ? "/contact" : "/signup"} style={{ marginTop: 24 }}>
              {isAuthenticated ? "Apply Now" : "Apply Now — Sign Up First"}
            </Link>
          </div>
          <aside className="insight-card">
            <h3>Explore Opportunities</h3>
            {/* No open-roles board exists yet (no JobPosting data model); these point at a real,
                working channel — Contact — rather than a dead "#" or a broken signup redirect. */}
            <div className="career-links">
              <Link href="/contact" className="career-link-item"><span>Early Careers</span><ArrowRight /></Link>
              <Link href="/contact" className="career-link-item"><span>Experienced Professionals</span><ArrowRight /></Link>
              <a href="/culture-benefits" className="career-link-item"><span>Culture &amp; Benefits</span><ArrowRight /></a>
              <a href="/our-stories" className="career-link-item"><span>Our Stories</span><ArrowRight /></a>
              <Link href="/contact" className="career-link-item"><span>Job Alerts</span><ArrowRight /></Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
