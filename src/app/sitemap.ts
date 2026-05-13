import type { MetadataRoute } from "next";

const siteUrl = "https://joesimo.com";
const canonicalRoutes = [
  {
    path: "/",
    changeFrequency: "monthly",
    priority: 1,
  },
] as const;
const lastModified = new Date("2026-05-13T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return canonicalRoutes.map((route) => ({
    url: new URL(route.path, siteUrl).toString(),
    lastModified,
    changeFrequency: route.changeFrequency,
    images: [
      new URL("/media/joe-simo-x-avatar.webp", siteUrl).toString(),
      new URL("/media/sim0-editor-artifact.png", siteUrl).toString(),
    ],
    priority: route.priority,
  }));
}
