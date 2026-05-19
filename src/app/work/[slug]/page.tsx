import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteIcon } from "@/components/site/site-icons";
import {
  getProjectCaseStudy,
  projectCaseStudies,
  publicSourceLabel,
  storyboardForProject,
  type ProjectCaseStudy,
  type ProjectStoryboardPanel,
  type ProofMedia,
} from "@/lib/site-data";

const siteUrl = "https://joesimo.com";

type WorkPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function methodStageLabel(stage: ProjectCaseStudy["methodStage"]) {
  switch (stage) {
    case "breakage":
      return "Breakage";
    case "signals":
      return "Signals";
    case "surface":
      return "Surface";
  }
}

function externalActionProps(action: { external?: boolean }) {
  return action.external
    ? {
        target: "_blank",
        rel: "noreferrer",
      }
    : {};
}

function workTierLabel(tier: ProjectCaseStudy["tier"]) {
  switch (tier) {
    case "featured":
      return "Featured case";
    case "case":
      return "Case proof";
    case "supporting":
      return "Supporting proof";
    case "specimen":
      return "Process specimen";
  }
}

function evidenceStatusLabel(status?: string) {
  switch (status) {
    case "local-proof":
      return "Build receipt";
    case "needs-media":
      return "Process trace";
    case "redacted":
      return "Redacted receipt";
    default:
      return status;
  }
}

function proofCaptionForAsset(project: ProjectCaseStudy, assetId?: string) {
  if (!assetId) {
    return undefined;
  }

  return project.proofCaptions[assetId];
}

function proofMediaForPanel(project: ProjectCaseStudy, panel: ProjectStoryboardPanel) {
  if (!panel.mediaId) {
    return undefined;
  }

  return project.miniWorld?.media.find((item) => item.id === panel.mediaId);
}

function WorkProofMediaFrame({ media }: { media: ProofMedia }) {
  return (
    <figure className="work-case-storyboard-media" data-media-kind={media.kind}>
      <div>
        {media.kind === "video" ? (
          <video
            aria-label={media.alt}
            controls
            muted
            playsInline
            poster={media.posterSrc}
            preload="metadata"
            width={media.width}
            height={media.height}
            className="size-full object-cover"
          >
            <source src={media.src} type="video/webm" />
          </video>
        ) : (
          <Image
            src={media.src}
            alt={media.alt}
            width={media.width}
            height={media.height}
            sizes="(min-width: 1024px) 42vw, 92vw"
            className="size-full object-cover"
          />
        )}
      </div>
      <figcaption>
        <span>{media.label}</span>
        <small>{media.sourceLabel}</small>
      </figcaption>
    </figure>
  );
}

function WorkEvidenceSpecimen({ project }: { project: ProjectCaseStudy }) {
  const heroAsset = project.assets[0];
  const heroCaption = proofCaptionForAsset(project, heroAsset?.captionId);

  if (!heroAsset) {
    const specimenCaption =
      Object.values(project.proofCaptions)[0] ?? undefined;

    return (
      <div className="work-case-process" aria-label={`${project.title} process specimen`}>
        <span>{project.code}</span>
        <strong>{project.title}</strong>
        {specimenCaption ? <p>{specimenCaption.detail}</p> : null}
        {project.evidence.map((item) => (
          <em key={item}>{item}</em>
        ))}
      </div>
    );
  }

  const imageFit =
    heroAsset.media.height > heroAsset.media.width ? "object-contain" : "object-cover";

  return (
    <figure className="work-case-artifact">
      <div className="work-case-artifact-frame">
        <Image
          src={heroAsset.media.src}
          alt={heroAsset.media.alt}
          width={heroAsset.media.width}
          height={heroAsset.media.height}
          loading="eager"
          sizes="(min-width: 1024px) 78vw, 94vw"
          className={`size-full ${imageFit}`}
        />
      </div>
      <figcaption>
        <span>{heroCaption?.title ?? heroAsset.label}</span>
        <small>{heroCaption?.sourceLabel ?? publicSourceLabel(heroAsset.sourcePath)}</small>
      </figcaption>
    </figure>
  );
}

function WorkJsonLd({ project }: { project: ProjectCaseStudy }) {
  const image = project.assets[0]?.media.src;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": project.schemaType,
    "@id": `${siteUrl}/work/${project.slug}#work`,
    name: project.title,
    url: `${siteUrl}/work/${project.slug}`,
    author: {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: "Joe Simo",
    },
    creator: {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: "Joe Simo",
    },
    description: project.summary,
    image: image ? `${siteUrl}${image}` : undefined,
    applicationCategory: project.applicationCategory,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}

function WorkStoryboardPanel({
  index,
  panel,
  project,
}: {
  index: number;
  panel: ProjectStoryboardPanel;
  project: ProjectCaseStudy;
}) {
  const asset = panel.assetId
    ? project.assets.find((item) => item.id === panel.assetId)
    : undefined;
  const caption = panel.captionId
    ? project.proofCaptions[panel.captionId]
    : asset
      ? proofCaptionForAsset(project, asset.captionId)
      : undefined;
  const proofMedia = proofMediaForPanel(project, panel);
  const receiptClaims = panel.claimIds.length
    ? panel.claimIds
    : project.safeClaimIds;

  return (
    <article className="work-case-storyboard-panel" data-panel={panel.id}>
      <div className="work-case-storyboard-copy">
        <span>
          {String(index + 1).padStart(2, "0")} / {panel.label}
        </span>
        <h3>{panel.title}</h3>
        <p>{panel.body}</p>
        <div
          className="work-case-storyboard-receipt"
          aria-label={`${panel.label} receipt`}
        >
          {receiptClaims.slice(0, 3).map((claim) => (
            <em key={claim}>{claim}</em>
          ))}
          {caption ? <small>{caption.sourceLabel}</small> : null}
          {evidenceStatusLabel(panel.evidenceStatus ?? caption?.evidenceStatus) ? (
            <small>
              {evidenceStatusLabel(panel.evidenceStatus ?? caption?.evidenceStatus)}
            </small>
          ) : null}
        </div>
      </div>
      {proofMedia ? (
        <WorkProofMediaFrame media={proofMedia} />
      ) : asset ? (
        <figure className="work-case-storyboard-media">
          <div>
            <Image
              src={asset.media.src}
              alt={asset.media.alt}
              width={asset.media.width}
              height={asset.media.height}
              sizes="(min-width: 1024px) 42vw, 92vw"
              className={`size-full ${
                asset.media.height > asset.media.width
                  ? "object-contain"
                  : "object-cover"
              }`}
            />
          </div>
          <figcaption>
            <span>{caption?.title ?? asset.label}</span>
            <small>
              {caption?.sourceLabel ?? publicSourceLabel(asset.sourcePath)}
            </small>
          </figcaption>
        </figure>
      ) : (
        <div className="work-case-storyboard-specimen">
          <span>{project.code}</span>
          <strong>{panel.label}</strong>
          <p>{caption?.detail ?? project.proofSummary}</p>
        </div>
      )}
    </article>
  );
}

function workSocialImage(project: ProjectCaseStudy) {
  const asset = project.assets[0];
  const media = asset?.media;
  const ratio = media ? media.width / media.height : 0;
  const hasShareableProjectMedia =
    Boolean(media) && media.width >= 1000 && media.height >= 500 && ratio >= 1.45;

  if (media && hasShareableProjectMedia) {
    return {
      url: media.src,
      width: media.width,
      height: media.height,
      alt: media.alt,
    };
  }

  return {
    url: "/opengraph-image",
    width: 1200,
    height: 630,
    alt: `${project.title} / Joe Simo`,
  };
}

function workProjectNeighbors(project: ProjectCaseStudy) {
  const currentIndex = projectCaseStudies.findIndex(
    (item) => item.slug === project.slug,
  );
  const normalizedIndex = currentIndex >= 0 ? currentIndex : 0;
  const previousIndex =
    (normalizedIndex - 1 + projectCaseStudies.length) %
    projectCaseStudies.length;
  const nextIndex = (normalizedIndex + 1) % projectCaseStudies.length;

  return {
    previous: projectCaseStudies[previousIndex],
    next: projectCaseStudies[nextIndex],
  };
}

export function generateStaticParams() {
  return projectCaseStudies.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({
  params,
}: WorkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectCaseStudy(slug);

  if (!project) {
    return {
      title: "Work not found",
    };
  }

  const image = workSocialImage(project);

  return {
    title: `${project.title} / Work`,
    description: project.summary,
    alternates: {
      canonical: `/work/${project.slug}`,
    },
    openGraph: {
      title: `${project.title} / Joe Simo`,
      description: project.summary,
      url: `/work/${project.slug}`,
      siteName: "joesimo.com",
      images: [
        {
          url: image.url,
          width: image.width,
          height: image.height,
          alt: image.alt,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      creator: "@joesimo",
      title: `${project.title} / Joe Simo`,
      description: project.summary,
      images: [image.url],
    },
  };
}

export default async function WorkCasePage({ params }: WorkPageProps) {
  const { slug } = await params;
  const project = getProjectCaseStudy(slug);

  if (!project) {
    notFound();
  }

  const { previous, next } = workProjectNeighbors(project);
  const miniWorld = project.miniWorld;
  const humanStake = miniWorld?.humanStake ?? project.humanStake;
  const storyboard = miniWorld?.panels ?? storyboardForProject(project);

  return (
    <div id="top" className="min-h-screen overflow-x-clip bg-background text-foreground">
      <WorkJsonLd project={project} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:border focus:border-border focus:bg-background focus:px-4 focus:py-3 focus:font-mono focus:text-xs focus:uppercase focus:tracking-[0.16em] focus:text-foreground focus:shadow-lg"
      >
        Skip to content
      </a>

      <SiteHeader homeHref="/" sectionPrefix="/" activeHref="#work" />

      <main
        id="main-content"
        tabIndex={-1}
        className="work-case-shell outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
      >
        <section className="work-case-hero" aria-labelledby="work-case-title">
          <div className="work-case-copy">
            <Link href="/#work" className="work-case-back">
              <SiteIcon iconKey="arrowUpRight" aria-hidden />
              Back to work
            </Link>
            <p className="work-case-kicker">
              {project.code} / {methodStageLabel(project.methodStage)}
            </p>
            <h1 id="work-case-title">{project.title}</h1>
            <p className="work-case-summary">{project.summary}</p>
            <dl className="work-case-meta">
              <div>
                <dt>Tier</dt>
                <dd>{workTierLabel(project.tier)}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{project.role}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{project.status}</dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>{publicSourceLabel(project.sourcePath)}</dd>
              </div>
              <div>
                <dt>Proof</dt>
                <dd>{project.proofMode}</dd>
              </div>
            </dl>
            {project.links.length > 0 ? (
              <div className="work-case-actions">
                {project.links.map((action) => (
                  <a
                    key={`${action.label}-${action.href}`}
                    href={action.href}
                    {...externalActionProps(action)}
                  >
                    {action.label}
                    <SiteIcon iconKey="arrowUpRight" aria-hidden />
                    {action.external ? (
                      <span className="sr-only">opens in a new tab</span>
                    ) : null}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <WorkEvidenceSpecimen project={project} />
        </section>

        <section className="work-case-storyboard" aria-labelledby="work-story-title">
          <div>
            <p className="work-case-kicker">
              {miniWorld ? "Mini world" : "Case storyboard"}
            </p>
            <h2 id="work-story-title">{miniWorld?.hook ?? project.story.signal}</h2>
            {humanStake ? (
              <dl className="work-case-stakes" aria-label={`${project.title} human stakes`}>
                <div>
                  <dt>Blocked</dt>
                  <dd>{humanStake.blockedPerson}</dd>
                </div>
                <div>
                  <dt>Confusing</dt>
                  <dd>{humanStake.confusion}</dd>
                </div>
                <div>
                  <dt>Visible</dt>
                  <dd>{humanStake.madeVisible}</dd>
                </div>
                <div>
                  <dt>Why</dt>
                  <dd>{humanStake.whyItMatters}</dd>
                </div>
              </dl>
            ) : null}
          </div>
          <div className="work-case-storyboard-flow">
            {storyboard.map((panel, index) => (
              <WorkStoryboardPanel
                key={panel.id}
                index={index}
                panel={panel}
                project={project}
              />
            ))}
          </div>
        </section>

        {project.assets.length > 1 ? (
          <section className="work-case-strip" aria-label={`${project.title} supporting artifacts`}>
            {project.assets.slice(1).map((asset) => {
              const caption = proofCaptionForAsset(project, asset.captionId);

              return (
                <figure key={asset.id}>
                  <div>
                    <Image
                      src={asset.media.src}
                      alt={asset.media.alt}
                      width={asset.media.width}
                      height={asset.media.height}
                      sizes="(min-width: 1024px) 28vw, 92vw"
                      className={`size-full ${
                        asset.media.height > asset.media.width
                          ? "object-contain"
                          : "object-cover"
                      }`}
                    />
                  </div>
                  <figcaption>
                    <span>{caption?.title ?? asset.label}</span>
                    <small>{caption?.sourceLabel ?? publicSourceLabel(asset.sourcePath)}</small>
                  </figcaption>
                  {caption ? <p className="work-case-caption">{caption.detail}</p> : null}
                </figure>
              );
            })}
          </section>
        ) : null}

        <section className="work-case-evidence" aria-labelledby="work-evidence-title">
          <div>
            <p className="work-case-kicker">Evidence</p>
            <h2 id="work-evidence-title">Build receipt.</h2>
            <p className="work-case-proof-summary">{project.proofSummary}</p>
          </div>
          <ol>
            {project.evidence.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <section className="work-case-completed" aria-labelledby="work-completed-title">
          <p className="work-case-kicker">{project.completedRoute.label}</p>
          <h2 id="work-completed-title">{project.completedRoute.title}</h2>
          <p>{project.completedRoute.detail}</p>
        </section>

        <nav className="work-case-nav" aria-label="More work">
          <Link href={`/work/${previous.slug}`} className="work-case-nav-link">
            <span>Previous</span>
            <strong>{previous.title}</strong>
            <small>
              {previous.code} / {methodStageLabel(previous.methodStage)}
            </small>
          </Link>
          <Link href="/#work" className="work-case-nav-index">
            Work Index
          </Link>
          <Link href={`/work/${next.slug}`} className="work-case-nav-link">
            <span>Next</span>
            <strong>{next.title}</strong>
            <small>
              {next.code} / {methodStageLabel(next.methodStage)}
            </small>
          </Link>
        </nav>
      </main>

      <SiteFooter />
    </div>
  );
}
