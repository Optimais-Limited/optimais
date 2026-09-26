export type SiteNavItem = {
  id: string;
  href: string;
  label: string;
  mobileLabel: string;
  tileLabel: string;
  blurb: string;
};

// Single source of truth for the header, mobile menu and the landing page's link tiles.
export const SITE_NAV: SiteNavItem[] = [
  { id: "industries", href: "/industries", label: "Industries", mobileLabel: "Industries", tileLabel: "Industries", blurb: "Ten sectors where we deliver intelligent, lasting impact." },
  { id: "innovation", href: "/innovation", label: "Innovation", mobileLabel: "R&D & Innovation", tileLabel: "R&D and Innovation", blurb: "Applied research, validated through engineering and built to perform." },
  { id: "markets", href: "/markets", label: "Markets", mobileLabel: "Markets", tileLabel: "Markets Served", blurb: "Public, private and industrial markets, and the communities they serve." },
  { id: "opportunities", href: "/opportunities", label: "Opportunities", mobileLabel: "Scholarships & Grants", tileLabel: "Scholarships & Grants", blurb: "Curated funding opportunities for your academic journey." },
  { id: "insights", href: "/insights", label: "Insights", mobileLabel: "Insights", tileLabel: "Insights", blurb: "Research-driven ideas and perspectives on technology and industry." },
  { id: "careers", href: "/careers", label: "Careers", mobileLabel: "Careers", tileLabel: "Careers", blurb: "Join the team building the future of intelligent systems." },
  { id: "deeptech", href: "/deep-tech", label: "Deep Tech", mobileLabel: "Deep Tech", tileLabel: "Deep Tech", blurb: "Frontier science and engineering, from robotics to energy tech." },
  { id: "contact", href: "/contact", label: "Contact", mobileLabel: "Contact", tileLabel: "Contact", blurb: "Start the conversation about your next project." }
];

// /deep-tech is a static page (public/deep-tech.html), so it needs a full page load, not client routing.
export const isStaticRoute = (href: string) => href === "/deep-tech";
