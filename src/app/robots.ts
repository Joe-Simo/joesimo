import type { MetadataRoute } from "next";

const siteUrl = "https://joesimo.com";
const sitemapUrl = new URL("/sitemap.xml", siteUrl).toString();
const siteHost = "joesimo.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: sitemapUrl,
    host: siteHost,
  };
}
