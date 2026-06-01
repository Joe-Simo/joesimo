import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteIcon } from "@/components/site/site-icons";
import { ButtonLink } from "@/components/ui/button";
import {
  getPublicProjectCaseStudy,
  projectCaseStudiesPublic,
  socialChannels,
  type EvidenceStatus,
  type ProofMedia,
  type ProjectStoryboardPanel,
  type PublicEvidenceAsset,
  type PublicProjectCaseStudy,
} from "@/lib/site-data";

const siteUrl = "https://joesimo.com";
const fallbackOpenGraphImage = {
  url: new URL("/opengraph-image", siteUrl).toString(),
  width: 1200,
  height: 630,
  alt: "Joe Simo / joesimo.com",
};
const fallbackTwitterImage = new URL("/twitter-image", siteUrl).toString();

type WorkPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return projectCaseStudiesPublic.map((project) => ({
    slug: project.slug,
  }));
}

function findProject(slug: string) {
  return getPublicProjectCaseStudy(slug);
}

function isImageAsset(
  asset: PublicEvidenceAsset | undefined,
): asset is PublicEvidenceAsset {
  return Boolean(asset && !asset.media.src.endsWith(".webm"));
}

function primaryAsset(project: PublicProjectCaseStudy) {
  const requestedAsset = project.homepageFeature?.mediaAssetIds
    .map((assetId) => project.assets.find((asset) => asset.id === assetId))
    .find(isImageAsset);

  return requestedAsset ?? project.assets.find(isImageAsset);
}

function projectSocialImage(project: PublicProjectCaseStudy) {
  const asset = primaryAsset(project);

  if (!asset) {
    return undefined;
  }

  return {
    url: new URL(asset.media.src, siteUrl).toString(),
    width: asset.media.width,
    height: asset.media.height,
    alt: asset.media.alt || `${project.title} preview`,
  };
}

export async function generateMetadata({
  params,
}: WorkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = findProject(slug);

  if (!project) {
    notFound();
  }

  const socialImage = projectSocialImage(project);
  const twitterImageUrl = socialImage?.url ?? fallbackTwitterImage;
  const title =
    project.tier === "featured"
      ? `${project.title} case study`
      : `${project.title} work specimen`;
  const description = project.story.outcome || project.summary;
  const path = `/work/${project.slug}`;
  const openGraphImages = [socialImage ?? fallbackOpenGraphImage];

  return {
    alternates: {
      canonical: path,
    },
    title,
    description,
    openGraph: {
      title,
      description,
      url: new URL(path, siteUrl).toString(),
      siteName: "joesimo.com",
      images: openGraphImages,
      locale: "en_US",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      creator: "@joesimo",
      title,
      description,
      images: [twitterImageUrl],
    },
  };
}

function evidenceStatusLabel(status: EvidenceStatus | undefined) {
  switch (status) {
    case "verified":
      return "Verified";
    case "local-proof":
      return "Owned capture";
    case "redacted":
      return "Redacted";
    case "needs-media":
      return "Needs media";
    default:
      return undefined;
  }
}

function panelsForProject(project: PublicProjectCaseStudy) {
  if (project.miniWorld?.panels.length) {
    return project.miniWorld.panels;
  }

  if (project.storyboard?.length) {
    return project.storyboard;
  }

  const firstAsset = project.assets[0];
  const lastAsset = project.assets[project.assets.length - 1] ?? firstAsset;

  return [
    {
      id: "problem-scene",
      label: "Problem",
      title: "Problem",
      body: project.story.problem,
      assetId: firstAsset?.id,
      captionId: firstAsset?.captionId,
      claimIds: firstAsset?.claimIds ?? [],
    },
    {
      id: "proof-operation",
      label: "Approach",
      title: "Approach",
      body: project.story.approach.join(" "),
      assetId: firstAsset?.id,
      captionId: firstAsset?.captionId,
      claimIds: project.safeClaimIds,
    },
    {
      id: "decision-moment",
      label: "Constraint",
      title: "Constraint",
      body: project.story.constraint,
      assetId: lastAsset?.id,
      captionId: lastAsset?.captionId,
      claimIds: lastAsset?.claimIds ?? [],
    },
    {
      id: "outcome",
      label: "Outcome",
      title: project.completedRoute.title,
      body: project.completedRoute.detail,
      assetId: lastAsset?.id,
      captionId: lastAsset?.captionId,
      claimIds: lastAsset?.claimIds ?? [],
    },
  ] satisfies ProjectStoryboardPanel[];
}

function assetForPanel(
  project: PublicProjectCaseStudy,
  panel: ProjectStoryboardPanel,
) {
  if (!panel.assetId) {
    return undefined;
  }

  return project.assets.find((asset) => asset.id === panel.assetId);
}

function mediaForPanel(
  project: PublicProjectCaseStudy,
  panel: ProjectStoryboardPanel,
) {
  if (!panel.mediaId) {
    return undefined;
  }

  return project.miniWorld?.media.find((media) => media.id === panel.mediaId);
}

function CaseImage({
  asset,
  priority = false,
}: {
  asset: PublicEvidenceAsset;
  priority?: boolean;
}) {
  return (
    <figure className="work-case-media">
      <Image
        alt={asset.media.alt}
        className="joe-cover-image"
        fetchPriority={priority ? "high" : undefined}
        fill
        loading={priority ? "eager" : undefined}
        preload={priority}
        sizes="(max-width: 900px) calc(100vw - 2rem), 52vw"
        src={asset.media.src}
      />
    </figure>
  );
}

function CaseVideo({ media }: { media: ProofMedia }) {
  return (
    <figure className="work-case-media">
      <video
        aria-label={media.alt}
        controls
        playsInline
        poster={media.posterSrc}
        preload="metadata"
        src={media.src}
      />
    </figure>
  );
}

function PanelMedia({
  asset,
  media,
}: {
  asset?: PublicEvidenceAsset;
  media?: ProofMedia;
}) {
  if (media?.kind === "video") {
    return <CaseVideo media={media} />;
  }

  if (media?.kind === "image") {
    return (
      <figure className="work-case-media">
        <Image
          alt={media.alt}
          className="joe-cover-image"
          fill
          sizes="(max-width: 900px) calc(100vw - 2rem), 52vw"
          src={media.src}
        />
      </figure>
    );
  }

  if (asset) {
    return <CaseImage asset={asset} />;
  }

  return null;
}

function externalRel(external?: boolean) {
  return external ? "noreferrer" : undefined;
}

function externalTarget(external?: boolean) {
  return external ? "_blank" : undefined;
}

export default async function WorkPage({ params }: WorkPageProps) {
  const { slug } = await params;
  const project = findProject(slug);

  if (!project) {
    notFound();
  }

  const heroAsset = primaryAsset(project);
  const panels = panelsForProject(project);
  const stake = project.humanStake ?? project.miniWorld?.humanStake;

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
              Work
            </Link>
            <p className="work-case-kicker">{project.code}</p>
            <h1>{project.title}</h1>
            <p className="work-case-summary">{project.summary}</p>
            <dl className="work-case-meta">
              <div>
                <dt>Role</dt>
                <dd>{project.role}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{project.status}</dd>
              </div>
              <div>
                <dt>Started</dt>
                <dd>{project.started.label}</dd>
              </div>
            </dl>
            <div className="work-case-actions">
              {project.links.map((link) => (
                <ButtonLink
                  data-kind={link.kind ?? "secondary"}
                  href={link.href}
                  key={link.href}
                  rel={externalRel(link.external)}
                  target={externalTarget(link.external)}
                  variant={link.kind === "primary" ? "default" : "outline"}
                >
                  {link.label}
                  <SiteIcon aria-hidden iconKey="arrowUpRight" />
                  {link.external ? (
                    <span className="sr-only">opens in a new tab</span>
                  ) : null}
                </ButtonLink>
              ))}
              <ButtonLink data-kind="section" href="/#work" variant="outline">
                Back to GitHub projects
                <SiteIcon aria-hidden iconKey="appWindow" />
              </ButtonLink>
              <ButtonLink data-kind="section" href="/#contact" variant="outline">
                Contact Joe about {project.title}
                <SiteIcon aria-hidden iconKey="mail" />
              </ButtonLink>
            </div>
          </div>

          {heroAsset ? <CaseImage asset={heroAsset} priority /> : null}
        </section>

        <section className="work-case-section site-page-shell">
          <div className="work-case-section-head">
            <p>Story</p>
            <h2>{project.story.signal}</h2>
          </div>
          <div className="work-case-story-grid">
            <article>
              <h3>Problem</h3>
              <p>{project.story.problem}</p>
            </article>
            <article>
              <h3>Constraint</h3>
              <p>{project.story.constraint}</p>
            </article>
            <article>
              <h3>Approach</h3>
              <p>{project.story.approach.join(" ")}</p>
            </article>
            <article>
              <h3>Outcome</h3>
              <p>{project.story.outcome}</p>
            </article>
            {project.story.limitation ? (
              <article>
                <h3>Limit</h3>
                <p>{project.story.limitation}</p>
              </article>
            ) : null}
          </div>
        </section>

        {stake ? (
          <section className="work-case-section site-page-shell">
            <div className="work-case-section-head">
              <p>Human stake</p>
              <h2>{stake.whyItMatters}</h2>
            </div>
            <div className="work-case-story-grid">
              <article>
                <h3>Blocked person</h3>
                <p>{stake.blockedPerson}</p>
              </article>
              <article>
                <h3>Confusion</h3>
                <p>{stake.confusion}</p>
              </article>
              <article>
                <h3>Made visible</h3>
                <p>{stake.madeVisible}</p>
              </article>
            </div>
          </section>
        ) : null}

        <section className="work-case-section site-page-shell">
          <div className="work-case-section-head">
            <p>Evidence</p>
            <h2>{project.proofSummary}</h2>
          </div>
          <div className="work-case-panels">
            {panels.map((panel) => {
              const asset = assetForPanel(project, panel);
              const media = mediaForPanel(project, panel);
              const caption = panel.captionId
                ? project.proofCaptions[panel.captionId]
                : undefined;
              const statusLabel = evidenceStatusLabel(
                caption?.evidenceStatus ?? panel.evidenceStatus,
              );
              const sourceLine = [caption?.sourceLabel, statusLabel]
                .filter(Boolean)
                .join(" / ");

              return (
                <article className="work-case-panel" key={panel.id}>
                  <PanelMedia asset={asset} media={media} />
                  <div>
                    <p>{panel.label}</p>
                    <h3>{panel.title}</h3>
                    <p>{panel.body}</p>
                    {sourceLine ? <small>{sourceLine}</small> : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="work-case-section site-page-shell">
          <div className="work-case-section-head">
            <p>{project.completedRoute.label}</p>
            <h2>{project.completedRoute.title}</h2>
          </div>
          <ul className="work-case-claim-list">
            <li>{project.completedRoute.detail}</li>
          </ul>
        </section>

        <section className="work-case-section site-page-shell">
          <div className="work-case-section-head">
            <p>Claims</p>
            <h2>Public claims kept inside the available evidence.</h2>
          </div>
          <ul className="work-case-claim-list">
            {project.evidence.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </main>

      <SiteFooter
        homeHref="/"
        sectionPrefix="/"
        socialChannels={socialChannels}
      />
    </div>
  );
}
