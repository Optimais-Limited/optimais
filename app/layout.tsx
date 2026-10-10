import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://optimaislabs.com";
const DESCRIPTION =
  "Optimais Labs is a research-driven AI and robotics laboratory and consulting company advancing intelligent systems, renewable energy and engineering across industries, with scholarships and funding opportunities for the next generation.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // No title template: every page already writes its full title ("Insights | Optimais Labs"),
  // so a template appended the site name a second time.
  title: "Optimais Labs — Intelligent Systems. Sustainable Futures.",
  description: DESCRIPTION,
  icons: { icon: "/brand_assets/optimais_logo_clean.svg" },
  openGraph: {
    title: "Optimais Labs — Intelligent Systems. Sustainable Futures.",
    description: DESCRIPTION,
    siteName: "Optimais Labs",
    images: ["/brand_assets/optimaislabs.png"],
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Optimais Labs — Intelligent Systems. Sustainable Futures.",
    description: DESCRIPTION,
    images: ["/brand_assets/optimaislabs.png"]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Deliberately a plain blocking script: it sets data-theme before first paint. Loading it
            through next/script (beforeInteractive) injects it from an async bundle instead, which
            showed light-theme visitors a dark flash on every page. */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/theme-init.js" />
      </head>
      <body>{children}</body>
    </html>
  );
}
