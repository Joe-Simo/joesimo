import Image from "next/image";

import { HashFocus } from "@/components/site/hash-focus";
import { PublicTrailRuntime } from "@/components/site/public-trail-runtime";
import { SiteIcon } from "@/components/site/site-icons";
import {
  credentialGroups,
  educationRecords,
  publicTrailSections,
  type CommunityArtifact,
  type CredentialGroup,
  type JoeProfile,
  type LearningCredential,
  type ProudRole,
  type PublicEvidenceAsset,
  type PublicProjectCaseStudy,
  type PublicTrailSection,
  type SocialChannel,
} from "@/lib/site-data";

type JoeHomeAppProps = {
  communityArtifacts: CommunityArtifact[];
  joeProfile: JoeProfile;
  learningCredentials: LearningCredential[];
  projects: PublicProjectCaseStudy[];
  proudRoles: ProudRole[];
  socialChannels: SocialChannel[];
};

function ExternalCue({ show }: { show?: boolean }) {
  return show ? <span className="sr-only">opens in a new tab</span> : null;
}

function isImageAsset(asset: PublicEvidenceAsset | undefined) {
  return Boolean(asset && !asset.media.src.endsWith(".webm"));
}

function getPreferredImageAsset(project: PublicProjectCaseStudy) {
  const requestedIds = project.homepageFeature?.mediaAssetIds ?? [];
  const requestedAssets = requestedIds
    .map((assetId) => project.assets.find((asset) => asset.id === assetId))
    .filter((asset): asset is PublicEvidenceAsset => isImageAsset(asset));

  return requestedAssets[0] ?? project.assets.find((asset) => isImageAsset(asset));
}

function orderedProjects(projects: readonly PublicProjectCaseStudy[]) {
  return [...projects]
    .sort((left, right) => {
      const leftRank = left.homepageFeature?.rank ?? 99;
      const rightRank = right.homepageFeature?.rank ?? 99;

      return leftRank - rightRank || left.title.localeCompare(right.title);
    })
    .slice(0, 4);
}

function trailSection(id: PublicTrailSection["id"]) {
  const section = publicTrailSections.find((item) => item.id === id);

  if (!section) {
    throw new Error(`Missing public section: ${id}`);
  }

  return section;
}

function SectionLabel({ section }: { section: PublicTrailSection }) {
  return (
    <p className="joe-section-label">
      <span>{section.code}</span>
      {section.label}
    </p>
  );
}

function credentialMap(credentials: readonly LearningCredential[]) {
  return new Map(credentials.map((credential) => [credential.label, credential]));
}

function socialChannel(
  channels: readonly SocialChannel[],
  label: SocialChannel["label"],
) {
  return channels.find((channel) => channel.label === label);
}

function HeroSection({
  joeProfile,
  projects,
  proudRoles,
}: {
  joeProfile: JoeProfile;
  projects: readonly PublicProjectCaseStudy[];
  proudRoles: readonly ProudRole[];
}) {
  const currentProject = projects[0];
  const currentAsset = currentProject
    ? getPreferredImageAsset(currentProject)
    : undefined;
  const currentLink = currentProject?.links[0];
  const systemsLine = proudRoles.map((role) => role.organization).join(" / ");

  return (
    <section
      aria-labelledby="joe-title"
      className="joe-hero"
      data-section-id="joe"
      id="joe"
    >
      <div className="site-shell">
        <div className="joe-hero-shell" data-joe-reveal>
          <div className="joe-hero-copy">
            <h1 id="joe-title" tabIndex={-1}>
              Joe Simo
            </h1>
            <p className="joe-hero-subhead">{joeProfile.headline}</p>
            <p className="joe-hero-body">{joeProfile.detail}</p>
            <nav aria-label="Primary homepage actions" className="joe-actions">
              <a className="joe-action-primary" href="#work">
                View work
              </a>
            </nav>
          </div>

          {currentProject ? (
            <article className="joe-current-card">
              <div className="joe-current-heading">
                <div>
                  <p>Featured</p>
                  <h2>{currentProject.title}</h2>
                  <span>{currentProject.summary}</span>
                </div>
                <div className="joe-current-actions">
                  {currentLink ? (
                    <a
                      href={currentLink.href}
                      rel={currentLink.external ? "noreferrer" : undefined}
                      target={currentLink.external ? "_blank" : undefined}
                    >
                      {currentLink.label}
                      <ExternalCue show={currentLink.external} />
                    </a>
                  ) : null}
                  <button data-project-open={currentProject.slug} type="button">
                    Details
                  </button>
                </div>
              </div>
              {currentAsset ? (
                <figure className="joe-current-media simo-work-media">
                  <div className="joe-product-frame">
                    <div aria-hidden="true" className="joe-product-bar">
                      <span className="joe-product-dots">
                        <span />
                        <span />
                        <span />
                      </span>
                      <span>sim0.com</span>
                      <span />
                    </div>
                    <div className="joe-current-proof-grid">
                      <div className="joe-current-image-frame joe-current-image-frame-main">
                        <Image
                          alt={currentAsset.media.alt}
                          className="joe-cover-image"
                          fetchPriority="high"
                          fill
                          loading="eager"
                          sizes="(max-width: 900px) 100vw, 60vw"
                          src={currentAsset.media.src}
                        />
                      </div>
                      <div
                        aria-hidden="true"
                        className="joe-current-image-frame-detail"
                        style={{ backgroundImage: `url(${currentAsset.media.src})` }}
                      />
                    </div>
                  </div>
                  <figcaption>
                    <span>Capture</span>
                    <strong>Preview, edit, review, ship.</strong>
                  </figcaption>
                </figure>
              ) : null}
              <dl>
                <div>
                  <dt>Role</dt>
                  <dd>{currentProject.role}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{currentProject.status}</dd>
                </div>
                <div>
                  <dt>Systems</dt>
                  <dd>{systemsLine}</dd>
                </div>
              </dl>
            </article>
          ) : null}
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
  const [featuredProject, ...supportingProjects] = projects;
  const featuredAsset = featuredProject
    ? getPreferredImageAsset(featuredProject)
    : undefined;

  return (
    <section
      aria-labelledby="work-title"
      className="joe-section joe-work"
      data-section-id="work"
      id="work"
    >
      <div className="site-shell">
        <div className="joe-section-head" data-joe-reveal>
          <SectionLabel section={section} />
          <h2 id="work-title" tabIndex={-1}>
            Work
          </h2>
          <p>{section.copy.detail}</p>
        </div>

        {featuredProject ? (
          <article
            className="joe-work-feature"
            data-joe-reveal
            id={`work-${featuredProject.slug}`}
          >
            <div className="joe-work-copy">
              <p>{featuredProject.code}</p>
              <h3>{featuredProject.title}</h3>
              <span>{featuredProject.summary}</span>
              <ul aria-label={`${featuredProject.title} details`}>
                <li>{featuredProject.role}</li>
                <li>{featuredProject.status}</li>
                {featuredProject.links[0] ? (
                  <li>
                    <a
                      href={featuredProject.links[0].href}
                      rel={featuredProject.links[0].external ? "noreferrer" : undefined}
                      target={featuredProject.links[0].external ? "_blank" : undefined}
                    >
                      {featuredProject.links[0].label}
                      <ExternalCue show={featuredProject.links[0].external} />
                    </a>
                  </li>
                ) : null}
              </ul>
              <button data-project-open={featuredProject.slug} type="button">
                View details
              </button>
            </div>
            {featuredAsset ? (
              <figure className="joe-work-media simo-work-media">
                <Image
                  alt={featuredAsset.media.alt}
                  className="joe-cover-image"
                  fill
                  sizes="(max-width: 900px) 100vw, 54vw"
                  src={featuredAsset.media.src}
                />
              </figure>
            ) : null}
          </article>
        ) : null}

        <div className="joe-work-table">
          {supportingProjects.map((project) => {
            const asset = getPreferredImageAsset(project);

            return (
              <article id={`work-${project.slug}`} key={project.slug}>
                <div>
                  <span>{project.code}</span>
                  <h3>{project.title}</h3>
                </div>
                <p>{project.role}</p>
                <p>{project.status}</p>
                {asset ? (
                  <span className="joe-work-thumb">
                    <Image
                      alt={asset.media.alt}
                      className="joe-cover-image"
                      fill
                      sizes="5.5rem"
                      src={asset.media.src}
                    />
                  </span>
                ) : null}
                <button data-project-open={project.slug} type="button">
                  Details
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SystemsSection({ roles }: { roles: readonly ProudRole[] }) {
  const section = trailSection("systems");

  return (
    <section
      aria-labelledby="systems-title"
      className="joe-section joe-systems"
      data-section-id="systems"
      id="systems"
    >
      <div className="site-shell">
        <div className="joe-section-head" data-joe-reveal>
          <SectionLabel section={section} />
          <h2 id="systems-title" tabIndex={-1}>
            Systems
          </h2>
          <p>{section.copy.detail}</p>
        </div>
        <div className="joe-timeline">
          {roles.map((role, index) => (
            <article key={role.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{role.title}</h3>
                <p>{role.organization}</p>
              </div>
              <small>{role.detail}</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CredentialsSection({
  credentials,
  groups,
}: {
  credentials: readonly LearningCredential[];
  groups: readonly CredentialGroup[];
}) {
  const section = trailSection("credentials");
  const byLabel = credentialMap(credentials);
  const education = educationRecords[0];

  return (
    <section
      aria-labelledby="credentials-title"
      className="joe-section joe-credentials"
      data-section-id="credentials"
      id="credentials"
    >
      <div className="site-shell">
        <div className="joe-section-head" data-joe-reveal>
          <SectionLabel section={section} />
          <h2 id="credentials-title" tabIndex={-1}>
            Credentials
          </h2>
          <p>{section.copy.detail}</p>
        </div>
        {education ? (
          <article className="joe-education-row">
            <span>Education</span>
            <div>
              <h3>{education.focus}</h3>
              <p>{education.school}</p>
            </div>
            <small>{education.period}</small>
          </article>
        ) : null}
        <div className="joe-credential-list">
          {groups.map((group) => (
            <article key={group.id}>
              <div>
                <h3>{group.label}</h3>
                <p>{group.detail}</p>
              </div>
              <ul>
                {group.credentialLabels.map((label) => {
                  const credential = byLabel.get(label);

                  if (!credential) {
                    return null;
                  }

                  return (
                    <li key={label}>
                      <strong>{label}</strong>
                      <span>
                        {credential.issuer}
                        {credential.issued ? ` / ${credential.issued}` : ""}
                        {credential.period ? ` / ${credential.period}` : ""}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CommunitySection({
  moments,
}: {
  moments: readonly CommunityArtifact[];
}) {
  const section = trailSection("community");
  const visibleMoments = moments.slice(0, 5);

  return (
    <section
      aria-labelledby="community-title"
      className="joe-section joe-community"
      data-section-id="community"
      id="community"
    >
      <div className="site-shell">
        <div className="joe-section-head" data-joe-reveal>
          <SectionLabel section={section} />
          <h2 id="community-title" tabIndex={-1}>
            Community
          </h2>
          <p>{section.copy.detail}</p>
        </div>
        <div
          aria-label="React Miami contact sheet"
          className="joe-photo-sheet"
          role="list"
          tabIndex={0}
        >
          {visibleMoments.map((moment) => (
            <figure
              data-featured={moment.title === "ThePrimeagen"}
              key={`${moment.code}-${moment.media.src}`}
              role="listitem"
            >
              <span className="joe-photo-frame">
                <Image
                  alt={moment.media.alt}
                  className="joe-cover-image"
                  fill
                  sizes={
                    moment.title === "ThePrimeagen"
                      ? "(max-width: 760px) 82vw, 30vw"
                      : "(max-width: 760px) 70vw, 18vw"
                  }
                  src={moment.media.src}
                />
              </span>
              <figcaption>
                <span>{moment.code}</span>
                {moment.title === "ThePrimeagen"
                  ? "With ThePrimeagen at React Miami 2026."
                  : moment.title}
              </figcaption>
            </figure>
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
  const xChannel = socialChannel(socialChannels, "X");
  const secondaryChannels = socialChannels.filter((channel) =>
    ["GitHub", "LinkedIn"].includes(channel.label),
  );

  return (
    <section
      aria-labelledby="contact-title"
      className="joe-section joe-contact"
      data-section-id="contact"
      id="contact"
    >
      <div className="site-shell joe-contact-shell">
        <div>
          <div data-joe-reveal>
            <SectionLabel section={section} />
            <h2 id="contact-title" tabIndex={-1}>
              Contact
            </h2>
            <p>{section.copy.detail}</p>
          </div>
        </div>
        <div className="joe-contact-actions" data-joe-reveal>
          {xChannel ? (
            <a className="joe-action-primary" href={xChannel.href} rel="noreferrer" target="_blank">
              X {xChannel.handle}
              <ExternalCue show />
            </a>
          ) : null}
          {secondaryChannels.map((channel) => (
            <a
              href={channel.href}
              key={channel.label}
              rel="noreferrer"
              target="_blank"
            >
              <SiteIcon aria-hidden iconKey={channel.iconKey} />
              {channel.label}
              <ExternalCue show />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function JoeHomeApp(props: JoeHomeAppProps) {
  const featuredProjects = orderedProjects(props.projects);

  return (
    <div className="joe-site">
      <HashFocus />
      <HeroSection
        joeProfile={props.joeProfile}
        projects={featuredProjects}
        proudRoles={props.proudRoles}
      />
      <WorkSection projects={featuredProjects} />
      <SystemsSection roles={props.proudRoles} />
      <CredentialsSection
        credentials={props.learningCredentials}
        groups={credentialGroups}
      />
      <CommunitySection moments={props.communityArtifacts} />
      <ContactSection socialChannels={props.socialChannels} />
      <PublicTrailRuntime projects={featuredProjects} sections={publicTrailSections} />
    </div>
  );
}
