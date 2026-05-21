import type { MetadataRoute } from "next";

const siteUrl = "https://joesimo.com";
type SitemapEntry = {
  path: string;
  changeFrequency: NonNullable<
    MetadataRoute.Sitemap[number]["changeFrequency"]
  >;
  priority: number;
};
const monthly: SitemapEntry["changeFrequency"] = "monthly";

const canonicalRoutes = [
  {
    path: "/",
    changeFrequency: monthly,
    priority: 1,
  },
] satisfies SitemapEntry[];
const lastModified = new Date("2026-05-13T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return canonicalRoutes.map((route) => ({
    url: new URL(route.path, siteUrl).toString(),
    lastModified,
    changeFrequency: route.changeFrequency,
    images:
      route.path === "/"
        ? [
            new URL("/media/work/sim0-current-editor.webp", siteUrl).toString(),
          ]
        : undefined,
    priority: route.priority,
  }));
}
