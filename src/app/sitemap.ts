import type { MetadataRoute } from "next";

import { blogPosts, projectCaseStudiesPublic } from "@/lib/site-data";

const siteUrl = "https://joesimo.com";
type SitemapEntry = {
  path: string;
  changeFrequency: NonNullable<
    MetadataRoute.Sitemap[number]["changeFrequency"]
  >;
  priority: number;
};
const monthly: SitemapEntry["changeFrequency"] = "monthly";

const workIndexRoute: SitemapEntry = {
  path: "/work",
  changeFrequency: monthly,
  priority: 0.8,
};

const projectRoutes = projectCaseStudiesPublic.map((project) => ({
  path: `/work/${project.slug}`,
  changeFrequency: monthly,
  priority: project.tier === "featured" ? 0.8 : 0.6,
}));

const blogPostRoutes = blogPosts.map((post) => ({
  path: post.href,
  changeFrequency: monthly,
  priority: 0.7,
}));

const fallbackSocialImage = new URL("/opengraph-image", siteUrl).toString();

const canonicalRoutes = [
  {
    path: "/",
    changeFrequency: monthly,
    priority: 1,
  },
  {
    path: "/blog",
    changeFrequency: monthly,
    priority: 0.7,
  },
  ...blogPostRoutes,
  workIndexRoute,
  ...projectRoutes,
] satisfies SitemapEntry[];

export default function sitemap(): MetadataRoute.Sitemap {
  return canonicalRoutes.map((route) => ({
    url: new URL(route.path, siteUrl).toString(),
    changeFrequency: route.changeFrequency,
    images: route.path === "/" ? [fallbackSocialImage] : undefined,
    priority: route.priority,
  }));
}
