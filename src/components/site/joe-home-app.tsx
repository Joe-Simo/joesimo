"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { SimoIndexRitual } from "@/components/site/simo-index-ritual";
import type {
  FieldNote,
  JoeProfile,
  PublicProjectCaseStudy,
  SiteMedia,
  WritingFragment,
} from "@/lib/site-data";

type ActiveView = "portfolio" | "blog";

type JoeHomeAppProps = {
  fieldNotes: FieldNote[];
  joeProfile: JoeProfile;
  profileMedia: SiteMedia;
  projects: PublicProjectCaseStudy[];
  writingFragments: WritingFragment[];
};

function ExternalCue({ show }: { show?: boolean }) {
  return show ? <span className="sr-only">opens in a new tab</span> : null;
}

function getPrimaryMedia(project: PublicProjectCaseStudy) {
  return project.assets[0]?.media;
}

function sortedWork(projects: PublicProjectCaseStudy[]) {
  return [...projects].sort((first, second) => {
    const firstRank = first.homepageFeature?.rank ?? 99;
    const secondRank = second.homepageFeature?.rank ?? 99;

    if (firstRank !== secondRank) {
      return firstRank - secondRank;
    }

    const tierOrder: Record<PublicProjectCaseStudy["tier"], number> = {
      featured: 0,
      case: 1,
      supporting: 2,
      specimen: 3,
    };

    return tierOrder[first.tier] - tierOrder[second.tier];
  });
}

function resolveViewFromHash(hash: string): ActiveView {
  return hash === "#blog" ? "blog" : "portfolio";
}

function WorkMedia({
  media,
  priority = false,
}: {
  media?: SiteMedia;
  priority?: boolean;
}) {
  if (!media) {
    return (
      <div className="simo-work-media is-empty" aria-hidden>
        <span />
      </div>
    );
  }

  return (
    <div className="simo-work-media">
      <Image
        src={media.src}
        alt={media.alt}
        width={media.width}
        height={media.height}
        sizes="(min-width: 1024px) 34vw, 92vw"
        priority={priority}
      />
    </div>
  );
}

function WorkPanel({ projects }: { projects: PublicProjectCaseStudy[] }) {
  const ranked = sortedWork(projects);
  const topWork = ranked.slice(0, 5);
  const supporting = ranked.slice(5);

  return (
    <div className="simo-view-panel" aria-labelledby="work-title">
      <div className="simo-section-heading">
        <p className="simo-index-kicker">Portfolio</p>
        <h2 id="work-title">Selected work, shown through surfaces.</h2>
        <p>
          sim0 leads because it is the clearest current product surface. The
          rest of the portfolio shows range across mobile apps, games,
          utilities, product artwork, and earlier web identity work.
        </p>
      </div>

      <div className="simo-work-feature-list">
        {topWork.map((project, index) => {
          const media = getPrimaryMedia(project);

          return (
            <article
              key={project.slug}
              className="simo-work-feature"
              data-featured={index === 0 ? "true" : "false"}
            >
              <div className="simo-work-number">{project.code}</div>
              <div className="simo-work-copy">
                <div>
                  <p className="simo-work-tier">
                    {project.tier === "featured" ? "Featured proof" : project.proofMode}
                  </p>
                  <h3>{project.title}</h3>
                </div>
                <p>{project.summary}</p>
                {project.humanStake ? (
                  <p className="simo-work-stake">
                    {project.humanStake.madeVisible}
                  </p>
                ) : null}
                <div className="simo-work-actions">
                  <Link href={`/work/${project.slug}`}>Open case</Link>
                  {project.links.slice(0, 1).map((action) => (
                    <a
                      key={action.href}
                      href={action.href}
                      target={action.external ? "_blank" : undefined}
                      rel={action.external ? "noreferrer" : undefined}
                    >
                      {action.label}
                      <ExternalCue show={action.external} />
                    </a>
                  ))}
                </div>
              </div>
              <WorkMedia media={media} priority={index === 0} />
            </article>
          );
        })}
      </div>

      <div
        className="simo-specimen-strip"
        role="group"
        aria-label="Additional work specimens"
      >
        {supporting.map((project) => (
          <Link
            key={project.slug}
            href={`/work/${project.slug}`}
            className="simo-specimen-link"
          >
            <span>{project.code}</span>
            <strong>{project.title}</strong>
            <em>{project.status}</em>
          </Link>
        ))}
      </div>
    </div>
  );
}

function BlogPanel({
  fieldNotes,
  writingFragments,
}: {
  fieldNotes: FieldNote[];
  writingFragments: WritingFragment[];
}) {
  return (
    <div className="simo-view-panel simo-blog-section" aria-labelledby="blog-title">
      <div className="simo-section-heading">
        <p className="simo-index-kicker">Blog</p>
        <h2 id="blog-title">Short notes from the way Joe thinks.</h2>
        <p>
          Field notes on interfaces, systems, design taste, influences, and
          the habits behind the work.
        </p>
      </div>

      <div className="simo-method-notes" aria-label="Field notes">
        {fieldNotes.map((note) => (
          <article key={note.code} className="simo-method-note">
            <span>{note.code}</span>
            <div>
              <p>{note.source}</p>
              <h3>{note.title}</h3>
              <p>{note.body}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="simo-writing-grid" aria-label="Blog fragments">
        {writingFragments.map((fragment) => (
          <article key={fragment.code} className="simo-writing-card">
            <span>{fragment.code}</span>
            <h3>{fragment.title}</h3>
            <p>{fragment.body}</p>
            <em>{fragment.source}</em>
          </article>
        ))}
      </div>
    </div>
  );
}

export function JoeHomeApp({
  fieldNotes,
  joeProfile,
  profileMedia,
  projects,
  writingFragments,
}: JoeHomeAppProps) {
  const [activeView, setActiveView] = useState<ActiveView>("portfolio");

  useEffect(() => {
    const syncFromHash = () => setActiveView(resolveViewFromHash(window.location.hash));
    const hashSync = window.setTimeout(syncFromHash, 0);

    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener("popstate", syncFromHash);

    return () => {
      window.clearTimeout(hashSync);
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("popstate", syncFromHash);
    };
  }, []);

  function commitView(view: ActiveView) {
    const hash = view === "blog" ? "#blog" : "#work";
    const target = document.getElementById("simo-view-deck");
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    setActiveView(view);
    window.history.pushState(null, "", hash);
    window.dispatchEvent(new Event("hashchange"));
    target?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <div className="simo-index-root">
      <section id="joe" className="simo-index-hero" aria-labelledby="joe-title">
        <div className="site-page-shell simo-index-hero-grid">
          <div className="simo-index-identity">
            <p className="simo-index-kicker">{joeProfile.kicker}</p>
            <h1 id="joe-title">{joeProfile.name}</h1>
            <p className="simo-index-headline">{joeProfile.headline}</p>
            <p className="simo-index-detail">{joeProfile.detail}</p>
            <p className="simo-index-prompt">
              Hold. Trace. Release into Portfolio or Blog.
            </p>
          </div>

          <div
            className="simo-index-object"
            role="group"
            aria-label="Joe Simo primary navigation console"
          >
            <SimoIndexRitual
              activeDestinationId={activeView}
              onDestinationCommit={commitView}
              profileMedia={profileMedia}
            />
          </div>
        </div>
      </section>

      <section
        id="work"
        className="simo-view-deck"
        data-active-view={activeView}
        aria-labelledby="simo-view-title"
      >
        <span id="blog" className="simo-view-anchor" aria-hidden />
        <div className="site-page-shell simo-view-shell">
          <div className="simo-view-topbar">
            <div>
              <p className="simo-index-kicker">Single page</p>
              <h2 id="simo-view-title">Joe Simo index</h2>
            </div>
            <div className="simo-view-control" role="tablist" aria-label="Joe Simo content">
              <button
                type="button"
                role="tab"
                aria-selected={activeView === "portfolio"}
                aria-controls="simo-portfolio-panel"
                onClick={() => commitView("portfolio")}
              >
                Portfolio
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeView === "blog"}
                aria-controls="simo-blog-panel"
                onClick={() => commitView("blog")}
              >
                Blog
              </button>
            </div>
          </div>

          <div className="simo-view-panels">
            <div
              id="simo-portfolio-panel"
              role="tabpanel"
              hidden={activeView !== "portfolio"}
            >
              <WorkPanel projects={projects} />
            </div>
            <div id="simo-blog-panel" role="tabpanel" hidden={activeView !== "blog"}>
              <BlogPanel
                fieldNotes={fieldNotes}
                writingFragments={writingFragments}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
