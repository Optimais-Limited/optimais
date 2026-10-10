import type { MetadataRoute } from "next";

const SITE_URL = "https://optimaislabs.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/api", "/login", "/signup", "/reset-password"]
    },
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}
