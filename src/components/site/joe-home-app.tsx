import Image from "next/image";

import { HashFocus } from "@/components/site/hash-focus";
import {
  PublicTrailRuntime,
  type PublicTrailNote,
} from "@/components/site/public-trail-runtime";
import { SiteIcon } from "@/components/site/site-icons";
import {
  publicTrailSections,
  type CommunityArtifact,
  type FieldNote,
  type JoeProfile,
  type PublicEvidenceAsset,
  type PublicProjectCaseStudy,
  type PublicTrailSection,
  type SocialChannel,
  type WritingFragment,
} from "@/lib/site-data";

type JoeHomeAppProps = {
  communityArtifacts: CommunityArtifact[];
  fieldNotes: FieldNote[];
  joeProfile: JoeProfile;
  projects: PublicProjectCaseStudy[];
  socialChannels: SocialChannel[];
  writingFragments: WritingFragment[];
};

function ExternalCue({ show }: { show?: boolean }) {
  return show ? <span className="sr-only">opens in a new tab</span> : null;
}

function isImageAsset(asset: PublicEvidenceAsset | undefined) {
  return Boolean(asset && !asset.media.src.endsWith(".webm"));
}

function orderedProjects(projects: readonly PublicProjectCaseStudy[]) {
  return [...projects].sort((left, right) => {
    const leftRank = left.homepageFeature?.rank ?? 99;
    const rightRank = right.homepageFeature?.rank ?? 99;

    return leftRank - rightRank || left.title.localeCompare(right.title);
  });
}

function getPreferredImageAsset(project: PublicProjectCaseStudy) {
  const requestedIds = project.homepageFeature?.mediaAssetIds ?? [];
  const requestedAssets = requestedIds
    .map((assetId) => project.assets.find((asset) => asset.id === assetId))
    .filter((asset): asset is PublicEvidenceAsset => isImageAsset(asset));

  return (
    requestedAssets[0] ??
    project.assets.find((asset) => isImageAsset(asset))
  );
}

function combineNotes(
  fieldNotes: readonly FieldNote[],
  writingFragments: readonly WritingFragment[],
): PublicTrailNote[] {
  return [
    ...fieldNotes.map((note) => ({
      body: note.body,
      code: note.code,
      source: note.source,
      title: note.title,
    })),
    ...writingFragments.map((fragment) => ({
      body: fragment.body,
      code: fragment.code,
      source: fragment.source,
      title: fragment.title,
    })),
  ];
}

function trailSection(id: PublicTrailSection["id"]) {
  const section = publicTrailSections.find((item) => item.id === id);

  if (!section) {
    throw new Error(`Missing public trail section: ${id}`);
  }

  return section;
}

function SectionMarker({ section }: { section: PublicTrailSection }) {
  return (
    <p className="simo-trail-marker">
      {section.code} / {section.label}
    </p>
  );
}

function HeroSection({
  joeProfile,
  moments,
  projects,
}: {
  joeProfile: JoeProfile;
  moments: readonly CommunityArtifact[];
  projects: readonly PublicProjectCaseStudy[];
}) {
  const section = trailSection("joe");
  const heroProject = projects[0];
  const heroAsset = heroProject ? getPreferredImageAsset(heroProject) : undefined;
  const heroMoment = moments[1] ?? moments[0];

  return (
    <section
      aria-labelledby="joe-title"
      className="simo-trail-hero"
      data-trail-section="joe"
      id="joe"
    >
      <div className="site-shell simo-trail-hero-shell">
        <div className="simo-trail-hero-copy">
          <SectionMarker section={section} />
          <h1 data-trail-reveal id="joe-title" tabIndex={-1}>
            Joe Simo
          </h1>
          <p className="simo-trail-hero-line" data-trail-reveal>
            {joeProfile.headline}
          </p>
          <p className="simo-trail-hero-detail" data-trail-reveal>
            {joeProfile.detail}
          </p>
          <nav
            aria-label="Homepage sections"
            className="simo-trail-hero-links"
            data-trail-reveal
          >
            <a data-magnetic href="#work">Work</a>
            <a data-magnetic href="#photos">Moments</a>
            <a data-magnetic href="#blog">Notes</a>
            <a data-magnetic href="#social">Internet</a>
          </nav>
        </div>

        <div
          aria-label="Public trail preview"
          className="simo-trail-orbit-board"
          data-trail-reveal
        >
          <div className="simo-trail-orbit-core">
            <span />
            <strong>Public trail</strong>
          </div>
          {heroAsset && heroProject ? (
            <a
              className="simo-trail-orbit-card simo-trail-orbit-card-work"
              data-magnetic
              href={`#work-${heroProject.slug}`}
            >
              <Image
                alt={heroAsset.media.alt}
                fetchPriority="high"
                height={heroAsset.media.height}
                loading="eager"
                sizes="(max-width: 900px) 68vw, 28vw"
                src={heroAsset.media.src}
                width={heroAsset.media.width}
              />
              <span>{heroProject.title}</span>
            </a>
          ) : null}
          {heroMoment ? (
            <a
              aria-label={`Moments: ${heroMoment.title}`}
              className="simo-trail-orbit-card simo-trail-orbit-card-moment"
              data-magnetic
              href="#photos"
            >
              <Image
                alt={heroMoment.media.alt}
                height={heroMoment.media.height}
                loading="eager"
                sizes="(max-width: 900px) 52vw, 17vw"
                src={heroMoment.media.src}
                width={heroMoment.media.width}
              />
              <span>{heroMoment.title}</span>
            </a>
          ) : null}
          <div className="simo-trail-orbit-readout">
            <span>{joeProfile.routeLabel}</span>
            <strong>Scroll to travel the trail.</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkSection({
  projects,
}: {
  projects: readonly PublicProjectCaseStudy[];
}) {
  const section = trailSection("work");

  return (
    <section
      aria-labelledby="work-title"
      className="simo-trail-section simo-trail-work-section"
      data-trail-section="work"
      id="work"
    >
      <div aria-hidden="true" className="simo-trail-work-veil" />
      <div className="site-shell simo-trail-section-shell">
        <div className="simo-trail-section-head" data-trail-work-pin>
          <SectionMarker section={section} />
          <h2 data-trail-reveal id="work-title" tabIndex={-1}>
            Work
          </h2>
          <p data-trail-reveal>{section.copy.detail}</p>
        </div>

        <div className="simo-trail-work-grid">
          {projects.map((project, index) => {
            const asset = getPreferredImageAsset(project);
            const featured = index === 0;

            return (
              <article
                className="simo-trail-work-card"
                data-artifact={project.code}
                data-featured={featured}
                data-trail-reveal
                id={`work-${project.slug}`}
                key={project.slug}
              >
                <WorkMedia asset={asset} featured={featured} project={project} />
                <div
                  className="simo-trail-work-copy"
                  data-project-open-area={project.slug}
                >
                  <span>{project.code} / {project.proofMode}</span>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                  <dl>
                    <div>
                      <dt>Role</dt>
                      <dd>{project.role}</dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>{project.status}</dd>
                    </div>
                    <div>
                      <dt>Proof</dt>
                      <dd>{project.proofSummary}</dd>
                    </div>
                  </dl>
                  <button
                    className="simo-trail-open-button"
                    data-magnetic
                    data-project-open={project.slug}
                    type="button"
                  >
                    Open artifact
                    <SiteIcon aria-hidden iconKey="arrowUpRight" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WorkMedia({
  asset,
  featured,
  project,
}: {
  asset: PublicEvidenceAsset | undefined;
  featured: boolean;
  project: PublicProjectCaseStudy;
}) {
  const proofImages =
    project.miniWorld?.media.filter((media) => media.kind === "image") ?? [];
  const primaryProof =
    proofImages.find((media) => media.id === "sim0-machine-ship") ??
    proofImages.find((media) => media.id === "sim0-machine-surface");
  const secondaryProof =
    proofImages.find((media) => media.id === "sim0-machine-trace") ??
    proofImages.find((media) => media.id === "sim0-machine-find");
  const showSim0Composition = featured && project.slug === "sim0" && asset;

  return (
    <figure
      className="simo-trail-work-media simo-os-media"
      data-treatment={project.homepageFeature?.treatment}
    >
      {showSim0Composition ? (
        <div className="simo-trail-sim0-composition">
          <Image
            alt={asset.media.alt}
            className="simo-trail-sim0-primary"
            height={asset.media.height}
            sizes="(max-width: 900px) 100vw, 48vw"
            src={asset.media.src}
            width={asset.media.width}
          />
          {secondaryProof ? (
            <Image
              alt={secondaryProof.alt}
              className="simo-trail-sim0-inset"
              height={secondaryProof.height}
              sizes="(max-width: 900px) 44vw, 18vw"
              src={secondaryProof.src}
              width={secondaryProof.width}
            />
          ) : null}
          {primaryProof ? (
            <Image
              alt={primaryProof.alt}
              className="simo-trail-sim0-ghost"
              height={primaryProof.height}
              sizes="(max-width: 900px) 42vw, 16vw"
              src={primaryProof.src}
              width={primaryProof.width}
            />
          ) : null}
          <ol aria-label="sim0 proof route">
            <li>import</li>
            <li>inspect</li>
            <li>export</li>
          </ol>
          <div className="simo-trail-sim0-route">
            <span>real repo</span>
            <span>visual route</span>
            <span>ship state</span>
          </div>
          <div className="simo-trail-sim0-map" aria-hidden="true">
            <span>preview</span>
            <span>runtime</span>
            <span>changes</span>
          </div>
        </div>
      ) : asset ? (
        <Image
          alt={asset.media.alt}
          height={asset.media.height}
          loading={featured ? "eager" : "lazy"}
          sizes={
            featured
              ? "(max-width: 900px) 100vw, 48vw"
              : "(max-width: 900px) 100vw, 30vw"
          }
          src={asset.media.src}
          width={asset.media.width}
        />
      ) : (
        <span aria-hidden />
      )}
    </figure>
  );
}

function MomentsSection({
  moments,
}: {
  moments: readonly CommunityArtifact[];
}) {
  const section = trailSection("photos");
  const visibleMoments = moments.slice(0, 10);

  return (
    <section
      aria-labelledby="photos-title"
      className="simo-trail-section simo-trail-moments-section"
      data-trail-section="photos"
      id="photos"
    >
      <div className="site-shell">
        <div className="simo-trail-section-head simo-trail-wide-head">
          <SectionMarker section={section} />
          <h2 data-trail-reveal id="photos-title" tabIndex={-1}>
            Moments
          </h2>
          <p data-trail-reveal>{section.copy.detail}</p>
        </div>
      </div>

      <div
        aria-label="Scrollable trail moments"
        className="simo-trail-moment-rail"
        data-trail-reveal
        tabIndex={0}
      >
        {visibleMoments.map((moment, index) => (
          <figure
            className="simo-trail-moment"
            data-active={index === 1}
            data-code={moment.code}
            data-depth={index % 3}
            key={`${moment.code}-${moment.media.src}`}
          >
            <Image
              alt={moment.media.alt}
              height={moment.media.height}
              loading={index < 4 ? "eager" : "lazy"}
              sizes="(max-width: 760px) 72vw, 28vw"
              src={moment.media.src}
              width={moment.media.width}
            />
            <figcaption>
              <span>{moment.code}</span>
              <strong>{moment.title}</strong>
              <em>{moment.sourceLabel}</em>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function NotesSection({ notes }: { notes: readonly PublicTrailNote[] }) {
  const section = trailSection("blog");

  return (
    <section
      aria-labelledby="blog-title"
      className="simo-trail-section simo-trail-notes-section"
      data-trail-section="blog"
      id="blog"
    >
      <div className="site-shell simo-trail-section-shell">
        <div className="simo-trail-section-head">
          <SectionMarker section={section} />
          <h2 data-trail-reveal id="blog-title" tabIndex={-1}>
            Notes
          </h2>
          <p data-trail-reveal>{section.copy.detail}</p>
        </div>

        <div className="simo-trail-note-wall" data-trail-reveal>
          {notes.map((note) => (
            <button
              className="simo-trail-note-row"
              data-magnetic
              data-note-open={note.code}
              key={note.code}
              type="button"
            >
              <span>{note.code}</span>
              <strong>{note.title}</strong>
              <em>{note.source}</em>
              <p>{note.body}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function InternetSection({
  socialChannels,
}: {
  socialChannels: readonly SocialChannel[];
}) {
  const section = trailSection("social");
  const publicChannels = socialChannels.filter((channel) =>
    channel.href.startsWith("http"),
  );

  return (
    <section
      aria-labelledby="social-title"
      className="simo-trail-section simo-trail-internet-section"
      data-trail-section="social"
      id="social"
    >
      <div className="site-shell simo-trail-section-shell">
        <div className="simo-trail-section-head">
          <SectionMarker section={section} />
          <h2 data-trail-reveal id="social-title" tabIndex={-1}>
            Internet
          </h2>
          <p data-trail-reveal>{section.copy.detail}</p>
        </div>

        <div className="simo-trail-social-constellation">
          {publicChannels.map((channel, index) => (
            <a
              data-magnetic
              data-node-index={`N${String(index + 1).padStart(2, "0")}`}
              href={channel.href}
              key={channel.label}
              rel="noreferrer"
              target="_blank"
            >
              <SiteIcon aria-hidden iconKey={channel.iconKey} />
              <strong>{channel.label}</strong>
              <span>{channel.description}</span>
              <em>{channel.handle}</em>
              <SiteIcon aria-hidden iconKey="arrowUpRight" />
              <ExternalCue show />
            </a>
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
  const section = trailSection("contact");
  const linkedin =
    socialChannels.find((channel) => channel.label === "LinkedIn") ??
    socialChannels.find((channel) => channel.href.startsWith("http"));
  const github = socialChannels.find((channel) => channel.label === "GitHub");

  return (
    <section
      aria-labelledby="contact-title"
      className="simo-trail-section simo-trail-contact-section"
      data-trail-section="contact"
      id="contact"
    >
      <div className="site-shell simo-trail-contact-shell">
        <div>
          <SectionMarker section={section} />
          <h2 data-trail-reveal id="contact-title" tabIndex={-1}>
            Say hi through the public trail.
          </h2>
          <p data-trail-reveal>{section.copy.detail}</p>
        </div>
        <div className="simo-trail-contact-actions" data-trail-reveal>
          {linkedin ? (
            <a data-magnetic href={linkedin.href} rel="noreferrer" target="_blank">
              LinkedIn
              <SiteIcon aria-hidden iconKey="arrowUpRight" />
              <ExternalCue show />
            </a>
          ) : null}
          {github ? (
            <a data-magnetic href={github.href} rel="noreferrer" target="_blank">
              GitHub
              <SiteIcon aria-hidden iconKey="arrowUpRight" />
              <ExternalCue show />
            </a>
          ) : null}
        </div>
        <div aria-hidden="true" className="simo-trail-contact-signal">
          {socialChannels.slice(0, 5).map((channel) => (
            <span data-channel={channel.label.toLowerCase()} key={channel.label} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function JoeHomeApp({
  communityArtifacts,
  fieldNotes,
  joeProfile,
  projects,
  socialChannels,
  writingFragments,
}: JoeHomeAppProps) {
  const notes = combineNotes(fieldNotes, writingFragments);
  const ordered = orderedProjects(projects);
  const featuredProjects = ordered.slice(0, 4);

  return (
    <div className="simo-trail-root">
      <HashFocus />
      <PublicTrailRuntime
        notes={notes}
        projects={featuredProjects}
        sections={publicTrailSections}
        socialChannels={socialChannels}
      />
      <HeroSection
        joeProfile={joeProfile}
        moments={communityArtifacts}
        projects={featuredProjects}
      />
      <WorkSection projects={featuredProjects} />
      <MomentsSection moments={communityArtifacts} />
      <NotesSection notes={notes} />
      <InternetSection socialChannels={socialChannels} />
      <ContactSection socialChannels={socialChannels} />
    </div>
  );
}
