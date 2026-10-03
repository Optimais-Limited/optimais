"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// The closing call-to-action band plus the footer line, shared by the landing page and the site pages.
// The band is hidden on /contact, where it would just link back to the same page.
export function SiteFooter() {
  const showCta = usePathname() !== "/contact";
  return (
    <section className="contact">
      <div className="shell">
        {showCta && (
          <div className="contact-panel">
            <div>
              <h2>Ready to start your project?</h2>
              <p>Bring Optimais Labs into your strategy, engineering or operations programme. Reach out to start the conversation.</p>
            </div>
            <Link className="button" href="/contact">Start a Project</Link>
          </div>
        )}
        <div className="footer-policies">
          <span className="footer-policies-label">Policies</span>
          <nav className="footer-policies-links" aria-label="Policies">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms-of-use">Terms of use</Link>
            <Link href="/community-standards">Community standards</Link>
            <Link href="/report-a-concern">Report a concern</Link>
          </nav>
        </div>
        <div className="footer">
          <span><span className="footer-mark">Optimais Labs</span> — Intelligent Systems. Sustainable Futures.</span>
          <span>© {new Date().getFullYear()} Optimais Labs. All rights reserved.</span>
        </div>
      </div>
    </section>
  );
}
