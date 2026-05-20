"use client";

import Image from "next/image";
import { type KeyboardEvent, useEffect, useState } from "react";

import { SimoIndexRitual } from "@/components/site/simo-index-ritual";
import type {
  CommunityArtifact,
  FieldNote,
  JoeProfile,
  PublicProjectCaseStudy,
  SiteMedia,
  WritingFragment,
} from "@/lib/site-data";

type ActiveView = "portfolio" | "blog";

type JoeHomeAppProps = {
  communityArtifacts: CommunityArtifact[];
  fieldNotes: FieldNote[];
  joeProfile: JoeProfile;
  profileMedia: SiteMedia;
  projects: PublicProjectCaseStudy[];
  writingFragments: WritingFragment[];
};

const heroSignals = [
  {
    code: "01",
    label: "Support",
    value: "Broken paths made visible",
  },
  {
    code: "02",
    label: "Systems",
    value: "Signals turned into surfaces",
  },
  {
    code: "03",
    label: "Design",
    value: "What remains is operable",
  },
] as const;

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

function workProjectId(project: Pick<PublicProjectCaseStudy, "slug">) {
  return `work-${project.slug}`;
}

function scrollViewDeckIntoView(target: HTMLElement, behavior: ScrollBehavior) {
  const headerOffset =
    document.querySelector<HTMLElement>("header")?.getBoundingClientRect().height ?? 64;
  const targetTop =
    target.getBoundingClientRect().top + window.scrollY - headerOffset - 12;

  window.scrollTo({
    behavior,
    top: Math.max(0, targetTop),
  });
}

function WorkMedia({
  media,
}: {
  media?: SiteMedia;
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
              id={workProjectId(project)}
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
                <div className="simo-work-proofline">
                  <span>{project.status}</span>
                  <p>{project.proofSummary}</p>
                </div>
                {project.links.length > 0 ? (
                  <div className="simo-work-actions">
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
                ) : null}
              </div>
              <WorkMedia media={media} />
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
          <article
            id={workProjectId(project)}
            key={project.slug}
            className="simo-specimen-card"
          >
            <span>{project.code}</span>
            <strong>{project.title}</strong>
            <em>{project.status}</em>
            <p>{project.proofSummary}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function CommunityPanel({
  artifacts,
}: {
  artifacts: CommunityArtifact[];
}) {
  const visibleArtifacts = artifacts.slice(0, 6);

  if (visibleArtifacts.length === 0) {
    return null;
  }

  return (
    <section
      className="simo-community-panel"
      aria-labelledby="community-title"
    >
      <div className="simo-section-heading simo-community-heading">
        <p className="simo-index-kicker">People</p>
        <h2 id="community-title">People Joe met in the builder room.</h2>
        <p>
          A small React Miami photo layer: real meetings, real rooms, and the
          people around the work without turning the portfolio into a social
          feed.
        </p>
      </div>

      <div
        className="simo-community-strip"
        role="list"
        aria-label="React Miami people Joe met"
      >
        {visibleArtifacts.map((artifact, index) => (
          <figure
            key={artifact.code}
            className="simo-community-frame"
            data-featured={index === 0 ? "true" : "false"}
            role="listitem"
          >
            <div className="simo-community-media">
              <Image
                src={artifact.media.src}
                alt={artifact.media.alt}
                width={artifact.media.width}
                height={artifact.media.height}
                sizes={
                  index === 0
                    ? "(min-width: 1024px) 24vw, 92vw"
                    : "(min-width: 1024px) 13vw, 46vw"
                }
              />
            </div>
            <figcaption>
              <span>{artifact.code} / {artifact.sourceLabel}</span>
              <strong>{artifact.title}</strong>
              <p>{artifact.body}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
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
  communityArtifacts,
  fieldNotes,
  joeProfile,
  profileMedia,
  projects,
  writingFragments,
}: JoeHomeAppProps) {
  const [activeView, setActiveView] = useState<ActiveView>("portfolio");
  const activeViewLabel = activeView === "blog" ? "Blog" : "Portfolio";

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

  function commitView(view: ActiveView, options: { scroll?: boolean } = {}) {
    const hash = view === "blog" ? "#blog" : "#work";
    const target = document.getElementById("work");
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const shouldScroll = options.scroll ?? true;

    setActiveView(view);
    if (window.location.hash !== hash) {
      window.history.pushState(null, "", hash);
    } else {
      window.history.replaceState(null, "", hash);
    }
    window.dispatchEvent(new Event("hashchange"));

    if (shouldScroll) {
      window.requestAnimationFrame(() => {
        if (target) {
          scrollViewDeckIntoView(target, prefersReducedMotion ? "auto" : "smooth");
        }
      });
    }
  }

  function handleViewControlKey(event: KeyboardEvent<HTMLDivElement>) {
    if (
      event.key !== "ArrowLeft" &&
      event.key !== "ArrowRight" &&
      event.key !== "Home" &&
      event.key !== "End"
    ) {
      return;
    }

    event.preventDefault();
    const nextView =
      event.key === "ArrowLeft" || event.key === "Home" ? "portfolio" : "blog";
    const control = event.currentTarget;

    commitView(nextView, { scroll: false });
    window.requestAnimationFrame(() => {
      control
        .querySelector<HTMLButtonElement>(`[data-view-tab="${nextView}"]`)
        ?.focus();
    });
  }

  return (
    <div className="simo-index-root">
      <section id="joe" className="simo-index-hero" aria-labelledby="joe-title">
        <div className="simo-index-atmosphere" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <div className="site-page-shell simo-index-hero-grid">
          <div className="simo-index-identity">
            <p className="simo-index-kicker">{joeProfile.kicker}</p>
            <h1 id="joe-title">{joeProfile.name}</h1>
            <p className="simo-index-headline">{joeProfile.headline}</p>
            <p className="simo-index-detail">{joeProfile.detail}</p>
            <div
              className="simo-index-signal-rail"
              aria-label="Joe Simo operating signals"
            >
              {heroSignals.map((signal) => (
                <div key={signal.code}>
                  <span>{signal.code}</span>
                  <strong>{signal.label}</strong>
                  <em>{signal.value}</em>
                </div>
              ))}
            </div>
            <figure className="simo-index-portrait">
              <Image
                src={profileMedia.src}
                alt={profileMedia.alt}
                width={profileMedia.width}
                height={profileMedia.height}
                preload
                sizes="(min-width: 1024px) 11rem, 7.5rem"
              />
              <figcaption>
                <span>Personal artifact</span>
                <strong>Joe Simo</strong>
              </figcaption>
            </figure>
          </div>

          <div
            className="simo-index-object"
            role="group"
            aria-label="Joe Simo primary navigation console"
          >
            <SimoIndexRitual
              activeDestinationId={activeView}
              onDestinationCommit={commitView}
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
              <p className="simo-view-status" aria-live="polite">
                Showing {activeViewLabel}
              </p>
            </div>
            <div
              className="simo-view-control"
              role="tablist"
              aria-label="Joe Simo content"
              onKeyDown={handleViewControlKey}
            >
              <button
                id="simo-portfolio-tab"
                type="button"
                data-view-tab="portfolio"
                role="tab"
                aria-selected={activeView === "portfolio"}
                aria-controls="simo-portfolio-panel"
                tabIndex={activeView === "portfolio" ? 0 : -1}
                onClick={() => commitView("portfolio")}
              >
                Portfolio
              </button>
              <button
                id="simo-blog-tab"
                type="button"
                data-view-tab="blog"
                role="tab"
                aria-selected={activeView === "blog"}
                aria-controls="simo-blog-panel"
                tabIndex={activeView === "blog" ? 0 : -1}
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
              aria-labelledby="simo-portfolio-tab"
              hidden={activeView !== "portfolio"}
            >
          <WorkPanel projects={projects} />
          <CommunityPanel artifacts={communityArtifacts} />
        </div>
            <div
              id="simo-blog-panel"
              role="tabpanel"
              aria-labelledby="simo-blog-tab"
              hidden={activeView !== "blog"}
            >
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
