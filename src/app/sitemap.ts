import type { MetadataRoute } from "next";

import { projectCaseStudiesPublic } from "@/lib/site-data";

const siteUrl = "https://joesimo.com";
type SitemapEntry = {
  path: string;
  changeFrequency: NonNullable<
    MetadataRoute.Sitemap[number]["changeFrequency"]
  >;
  lastModified: Date;
  priority: number;
};
const monthly: SitemapEntry["changeFrequency"] = "monthly";

function dateFromSortKey(sortKey: string) {
  return new Date(`${sortKey}T00:00:00.000Z`);
}

const projectRoutes = projectCaseStudiesPublic.map((project) => ({
  path: `/work/${project.slug}`,
  changeFrequency: monthly,
  lastModified: dateFromSortKey(project.started.sortKey),
  priority: project.tier === "featured" ? 0.8 : 0.6,
}));

const homeLastModified = projectRoutes.reduce(
  (latest, route) =>
    route.lastModified > latest ? route.lastModified : latest,
  new Date("2026-05-13T00:00:00.000Z"),
);
const fallbackSocialImage = new URL("/opengraph-image", siteUrl).toString();

const canonicalRoutes = [
  {
    path: "/",
    changeFrequency: monthly,
    lastModified: homeLastModified,
    priority: 1,
  },
  {
    path: "/blog",
    changeFrequency: monthly,
    lastModified: homeLastModified,
    priority: 0.7,
  },
  ...projectRoutes,
] satisfies SitemapEntry[];

export default function sitemap(): MetadataRoute.Sitemap {
  return canonicalRoutes.map((route) => ({
    url: new URL(route.path, siteUrl).toString(),
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    images: route.path === "/" ? [fallbackSocialImage] : undefined,
    priority: route.priority,
  }));
}
