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
        <div className="footer">
          <span><span className="footer-mark">Optimais Labs</span> — Intelligent Systems. Sustainable Futures.</span>
          <span>© {new Date().getFullYear()} Optimais Labs. All rights reserved.</span>
        </div>
      </div>
    </section>
  );
}
