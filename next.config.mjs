import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const isDev = process.env.NODE_ENV !== "production";

// 'unsafe-inline' is required today: Next.js hydration bootstrap scripts and the static
// public/*.html pages use inline <script>/<style>. A nonce-based script-src would force
// every route to render dynamically, so it is left as a follow-up.
const buildCsp = (extraScriptSrc = "") => [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${extraScriptSrc ? " " + extraScriptSrc : ""}${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "media-src 'self'",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'"
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: buildCsp() },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Legacy static page imports three.js from jsDelivr; allow that origin for this page only.
      // Listed after the catch-all so its CSP overrides the default for this path.
      {
        source: "/index.html",
        headers: [{ key: "Content-Security-Policy", value: buildCsp("https://cdn.jsdelivr.net") }]
      }
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb"
    }
  },
  // vercel.json's cleanUrls only rewrites these in production; add the same
  // mapping here so the extensionless links in optimais-landing.tsx also
  // resolve to their public/*.html pages in local dev.
  async rewrites() {
    return [
      { source: "/deep-tech", destination: "/deep-tech.html" },
      { source: "/culture-benefits", destination: "/culture-benefits.html" },
      { source: "/our-stories", destination: "/our-stories.html" }
    ];
  }
};

export default nextConfig;
