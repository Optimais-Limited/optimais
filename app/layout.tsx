import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Optimais Limited",
  description: "Optimais Limited website, scholarship platform, admin CMS, and AI services."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
