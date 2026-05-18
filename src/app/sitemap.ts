import type { MetadataRoute } from "next";

import { projectCaseStudies } from "@/lib/site-data";

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
  ...projectCaseStudies.map((project) => ({
    path: `/work/${project.slug}`,
    changeFrequency: monthly,
    priority: 0.74,
  })),
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
            new URL("/media/joe-simo-headshot.webp", siteUrl).toString(),
            new URL("/media/work/sim0-current-editor.webp", siteUrl).toString(),
          ]
        : undefined,
    priority: route.priority,
  }));
}
