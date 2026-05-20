import Image from "next/image";

import { HashFocus } from "@/components/site/hash-focus";
import { MethodWorld } from "@/components/site/method-world";
import { SiteSectionRail } from "@/components/site/site-section-rail";
import type {
  CommunityArtifact,
  FieldNote,
  JoeProfile,
  ProofMedia,
  ProjectStoryboardPanel,
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

type FeaturedProjectTreatment = NonNullable<
  PublicProjectCaseStudy["homepageFeature"]
>["treatment"];

type MediaFit = "contain" | "cover" | "phone";

function ExternalCue({ show }: { show?: boolean }) {
  return show ? <span className="sr-only">opens in a new tab</span> : null;
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

function getAssetFit(
  asset: PublicEvidenceAsset,
  treatment: FeaturedProjectTreatment,
): MediaFit {
  if (
    treatment === "mobile-strip" ||
    asset.media.height > asset.media.width * 1.25
  ) {
    return "phone";
  }

  return "contain";
}

function ProjectProofMedia({
  assets,
  eager,
  project,
  treatment,
}: {
  assets: readonly PublicEvidenceAsset[];
  eager?: boolean;
  project: PublicProjectCaseStudy;
  treatment: FeaturedProjectTreatment;
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
    <div className="simo-work-media-grid" data-treatment={treatment}>
      {assets.map((asset, index) => {
        const priority = Boolean(eager && index === 0);
        const fit = getAssetFit(asset, treatment);

        return (
          <figure
            className="simo-work-media"
            data-media-fit={fit}
            data-media-kind="image"
            data-media-treatment={treatment}
            key={asset.id}
          >
            <Image
              src={asset.media.src}
              alt={asset.media.alt}
              width={asset.media.width}
              height={asset.media.height}
              priority={priority}
              loading={priority ? undefined : "lazy"}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 46vw, 34vw"
            />
            <figcaption>
              <span>{asset.label}</span>
              <strong>{asset.sourceLabel}</strong>
            </figcaption>
          </figure>
        );
      })}
      {proofVideo ? (
        <ProofVideo media={proofVideo} treatment={treatment} />
      ) : null}
    </div>
  );
}

function ProofVideo({
  media,
  treatment,
}: {
  media: ProofMedia;
  treatment: FeaturedProjectTreatment;
}) {
  return (
    <figure
      className="simo-work-media simo-work-media-video"
      data-media-fit="contain"
      data-media-kind="video"
      data-media-treatment={treatment}
    >
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

function ProjectProofRail({
  panels,
  project,
}: {
  panels: readonly ProjectStoryboardPanel[];
  project: PublicProjectCaseStudy;
}) {
  if (panels.length === 0) {
    return null;
  }

  return (
    <div
      className="simo-proof-rail"
      aria-label={`${project.title} proof path`}
    >
      {panels.slice(0, 3).map((panel, index) => (
        <article key={panel.id}>
          <span>{String(index + 1).padStart(2, "0")} / {panel.label}</span>
          <strong>{panel.title}</strong>
          <p>{panel.body}</p>
        </article>
      ))}
    </div>
  );
}

function WorkSection({ projects }: { projects: readonly PublicProjectCaseStudy[] }) {
  const orderedProjects = [...projects].sort((left, right) => {
    const leftRank = left.homepageFeature?.rank ?? 99;
    const rightRank = right.homepageFeature?.rank ?? 99;

    return leftRank - rightRank || left.title.localeCompare(right.title);
  });
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
          <h2 id="work-title" tabIndex={-1}>
            Work that proves the method.
          </h2>
          <p>
            Projects are evidence for how the method behaves in real product
            surfaces. The first cases stay visible, addressable, and grounded
            in owned media.
          </p>
        </div>

        <div className="simo-work-cases">
          <nav className="simo-work-index" aria-label="Work case index">
            {featuredProjects.map((project) => (
              <a href={`#work-${project.slug}`} key={project.slug}>
                <span>{project.code}</span>
                <strong>{project.title}</strong>
                <em>{project.proofMode}</em>
              </a>
            ))}
          </nav>

          <div className="simo-work-feature-list">
            {featuredProjects.map((project, index) => {
              const assets = getPreferredAssets(project);
              const primaryAction = project.links[0];
              const panels = project.miniWorld?.panels ?? project.storyboard ?? [];
              const treatment =
                project.homepageFeature?.treatment ?? "operated-surface";

              return (
                <article
                  className="simo-work-feature"
                  data-featured={project.homepageFeature?.rank === 1}
                  data-treatment={treatment}
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
                    <dl
                      className="simo-work-meta"
                      aria-label={`${project.title} metadata`}
                    >
                      <div>
                        <dt>Mode</dt>
                        <dd>{project.proofMode}</dd>
                      </div>
                      <div>
                        <dt>Stage</dt>
                        <dd>{project.methodStage}</dd>
                      </div>
                      <div>
                        <dt>Status</dt>
                        <dd>{project.status}</dd>
                      </div>
                    </dl>
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

                    <ProjectProofRail panels={panels} project={project} />

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

                  <ProjectProofMedia
                    assets={assets}
                    eager={index === 0}
                    project={project}
                    treatment={treatment}
                  />
                </article>
              );
            })}
          </div>
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
          <h2 id="people-title" tabIndex={-1}>
            Builder rooms, not badges.
          </h2>
          <p>
            Real frames from the rooms where the work gets sharper: community,
            conferences, and useful conversations around builders.
          </p>
        </div>

        <div className="simo-community-strip">
          {communityArtifacts.map((artifact, index) => (
            <figure
              className="simo-community-frame"
              data-featured={index === 0}
              data-highlighted={artifact.title === "ThePrimeagen"}
              key={`${artifact.code}-${artifact.media.src}`}
            >
              <div className="simo-community-media">
                <Image
                  src={artifact.media.src}
                  alt={artifact.media.alt}
                  width={artifact.media.width}
                  height={artifact.media.height}
                  priority={index === 0}
                  loading={index === 0 ? undefined : "lazy"}
                  sizes={
                    index === 0
                      ? "(max-width: 768px) 100vw, 50vw"
                      : "(max-width: 768px) 100vw, 24vw"
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
          <h2 id="notes-title" tabIndex={-1}>
            Notes from the method.
          </h2>
          <p>
            Compact records about breakage, signal, interface state, and public
            proof.
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
  const publicChannels = socialChannels.filter((channel) =>
    channel.href.startsWith("http"),
  );
  const primaryChannel =
    publicChannels.find((channel) => channel.label === "LinkedIn") ??
    publicChannels[0];
  const secondaryChannels = publicChannels.filter(
    (channel) => channel !== primaryChannel,
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
          <h2 id="contact-title" tabIndex={-1}>
            Bring the stuck workflow.
          </h2>
          <p>
            Public profiles are the route for introductions, product context,
            consulting, and follow-up.
          </p>
        </div>

        <div className="simo-contact-actions">
          {primaryChannel ? (
            <a
              className="simo-primary-link"
              href={primaryChannel.href}
              target="_blank"
              rel="noreferrer"
            >
              {primaryChannel.label}
              <ExternalCue show />
            </a>
          ) : null}
          <div className="simo-social-row">
            {secondaryChannels.map((channel) => (
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

        <dl className="simo-contact-meta" aria-label="Contact context">
          <div>
            <dt>Base</dt>
            <dd>Fort Myers</dd>
          </div>
          <div>
            <dt>Route</dt>
            <dd>Public profiles</dd>
          </div>
          <div>
            <dt>Method</dt>
            <dd>Support → Signals → Surface</dd>
          </div>
        </dl>
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
  return (
    <div className="simo-index-root">
      <HashFocus />
      <SiteSectionRail />
      <section
        id="joe"
        className="simo-index-hero"
        aria-labelledby="joe-title"
      >
        <div className="site-shell simo-index-hero-grid">
          <div className="simo-index-identity">
            <p className="simo-index-kicker">{joeProfile.kicker}</p>
            <h1 id="joe-title" tabIndex={-1}>
              Joe Simo
            </h1>
            <p className="simo-index-headline">{joeProfile.headline}</p>
            <p className="simo-index-detail">{joeProfile.detail}</p>

            <div className="simo-hero-actions" aria-label="Primary actions">
              <a className="simo-primary-link" href="#method">
                Trace Method
              </a>
              <a className="simo-secondary-link" href="#work">
                View Work
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
              <span>Portrait</span>
              <strong>Fort Myers / interface systems</strong>
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
