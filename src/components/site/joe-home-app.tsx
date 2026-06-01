import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Boxes, ServerCog, ShieldCheck, Workflow } from "lucide-react";
import {
  siComptia,
  siDatto,
  siSemrush,
  siVercel,
  type SimpleIcon,
} from "simple-icons";

import { HashFocus } from "@/components/site/hash-focus";
import {
  LocalizedText as T,
  navLabelEs,
} from "@/components/site/localized-text";
import {
  PortfolioRuntime,
  type ProjectTranslationMap,
} from "@/components/site/portfolio-runtime";
import { HeroNameParticles } from "@/components/site/hero-name-particles";
import { SiteIcon } from "@/components/site/site-icons";
import { Button } from "@/components/ui/button";
import {
  credentialIssuers,
  credentialGroups,
  isHomepageProject,
  portfolioSections,
  type CommunityArtifact,
  type CredentialIssuerLogo,
  type JoeProfile,
  type LearningCredential,
  type ProudRole,
  type PublicEvidenceAsset,
  type PublicProjectCaseStudy,
  type PortfolioSection,
  type SocialChannel,
} from "@/lib/site-data";

type JoeHomeAppProps = {
  communityHighlights: CommunityArtifact[];
  joeProfile: JoeProfile;
  learningCredentials: LearningCredential[];
  projects: PublicProjectCaseStudy[];
  proudRoles: ProudRole[];
  socialChannels: SocialChannel[];
};

function ExternalCue({ show }: { show?: boolean }) {
  return show ? (
    <span className="sr-only">
      <T en="opens in a new tab" es="abre en una pestaña nueva" />
    </span>
  ) : null;
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
  const tierOrder = {
    featured: 0,
    case: 1,
    supporting: 2,
    specimen: 3,
  } satisfies Record<PublicProjectCaseStudy["tier"], number>;

  return [...projects]
    .filter(isHomepageProject)
    .filter((project) => Boolean(getPreferredImageAsset(project)))
    .sort((left, right) => {
      const tierDelta = tierOrder[left.tier] - tierOrder[right.tier];
      const rankDelta =
        (left.homepageFeature?.rank ?? Number.POSITIVE_INFINITY) -
        (right.homepageFeature?.rank ?? Number.POSITIVE_INFINITY);
      const dateOrder = right.started.sortKey.localeCompare(left.started.sortKey);

      return tierDelta || rankDelta || dateOrder || left.title.localeCompare(right.title);
    });
}

function projectStartedYear(project: PublicProjectCaseStudy) {
  return project.started.sortKey.slice(0, 4);
}

function portfolioSection(id: PortfolioSection["id"]) {
  const section = portfolioSections.find((item) => item.id === id);

  if (!section) {
    throw new Error(`Missing public section: ${id}`);
  }

  return section;
}

function SectionLabel({ section }: { section: PortfolioSection }) {
  return (
    <p className="joe-section-label">
      <T en={section.label} es={navLabelEs(section.label)} />
    </p>
  );
}

const simpleCredentialIssuerIcons: Partial<
  Record<CredentialIssuerLogo["mark"], SimpleIcon>
> = {
  comptia: siComptia,
  datto: siDatto,
  semrush: siSemrush,
  vercel: siVercel,
};

function credentialIssuerForCredential(credential: LearningCredential) {
  return credentialIssuers.find((issuer) =>
    issuer.issuerNames.includes(credential.issuer),
  );
}

function CompanyLogoFallback({ issuer }: { issuer: CredentialIssuerLogo }) {
  const simpleIcon = simpleCredentialIssuerIcons[issuer.mark];

  if (simpleIcon) {
    return (
      <svg
        aria-hidden="true"
        className="joe-certification-badge-image joe-certification-company-logo"
        data-mark={issuer.mark}
        focusable="false"
        style={{ color: `#${simpleIcon.hex}` }}
        viewBox="0 0 24 24"
      >
        <path d={simpleIcon.path} fill="currentColor" />
      </svg>
    );
  }

  if (issuer.mark === "microsoft") {
    return (
      <svg
        aria-hidden="true"
        className="joe-certification-badge-image joe-certification-company-logo"
        data-mark={issuer.mark}
        focusable="false"
        viewBox="0 0 24 24"
      >
        <rect fill="#f25022" height="9.8" width="9.8" x="1.2" y="1.2" />
        <rect fill="#7fba00" height="9.8" width="9.8" x="13" y="1.2" />
        <rect fill="#00a4ef" height="9.8" width="9.8" x="1.2" y="13" />
        <rect fill="#ffb900" height="9.8" width="9.8" x="13" y="13" />
      </svg>
    );
  }

  if (issuer.mark === "linkedin") {
    return (
      <svg
        aria-hidden="true"
        className="joe-certification-badge-image joe-certification-company-logo"
        data-mark={issuer.mark}
        focusable="false"
        viewBox="0 0 24 24"
      >
        <path
          d="M20.45 20.45h-3.56v-5.58c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.68H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.32 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.1 20.45H3.54V9H7.1v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0Z"
          fill="#0a66c2"
        />
      </svg>
    );
  }

  if (issuer.mark === "faa") {
    return (
      <svg
        aria-hidden="true"
        className="joe-certification-badge-image joe-certification-company-logo"
        data-mark={issuer.mark}
        focusable="false"
        viewBox="0 0 96 64"
      >
        <path
          d="M48 4c14.9 0 27 12.1 27 27S62.9 58 48 58 21 45.9 21 31 33.1 4 48 4Z"
          fill="#1f4e8c"
        />
        <path
          d="M17 33c14.8-2 27.8-7.1 39-15.3-5.1 10.2-12.8 17.4-23.1 21.5 16.4-.3 31.8-3.7 46.1-10.3-10.5 9.1-22.4 15.2-35.8 18.3C31 50 19.6 45.3 9 33.2c2.7.3 5.4.2 8-.2Z"
          fill="#ffffff"
        />
      </svg>
    );
  }

  if (issuer.mark === "unitrends") {
    return (
      <svg
        aria-hidden="true"
        className="joe-certification-badge-image joe-certification-company-logo"
        data-mark={issuer.mark}
        focusable="false"
        viewBox="0 0 64 64"
      >
        <rect fill="#f47721" height="14" rx="2" width="14" x="8" y="25" />
        <rect fill="#f47721" height="14" rx="2" width="14" x="25" y="12" />
        <rect fill="#f47721" height="14" rx="2" width="14" x="25" y="38" />
        <rect fill="#f47721" height="14" rx="2" width="14" x="42" y="25" />
      </svg>
    );
  }

  if (issuer.mark === "barracuda") {
    return (
      <svg
        aria-hidden="true"
        className="joe-certification-badge-image joe-certification-company-logo"
        data-mark={issuer.mark}
        focusable="false"
        viewBox="0 0 88 88"
      >
        <path
          d="M14 58h35c15 0 25-9 25-22 0-12-10-21-25-21H14v15h33c5 0 8 3 8 7s-3 7-8 7H14Z"
          fill="#0072ce"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="joe-certification-badge-image joe-certification-company-logo"
      data-mark={issuer.mark}
      focusable="false"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" fill="currentColor" r="10" />
    </svg>
  );
}

function socialChannel(
  channels: readonly SocialChannel[],
  label: SocialChannel["label"],
) {
  return channels.find((channel) => channel.label === label);
}

const projectTranslations: ProjectTranslationMap = {
  "love-presentation": {
    es: {
      role: "Construí la app de presentaciones con Next.js",
      status: "Código abierto",
      summary: "Una app pequeña para enlaces privados de presentaciones.",
      evidence: [
        "Sitio activo en lovepresentation.com",
        "Repositorio público MIT en GitHub",
        "Flujo ligero de presentación animada",
        "Sin cuentas, subidas ni base de datos en el flujo público",
      ],
    },
  },
  garden0: {
    es: {
      role: "Construí pantallas en Unity y la landing web",
      status: "Prototipo de juego",
      summary:
        "Un proyecto de juego con Unity, controles móviles, revisiones de entrega y landing web.",
      evidence: [
        "Captura del menú en Unity",
        "Captura de la landing page",
        "Captura de preview en navegador",
        "Registro de progreso con lint, build, export de iOS y revisiones móviles",
      ],
    },
  },
  astrosimo: {
    es: {
      role: "Construí pantallas de planificación y guía para iOS",
      status: "App iOS",
      summary:
        "Una app de observación del cielo con planificación nocturna, captura verificada y guía en vivo.",
      evidence: [
        "Flujo de captura verificada",
        "Pantalla de planificación nocturna",
        "Pantalla de guía del cielo en vivo",
      ],
    },
  },
  chesslm: {
    es: {
      role: "Producto de entrenamiento de ajedrez y cliente Unity",
      status: "Producto de entrenamiento",
      summary:
        "Un producto de entrenamiento de ajedrez con app web/backend en Next.js y cliente Unity para navegador, iPhone y iPad.",
      evidence: [
        "App web/backend en Next.js y espacio clásico de entrenamiento",
        "Cliente Unity para navegador, iPhone y iPad",
        "Límite de API de producción primero en servidor",
        "Soporte para ajedrez clásico y Chess960",
      ],
    },
  },
  sim0: {
    es: {
      role: "Diseñé y construí la interfaz del producto",
      status: "Producto activo",
      summary:
        "Un espacio de trabajo en navegador para previsualizar, editar y revisar una app.",
      evidence: [
        "Importación y preview de una app en navegador",
        "Edición visual conectada a cambios de código",
        "Sitio público en sim0.com",
      ],
    },
  },
  "next-flights": {
    es: {
      role: "Aplicación de seguimiento de vuelos",
      status: "App de vuelos",
      summary:
        "Una app de seguimiento de vuelos con búsqueda, mapas, contenido desde CMS y estructura tipada.",
      evidence: [
        "README con tracking en tiempo real, búsqueda, mapas y CMS",
        "Arte de producto propio",
        "Estructura tipada de aplicación Next.js",
      ],
    },
  },
};

function projectCopy(project: PublicProjectCaseStudy) {
  const es = projectTranslations[project.slug]?.es;

  return {
    evidenceEs: es?.evidence ?? project.evidence,
    roleEs: es?.role ?? project.role,
    statusEs: es?.status ?? project.status,
    summaryEs: es?.summary ?? project.summary,
  };
}

function roleTitleEs(title: string) {
  const translations: Record<string, string> = {
    "Disaster Recovery Engineer": "Ingeniero de recuperación ante desastres",
    "IT Systems Administrator": "Administrador de sistemas IT",
    "System Administrator": "Administrador de sistemas",
  };

  return translations[title] ?? title;
}

function HeroSection({
  joeProfile,
}: {
  joeProfile: JoeProfile;
}) {
  return (
    <section
      aria-labelledby="joe-title"
      className="joe-hero"
      data-section-id="joe"
      id="joe"
    >
      <div className="site-shell">
        <Link className="joe-hero-news" href="/blog">
          <span className="joe-hero-news-label">
            <T en="Latest blog" es="Blog reciente" />
          </span>
          <span className="joe-hero-news-copy">
            <T
              en="Writing belongs on joesimo.com/blog"
              es="La escritura vive en joesimo.com/blog"
            />
          </span>
          <ArrowRight aria-hidden className="joe-hero-news-icon" />
        </Link>
        <div className="joe-hero-stage" data-joe-reveal>
          <div className="joe-signature-stage">
            <div className="joe-identity-core">
              <div className="joe-hero-title-group">
                <HeroNameParticles id="joe-title" text="Joe Simo" />
                <p className="joe-hero-subhead">
                  <T en={joeProfile.headline} es="Diseñador/desarrollador, FL." />
                </p>
              </div>
              <p className="joe-hero-body">
                <T
                  en={joeProfile.detail}
                  es="Creo herramientas web prácticas, interfaces de producto y sistemas pequeños basados en soporte, sistemas y recuperación."
                />
              </p>
              <p className="joe-hero-stack">
                React / Next.js / TypeScript / JavaScript / Tailwind CSS / shadcn/ui
              </p>
            </div>
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
  const section = portfolioSection("work");
  const featuredProjects = projects.slice(0, 6);

  return (
    <section
      aria-labelledby="work-title"
      className="joe-section joe-work"
      data-section-id="work"
      data-section-trace="product"
      id="work"
    >
      <div className="site-shell">
        <div className="joe-section-head joe-section-head-minimal" data-joe-reveal>
          <SectionLabel section={section} />
          <h2 id="work-title" tabIndex={-1}>
            <T en="Work" es="Trabajo" />
          </h2>
          <p>
            <T
              en={section.copy.detail}
              es="Proyectos seleccionados, con la evidencia más fuerte primero."
            />
          </p>
        </div>

        <div className="joe-work-table">
          <div className="joe-work-table-head" data-joe-reveal>
            <SectionLabel section={section} />
            <h2 id="work-title-grid">
              <T en="Selected work" es="Trabajo seleccionado" />
            </h2>
            <p>
              <T
                en="Product interfaces, prototypes, and shipped public surfaces."
                es="Interfaces de producto, prototipos y superficies públicas entregadas."
              />
            </p>
          </div>
          {featuredProjects.map((project, index) => {
            const asset = getPreferredImageAsset(project);
            const media = project.homepageFeature?.thumbnailMedia ?? asset?.media;
            const copy = projectCopy(project);
            const shouldEagerLoadMedia = index === 0;

            return (
              <article
                className="joe-work-card"
                data-featured={index === 0 ? "true" : undefined}
                data-section-trace="product"
                id={`work-${project.slug}`}
                key={project.slug}
              >
                <span className="joe-work-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="joe-work-title">
                  <div>
                    <h3>{project.title}</h3>
                    <p className="joe-work-summary">{project.summary}</p>
                    <p className="joe-work-meta">
                      <T en={project.role} es={copy.roleEs} />
                      {" / "}
                      <T en="Started" es="Inicio" /> {project.started.label}
                      {" / "}
                      <T en={project.status} es={copy.statusEs} />
                    </p>
                  </div>
                </div>
                <span className="joe-work-started">
                  {project.started.label}
                  <span aria-hidden="true">{projectStartedYear(project)}</span>
                </span>
                <span className="joe-work-status">
                  <T en={project.status} es={copy.statusEs} />
                </span>
                {media ? (
                  <span className="joe-work-thumb">
                    <Image
                      alt={media.alt}
                      className="joe-cover-image"
                      fetchPriority={shouldEagerLoadMedia ? "high" : undefined}
                      fill
                      loading={shouldEagerLoadMedia ? "eager" : undefined}
                      sizes={
                        index === 0
                          ? "(max-width: 980px) calc(100vw - 4rem), (max-width: 1180px) calc(100vw - 9rem), 38rem"
                          : "(max-width: 980px) calc(100vw - 4rem), (max-width: 1180px) calc(50vw - 5rem), 20rem"
                      }
                      src={media.src}
                    />
                  </span>
                ) : (
                  <span aria-hidden="true" className="joe-work-thumb joe-work-thumb-empty" />
                )}
                <Button
                  aria-haspopup="dialog"
                  className="joe-work-card-action"
                  data-project-open={project.slug}
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <ArrowRight aria-hidden />
                  <span className="sr-only">
                    <T
                      en={`View case study for ${project.title}`}
                      es={`Ver caso de ${project.title}`}
                    />
                  </span>
                </Button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SystemsSection({ roles }: { roles: readonly ProudRole[] }) {
  const section = portfolioSection("systems");
  const systemNodes = [
    { label: "Server", icon: ServerCog },
    { label: "Backup", icon: Boxes },
    { label: "Security", icon: ShieldCheck },
    { label: "Workflow", icon: Workflow },
  ] as const;

  return (
    <section
      aria-labelledby="systems-title"
      className="joe-section joe-systems"
      data-section-id="systems"
      data-section-trace="systems"
      id="systems"
    >
      <div className="site-shell">
        <div className="joe-section-head" data-joe-reveal>
          <SectionLabel section={section} />
          <h2 id="systems-title" tabIndex={-1}>
            <T en="Systems that keep moving." es="Sistemas que siguen moviéndose." />
          </h2>
          <p>
            <T
              en="Support, recovery, infrastructure, and operational work across production environments."
              es="Soporte, recuperación, infraestructura y trabajo operacional en entornos de producción."
            />
          </p>
        </div>
        <div className="joe-timeline">
          <article aria-label="Systems capability diagram" className="joe-systems-diagram">
            <div className="joe-diagram-stack" aria-hidden="true">
              <span className="joe-diagram-core">JS</span>
              {systemNodes.map(({ label, icon: Icon }) => (
                <span className="joe-diagram-node" data-node={label} key={label}>
                  <Icon aria-hidden />
                  {label}
                </span>
              ))}
            </div>
            <p>
              <T
                en="Databases, Windows Server, VPN, backups, virtualization, endpoint security, and restores."
                es="Bases de datos, Windows Server, VPN, respaldos, virtualización, seguridad endpoint y restauraciones."
              />
            </p>
          </article>
          {roles.map((role, index) => (
            <article className="joe-system-role-card" key={role.id}>
              <span className="joe-timeline-index">{String(index + 1).padStart(2, "0")}</span>
              <span aria-hidden="true" className="joe-timeline-node" />
              <div>
                <h3>
                  <T en={role.title} es={roleTitleEs(role.title)} />
                </h3>
                <p>{role.organization}</p>
              </div>
              <small>
                <T
                  en={role.detail}
                  es={
                    role.id === "macromedica-system-administrator"
                      ? "Administré bases de datos, infraestructura Windows Server, servicios de directorio, telefonía, acceso VPN, virtualización, cableado e infraestructura principal de oficina."
                      : role.id === "neveroff-disaster-recovery-engineer"
                        ? "Instalé, apoyé y diagnostiqué recuperación ante desastres, alta disponibilidad, continuidad de negocio, virtualización, appliances de respaldo, restauraciones y seguridad."
                        : "Manejé revisiones diarias de infraestructura, salud de servidores, acceso de red, respaldos, seguridad endpoint, actualizaciones programadas, snapshots y soporte a sistemas de manufactura."
                  }
                />
              </small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CredentialsSection({
  credentials,
}: {
  credentials: readonly LearningCredential[];
}) {
  const section = portfolioSection("credentials");
  const credentialRecordsByLabel = new Map(
    credentials.map((credential) => [
      credential.label,
      {
        credential,
        issuer: credentialIssuerForCredential(credential),
      },
    ]),
  );
  const certificationTiles = credentialGroups.flatMap((group) =>
    group.credentialLabels
      .map((label) => credentialRecordsByLabel.get(label))
      .filter(
        (
          record,
        ): record is {
          credential: LearningCredential;
          issuer: CredentialIssuerLogo | undefined;
        } => Boolean(record),
      )
      .map((record) => ({
        ...record,
        group,
      })),
  );

  return (
    <section
      aria-labelledby="credentials-title"
      className="joe-section joe-credentials"
      data-section-id="credentials"
      data-section-trace="telematics"
      id="credentials"
    >
      <div className="site-shell">
        <div className="joe-section-head" data-joe-reveal>
          <SectionLabel section={section} />
          <h2 id="credentials-title" tabIndex={-1}>
            <T en="Certifications" es="Certificaciones" />
          </h2>
          <p>
            <T
              en={`${certificationTiles.length} credentials`}
              es={`${certificationTiles.length} certificaciones`}
            />
          </p>
        </div>
        <div aria-label="Certifications" className="joe-certification-grid">
          {certificationTiles.map(({ credential, issuer }) => (
            <article
              aria-label={credential.label}
              className="joe-certification-tile"
              key={credential.label}
            >
              <div className="joe-certification-tile-mark">
                {credential.badge ? (
                  <Image
                    alt={credential.badge.alt}
                    className="joe-certification-badge-image"
                    height={credential.badge.height}
                    sizes="2.75rem"
                    src={credential.badge.src}
                    width={credential.badge.width}
                  />
                ) : issuer ? (
                  <CompanyLogoFallback issuer={issuer} />
                ) : null}
              </div>
              <div className="joe-certification-tile-copy">
                <h3 className="joe-certification-name">{credential.label}</h3>
              </div>
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
  const featuredMoments = moments.filter(
    (moment) => moment.title === "ThePrimeagen",
  );
  const supportingMoments = moments.filter(
    (moment) => moment.title !== "ThePrimeagen",
  );
  const visibleMoments = [...featuredMoments, ...supportingMoments].slice(0, 6);

  const renderMoment = (
    moment: CommunityArtifact,
    copyIndex: number,
  ) => {
    const isDuplicate = copyIndex > 0;

    return (
      <figure
        aria-hidden={isDuplicate || undefined}
        className="joe-photo-card"
        data-featured={moment.title === "ThePrimeagen"}
        key={`${copyIndex}-${moment.code}-${moment.media.src}`}
        role={isDuplicate ? undefined : "listitem"}
      >
        <span className="joe-photo-frame">
          <Image
            alt={isDuplicate ? "" : moment.media.alt}
            className="joe-cover-image"
            fill
            sizes="(max-width: 760px) 82vw, (max-width: 1180px) 34vw, 25vw"
            src={moment.media.src}
          />
        </span>
      </figure>
    );
  };

  return (
    <section
      aria-label="Community photos"
      className="joe-section joe-community"
      data-section-id="community"
      data-section-trace="product"
      id="community"
    >
      <div className="site-shell">
        <p className="sr-only" id="community-photo-rail-help">
          <T
            en="Use the arrow keys to browse the React Miami photo rail."
            es="Usa las flechas para navegar las fotos de React Miami."
          />
        </p>
        <div
          aria-describedby="community-photo-rail-help"
          aria-keyshortcuts="ArrowLeft ArrowRight Home End"
          aria-label="React Miami photo rail"
          className="joe-photo-marquee"
          data-photo-rail
          id="community-photo-rail"
          role="region"
          tabIndex={0}
        >
          <div className="joe-photo-marquee-track">
            <div className="joe-photo-marquee-copy joe-photo-sheet" role="list">
              {visibleMoments.map((moment) =>
                renderMoment(moment, 0),
              )}
            </div>
            <div
              aria-hidden="true"
              className="joe-photo-marquee-copy joe-photo-sheet"
            >
              {visibleMoments.map((moment) =>
                renderMoment(moment, 1),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BlogSection() {
  const section = portfolioSection("blog");

  return (
    <section
      aria-labelledby="blog-title"
      className="joe-section joe-blog"
      data-section-id="blog"
      data-section-trace="product"
      id="blog"
    >
      <div className="site-shell">
        <div className="joe-section-head joe-section-head-minimal" data-joe-reveal>
          <SectionLabel section={section} />
          <h2 id="blog-title" tabIndex={-1}>
            <T en="Blog" es="Blog" />
          </h2>
          <p>
            <T en={section.copy.detail} es="Notas cortas y escritura." />
          </p>
        </div>
        <article className="joe-blog-row">
          <span>
            <T en="Notes" es="Notas" />
          </span>
          <div>
            <h3>
              <T en="Short writing" es="Escritura breve" />
            </h3>
            <p>
              <T
                en="Writing lives on joesimo.com/blog as the canonical route."
                es="La escritura vive en joesimo.com/blog como su ruta canónica."
              />
            </p>
          </div>
          <Link href="/blog">
            <T en="Read blog" es="Leer blog" />
          </Link>
        </article>
      </div>
    </section>
  );
}

function ContactSection({
  socialChannels,
}: {
  socialChannels: readonly SocialChannel[];
}) {
  const xChannel = socialChannel(socialChannels, "X");
  const secondaryChannels = (["GitHub", "LinkedIn", "Instagram"] as const)
    .map((label) => socialChannel(socialChannels, label))
    .filter((channel): channel is SocialChannel => Boolean(channel));

  return (
    <section
      aria-label="Contact links"
      className="joe-section joe-contact"
      data-section-id="contact"
      data-section-trace="product"
      id="contact"
    >
      <div className="site-shell joe-contact-shell">
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
      />
      <div className="site-shell joe-grid-shell">
        <div className="joe-page-grid">
          <WorkSection projects={featuredProjects} />
          <SystemsSection roles={props.proudRoles} />
          <CredentialsSection credentials={props.learningCredentials} />
          <CommunitySection moments={props.communityHighlights} />
          <BlogSection />
          <ContactSection socialChannels={props.socialChannels} />
        </div>
      </div>
      <PortfolioRuntime
        projectTranslations={projectTranslations}
        projects={featuredProjects}
        sections={portfolioSections}
      />
    </div>
  );
}
