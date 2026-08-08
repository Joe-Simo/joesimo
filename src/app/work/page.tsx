import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteIcon } from "@/components/site/site-icons";
import {
  projectCaseStudiesPublic,
  socialChannels,
  type PublicProjectCaseStudy,
} from "@/lib/site-data";

const pageTitle = "Work";
const pageDescription =
  "Case studies for Joe Simo's products and systems: what each project is, the constraints it was built under, and the evidence behind it.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/work",
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "/work",
  },
};

function tierRank(project: PublicProjectCaseStudy) {
  return project.tier === "featured" ? 0 : 1;
}

export default function WorkIndexPage() {
  const projects = [...projectCaseStudiesPublic].sort(
    (a, b) =>
      tierRank(a) - tierRank(b) ||
      b.started.sortKey.localeCompare(a.started.sortKey),
  );

  return (
    <div id="top" className="min-h-screen bg-background text-foreground">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-3 focus:text-sm focus:shadow-lg focus:ring-3 focus:ring-ring/35"
        href="#main-content"
      >
        Skip to content
      </a>

      <SiteHeader activeHref="#work" homeHref="/" sectionPrefix="/" />

      <main className="work-case" id="main-content" tabIndex={-1}>
        <section className="work-case-hero site-page-shell">
          <div className="work-case-hero-copy">
            <Link className="work-case-back" href="/#work">
              <SiteIcon aria-hidden iconKey="arrowUpRight" />
              Home
            </Link>
            <h1>{pageTitle}</h1>
            <p className="work-case-summary">{pageDescription}</p>
          </div>
        </section>

        <section
          aria-label="All case studies"
          className="site-page-shell work-index-list"
        >
          <ul className="joe-case-study-grid">
            {projects.map((project) => (
              <li key={project.slug}>
                <Link
                  className="joe-case-study-link"
                  href={`/work/${project.slug}`}
                >
                  <span>
                    <strong>{project.title}</strong>
                    <small>
                      {project.role} — {project.status}
                    </small>
                  </span>
                  <SiteIcon aria-hidden iconKey="arrowUpRight" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <SiteFooter socialChannels={socialChannels} />
    </div>
  );
}
