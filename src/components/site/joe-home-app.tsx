"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

import {
  WebGLSignalField,
  type WebGLSignalNode,
} from "@/components/site/webgl-signal-field";
import type {
  CommunityArtifact,
  FieldNote,
  JoeProfile,
  ProofMedia,
  PublicEvidenceAsset,
  PublicProjectCaseStudy,
  SiteMedia,
  SocialChannel,
  WritingFragment,
} from "@/lib/site-data";

type JoeHomeAppProps = {
  communityArtifacts: CommunityArtifact[];
  fieldNotes: FieldNote[];
  joeProfile: JoeProfile;
  profileMedia: SiteMedia;
  projects: PublicProjectCaseStudy[];
  socialChannels: SocialChannel[];
  writingFragments: WritingFragment[];
};

type MethodStep = {
  body: string;
  code: string;
  id: "support" | "signals" | "surface";
  label: string;
  node: WebGLSignalNode;
  title: string;
};

const methodSteps = [
  {
    id: "support",
    code: "01",
    label: "Support",
    title: "Start where it breaks.",
    body:
      "The brief starts with the path a person can describe when the workflow fails.",
    node: { id: "support", x: 18, y: 58, tension: 0.2, depth: 0.42 },
  },
  {
    id: "signals",
    code: "02",
    label: "Signals",
    title: "Trace the state.",
    body:
      "Routes, timing, handoff, and system state become visible before the interface asks for confidence.",
    node: { id: "signals", x: 50, y: 34, tension: 0.7, depth: 0.68 },
  },
  {
    id: "surface",
    code: "03",
    label: "Surface",
    title: "Make the next action obvious.",
    body:
      "The final surface removes guesswork and keeps consequence close to the control.",
    node: { id: "surface", x: 82, y: 58, tension: 0.55, depth: 0.5 },
  },
] as const satisfies readonly MethodStep[];

const methodNodes = methodSteps.map((step) => step.node);

function ExternalCue({ show }: { show?: boolean }) {
  return show ? <span className="sr-only">opens in a new tab</span> : null;
}

function getEmailHref(socialChannels: readonly SocialChannel[]) {
  return (
    socialChannels.find((channel) => channel.label === "Email")?.href ??
    "mailto:hello@joesimo.com"
  );
}

function getPreferredAssets(project: PublicProjectCaseStudy) {
  const requestedIds = project.homepageFeature?.mediaAssetIds ?? [];
  const requestedAssets = requestedIds
    .map((assetId) => project.assets.find((asset) => asset.id === assetId))
    .filter((asset): asset is PublicEvidenceAsset => Boolean(asset));

  return requestedAssets.length > 0 ? requestedAssets : project.assets.slice(0, 2);
}

function getProofVideo(project: PublicProjectCaseStudy) {
  return project.miniWorld?.media.find((media) => media.kind === "video");
}

function getVideoType(src: string) {
  return src.endsWith(".mp4") ? "video/mp4" : "video/webm";
}

function ProjectProofMedia({
  assets,
  project,
}: {
  assets: readonly PublicEvidenceAsset[];
  project: PublicProjectCaseStudy;
}) {
  const proofVideo = getProofVideo(project);

  if (!proofVideo && assets.length === 0) {
    return (
      <div className="simo-work-media is-empty" aria-hidden>
        <span />
      </div>
    );
  }

  return (
    <div className="simo-work-media-grid">
      {proofVideo ? <ProofVideo media={proofVideo} /> : null}
      {assets.slice(0, proofVideo ? 1 : 2).map((asset) => (
        <figure className="simo-work-media" key={asset.id}>
          <Image
            src={asset.media.src}
            alt={asset.media.alt}
            width={asset.media.width}
            height={asset.media.height}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 46vw, 34vw"
          />
          <figcaption>
            <span>{asset.label}</span>
            <strong>{asset.sourceLabel}</strong>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function ProofVideo({ media }: { media: ProofMedia }) {
  return (
    <figure className="simo-work-media simo-work-media-video">
      <video
        aria-label={media.alt}
        controls
        poster={media.posterSrc}
        preload="metadata"
      >
        <source src={media.src} type={getVideoType(media.src)} />
      </video>
      <figcaption>
        <span>{media.label}</span>
        <strong>{media.sourceLabel}</strong>
      </figcaption>
    </figure>
  );
}

function MethodWorld() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stepButtonRefs = useRef<
    Partial<Record<(typeof methodSteps)[number]["id"], HTMLButtonElement>>
  >({});
  const [sectionActive, setSectionActive] = useState(false);
  const [activeStepId, setActiveStepId] =
    useState<(typeof methodSteps)[number]["id"]>("support");
  const [webglEnabled, setWebglEnabled] = useState(false);

  const activeIndex = methodSteps.findIndex((step) => step.id === activeStepId);
  const activeStep = methodSteps[activeIndex] ?? methodSteps[0];
  const inspectedNodeIds = methodSteps
    .slice(0, activeIndex + 1)
    .map((step) => step.id);

  useEffect(() => {
    const viewportQuery = window.matchMedia("(min-width: 768px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateWebglState = () => {
      setWebglEnabled(viewportQuery.matches && !motionQuery.matches);
    };

    updateWebglState();
    viewportQuery.addEventListener("change", updateWebglState);
    motionQuery.addEventListener("change", updateWebglState);

    return () => {
      viewportQuery.removeEventListener("change", updateWebglState);
      motionQuery.removeEventListener("change", updateWebglState);
    };
  }, []);

  useEffect(() => {
    const sectionElement = sectionRef.current;

    if (!sectionElement) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setSectionActive(entry.isIntersecting && entry.intersectionRatio > 0.16);
      },
      {
        rootMargin: "0px",
        threshold: [0, 0.16, 0.32],
      },
    );

    observer.observe(sectionElement);

    return () => observer.disconnect();
  }, []);

  const shouldRenderWebgl = webglEnabled && sectionActive;

  function focusStep(index: number, moveFocus = false) {
    const nextStep = methodSteps[index];

    if (nextStep) {
      setActiveStepId(nextStep.id);

      if (moveFocus) {
        requestAnimationFrame(() => {
          stepButtonRefs.current[nextStep.id]?.focus();
        });
      }
    }
  }

  function handleStepKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusStep((index + 1) % methodSteps.length, true);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusStep((index - 1 + methodSteps.length) % methodSteps.length, true);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusStep(0, true);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      focusStep(methodSteps.length - 1, true);
    }
  }

  return (
    <section
      id="method"
      ref={sectionRef}
      className="simo-signal-world"
      aria-labelledby="method-title"
    >
      {shouldRenderWebgl ? (
        <WebGLSignalField
          activeNodeId={activeStep.id}
          activeRouteProgress={1}
          caseComplete={activeStep.id === "surface"}
          className="simo-signal-webgl"
          inspectedNodeIds={inspectedNodeIds}
          interactionMode={activeStep.id === "surface" ? "receipt" : "proof"}
          investigationStatus={
            activeStep.id === "support"
              ? "briefing"
              : activeStep.id === "signals"
                ? "tracing"
                : "synthesizing"
          }
          isTracing={activeStep.id === "signals"}
          nodes={methodNodes}
          originNodeId="support"
          sceneMode="method"
        />
      ) : (
        <div className="simo-signal-webgl simo-signal-static-only" aria-hidden>
          <div className="site-webgl-static-field" />
        </div>
      )}

      <div className="site-shell simo-signal-shell">
        <div className="simo-signal-copy">
          <p className="simo-index-kicker">Signal World</p>
          <h2 id="method-title">
            <span>Support</span>
            <span aria-hidden>-&gt;</span>
            <span>Signals</span>
            <span aria-hidden>-&gt;</span>
            <span>Surface</span>
          </h2>
          <p>
            A route through the way Joe turns ambiguous support pressure into an
            interface a person can operate.
          </p>
        </div>

        <div
          className="simo-method-route"
          role="tablist"
          aria-label="Support Signals Surface route"
        >
          {methodSteps.map((step, index) => {
            const active = step.id === activeStep.id;

            return (
              <button
                aria-controls="method-step-panel"
                aria-selected={active}
                className="simo-method-step"
                data-active={active}
                id={`method-step-${step.id}`}
                key={step.id}
                onClick={() => setActiveStepId(step.id)}
                onKeyDown={(event) => handleStepKeyDown(event, index)}
                ref={(element) => {
                  if (element) {
                    stepButtonRefs.current[step.id] = element;
                  } else {
                    delete stepButtonRefs.current[step.id];
                  }
                }}
                role="tab"
                tabIndex={active ? 0 : -1}
                type="button"
              >
                <span>{step.code}</span>
                <strong>{step.label}</strong>
                <em>{step.title}</em>
              </button>
            );
          })}
        </div>

        <article
          aria-labelledby={`method-step-${activeStep.id}`}
          className="simo-method-active"
          id="method-step-panel"
          role="tabpanel"
        >
          <span>{activeStep.code}</span>
          <h3>{activeStep.title}</h3>
          <p>{activeStep.body}</p>
        </article>
      </div>
    </section>
  );
}

function handleHeroAnchorClick(
  event: MouseEvent<HTMLAnchorElement>,
  hash: "#work" | "#blog",
) {
  if (event.defaultPrevented) {
    return;
  }

  const target = document.querySelector<HTMLElement>(hash);

  if (!target) {
    return;
  }

  event.preventDefault();
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  window.history.pushState(null, "", hash);
  target.scrollIntoView({
    block: "start",
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

function WorkSection({ projects }: { projects: readonly PublicProjectCaseStudy[] }) {
  const orderedProjects = useMemo(
    () =>
      [...projects].sort((left, right) => {
        const leftRank = left.homepageFeature?.rank ?? 99;
        const rightRank = right.homepageFeature?.rank ?? 99;

        return leftRank - rightRank || left.title.localeCompare(right.title);
      }),
    [projects],
  );
  const featuredProjects = orderedProjects.slice(0, 4);
  const supportingProjects = orderedProjects.slice(4);

  return (
    <section
      id="work"
      className="simo-story-section simo-work-section"
      aria-labelledby="work-title"
    >
      <div className="site-shell">
        <div className="simo-section-heading">
          <p className="simo-index-kicker">Work</p>
          <h2 id="work-title">Work that proves the method.</h2>
          <p>
            Projects are evidence for how the method behaves in real product
            surfaces. sim0 leads here because it is the clearest current proof.
          </p>
        </div>

        <div className="simo-work-feature-list">
          {featuredProjects.map((project) => {
            const assets = getPreferredAssets(project);
            const primaryAction = project.links[0];
            const panels = project.miniWorld?.panels ?? project.storyboard ?? [];

            return (
              <article
                className="simo-work-feature"
                data-featured={project.homepageFeature?.rank === 1}
                id={`work-${project.slug}`}
                key={project.slug}
              >
                <div className="simo-work-number">
                  <span>{project.code}</span>
                </div>

                <div className="simo-work-copy">
                  <div>
                    <p className="simo-work-tier">
                      {project.role} / {project.status}
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
                    <span>{project.proofMode}</span>
                    <p>{project.proofSummary}</p>
                  </div>

                  <details className="simo-proof-details">
                    <summary>Inside look</summary>
                    <div>
                      {panels.slice(0, 3).map((panel) => (
                        <article key={panel.id}>
                          <span>{panel.label}</span>
                          <strong>{panel.title}</strong>
                          <p>{panel.body}</p>
                        </article>
                      ))}
                    </div>
                  </details>

                  {primaryAction ? (
                    <div className="simo-work-actions">
                      <a
                        href={primaryAction.href}
                        target={primaryAction.external ? "_blank" : undefined}
                        rel={primaryAction.external ? "noreferrer" : undefined}
                        aria-label={primaryAction.ariaLabel}
                      >
                        {primaryAction.label}
                        <ExternalCue show={primaryAction.external} />
                      </a>
                    </div>
                  ) : null}
                </div>

                <ProjectProofMedia assets={assets} project={project} />
              </article>
            );
          })}
        </div>

        {supportingProjects.length > 0 ? (
          <div className="simo-specimen-strip" aria-label="Supporting work">
            {supportingProjects.map((project) => (
              <article className="simo-specimen-card" key={project.slug}>
                <span>{project.code}</span>
                <strong>{project.title}</strong>
                <em>{project.status}</em>
                <p>{project.proofSummary}</p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function PeopleSection({
  communityArtifacts,
}: {
  communityArtifacts: readonly CommunityArtifact[];
}) {
  return (
    <section
      id="people"
      className="simo-story-section simo-people-section"
      aria-labelledby="people-title"
    >
      <div className="site-shell">
        <div className="simo-section-heading simo-community-heading">
          <p className="simo-index-kicker">People</p>
          <h2 id="people-title">People Joe met in the builder room.</h2>
          <p>
            Real photos from the rooms where the work gets sharper: community,
            conferences, and useful conversations around builders.
          </p>
        </div>

        <div className="simo-community-strip">
          {communityArtifacts.map((artifact, index) => (
            <figure
              className="simo-community-frame"
              data-featured={index === 0}
              key={`${artifact.code}-${artifact.media.src}`}
            >
              <div className="simo-community-media">
                <Image
                  src={artifact.media.src}
                  alt={artifact.media.alt}
                  width={artifact.media.width}
                  height={artifact.media.height}
                  sizes={
                    index === 0
                      ? "(max-width: 768px) 100vw, 38vw"
                      : "(max-width: 768px) 100vw, 18vw"
                  }
                />
              </div>
              <figcaption>
                <span>{artifact.code}</span>
                <strong>{artifact.title}</strong>
                <p>{artifact.body}</p>
                <em>{artifact.sourceLabel}</em>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function NotesSection({
  fieldNotes,
  writingFragments,
}: {
  fieldNotes: readonly FieldNote[];
  writingFragments: readonly WritingFragment[];
}) {
  return (
    <section
      id="blog"
      className="simo-story-section simo-notes-section"
      aria-labelledby="notes-title"
    >
      <div className="site-shell">
        <div className="simo-section-heading">
          <p className="simo-index-kicker">Notes</p>
          <h2 id="notes-title">Notes from the method.</h2>
          <p>
            Short records about breakage, signal, interface state, and public
            proof from the work.
          </p>
        </div>

        <div className="simo-notes-grid">
          {fieldNotes.map((note) => (
            <article className="simo-writing-card" key={note.code}>
              <span>{note.code}</span>
              <h3>{note.title}</h3>
              <p>{note.body}</p>
              <em>{note.source}</em>
            </article>
          ))}
          {writingFragments.map((fragment) => (
            <article className="simo-writing-card" key={fragment.code}>
              <span>{fragment.code}</span>
              <h3>{fragment.title}</h3>
              <p>{fragment.body}</p>
              <em>{fragment.source}</em>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection({
  socialChannels,
}: {
  socialChannels: readonly SocialChannel[];
}) {
  const emailHref = getEmailHref(socialChannels);
  const publicChannels = socialChannels.filter((channel) =>
    channel.href.startsWith("http"),
  );

  return (
    <section
      id="contact"
      className="simo-story-section simo-contact-section"
      aria-labelledby="contact-title"
    >
      <div className="site-shell simo-contact-grid">
        <div>
          <p className="simo-index-kicker">Contact</p>
          <h2 id="contact-title">Bring the stuck workflow.</h2>
          <p>
            Useful email is best for support systems, interface work, product
            surfaces, consulting, or a direct introduction.
          </p>
        </div>

        <div className="simo-contact-actions">
          <a className="simo-primary-link" href={emailHref}>
            Email Joe
          </a>
          <div className="simo-social-row">
            {publicChannels.map((channel) => (
              <a
                href={channel.href}
                key={channel.label}
                target="_blank"
                rel="noreferrer"
              >
                {channel.label}
                <ExternalCue show />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function JoeHomeApp({
  communityArtifacts,
  fieldNotes,
  joeProfile,
  profileMedia,
  projects,
  socialChannels,
  writingFragments,
}: JoeHomeAppProps) {
  const emailHref = getEmailHref(socialChannels);

  return (
    <div className="simo-index-root">
      <section
        id="joe"
        className="simo-index-hero"
        aria-labelledby="joe-title"
      >
        <div className="site-shell simo-index-hero-grid">
          <div className="simo-index-identity">
            <p className="simo-index-kicker">{joeProfile.kicker}</p>
            <h1 id="joe-title">Joe Simo</h1>
            <p className="simo-index-headline">{joeProfile.headline}</p>
            <p className="simo-index-detail">{joeProfile.detail}</p>

            <div className="simo-hero-actions" aria-label="Primary actions">
              <a
                className="simo-primary-link"
                href="#work"
                onClick={(event) => handleHeroAnchorClick(event, "#work")}
              >
                View Work
              </a>
              <a
                className="simo-secondary-link"
                href="#blog"
                onClick={(event) => handleHeroAnchorClick(event, "#blog")}
              >
                Read Notes
              </a>
              <a className="simo-secondary-link" href={emailHref}>
                Email Joe
              </a>
            </div>
          </div>

          <figure className="simo-index-portrait">
            <Image
              priority
              src={profileMedia.src}
              alt={profileMedia.alt}
              width={profileMedia.width}
              height={profileMedia.height}
              sizes="(max-width: 768px) 100vw, 28rem"
            />
            <figcaption>
              <span>Personal site</span>
              <strong>Support -&gt; Signals -&gt; Surface</strong>
            </figcaption>
          </figure>
        </div>
      </section>

      <MethodWorld />
      <WorkSection projects={projects} />
      <PeopleSection communityArtifacts={communityArtifacts} />
      <NotesSection fieldNotes={fieldNotes} writingFragments={writingFragments} />
      <ContactSection socialChannels={socialChannels} />
    </div>
  );
}
