import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Optimais Labs",
  description: "Optimais Labs website, scholarship platform, admin CMS, and AI services."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="/theme-init.js" />
      </head>
      <body>{children}</body>
    </html>
  );
}
