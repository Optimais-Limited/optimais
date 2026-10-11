"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS: [string, string][] = [
  ["/ai-agents", "Overview"],
  ["/ai-agents/how-it-works", "How it works"],
  ["/ai-agents/demos", "Demo"],
  ["/ai-agents/pricing", "Pricing"],
  ["/ai-agents/trust", "Trust"],
  ["/ai-agents/case-studies", "Case studies"],
  ["/ai-agents/resources", "Resources"],
  ["/ai-agents/audit", "Request an audit"]
];

export function AgentsSubnav() {
  const pathname = usePathname();
  return (
    <nav className="aa-subnav" aria-label="AI Agent Integration">
      <div className="shell aa-subnav-inner">
        {LINKS.map(([href, label]) => (
          <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={href === "/ai-agents/audit" ? "aa-subnav-cta" : ""}>{label}</Link>
        ))}
      </div>
    </nav>
  );
}
