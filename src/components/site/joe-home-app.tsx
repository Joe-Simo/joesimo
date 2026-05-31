import Image from "next/image";
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
import {
  credentialIssuers,
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
  return [...projects]
    .filter(isHomepageProject)
    .filter((project) => Boolean(getPreferredImageAsset(project)))
    .sort((left, right) => {
      const dateOrder = right.started.sortKey.localeCompare(left.started.sortKey);

      return dateOrder || left.title.localeCompare(right.title);
    });
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

function credentialIssuerCredentials(
  credentials: readonly LearningCredential[],
  issuer: CredentialIssuerLogo,
) {
  return credentials.filter(
    (credential) => issuer.issuerNames.includes(credential.issuer),
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

function credentialMetaEs(meta: string) {
  return meta
    .replaceAll("Issued", "Emitida")
    .replaceAll("Expired", "Expirada")
    .replaceAll("Completed", "Completado");
}

function credentialIssuerLabelEs(label: string) {
  return label === "FAA Safety Team"
    ? "FAA Safety Team"
    : label === "LinkedIn Learning"
      ? "LinkedIn Learning"
      : label;
}

function CredentialLogoMark({
  label,
  mark,
}: {
  label: string;
  mark: CredentialIssuerLogo["mark"];
}) {
  const simpleIconByMark: Partial<
    Record<CredentialIssuerLogo["mark"], SimpleIcon>
  > = {
    comptia: siComptia,
    datto: siDatto,
    semrush: siSemrush,
    vercel: siVercel,
  };
  const simpleIcon = simpleIconByMark[mark];

  return (
    <span aria-hidden="true" className="joe-certification-logo-lockup">
      <svg
        className="joe-certification-logo-mark"
        data-mark={mark}
        focusable="false"
        viewBox="0 0 260 88"
      >
        {simpleIcon ? (
          <>
            <path
              className="joe-certification-logo-icon"
              d={simpleIcon.path}
              transform="translate(24 26) scale(1.7)"
            />
            <text className="joe-certification-logo-word" x="76" y="55">
              {label}
            </text>
          </>
        ) : (
          <FallbackCertificationLogo label={label} mark={mark} />
        )}
      </svg>
    </span>
  );
}

function FallbackCertificationLogo({
  label,
  mark,
}: {
  label: string;
  mark: CredentialIssuerLogo["mark"];
}) {
  if (mark === "microsoft") {
    return (
      <>
        <g className="joe-certification-logo-symbol">
          <rect height="17" width="17" x="24" y="27" />
          <rect height="17" width="17" x="45" y="27" />
          <rect height="17" width="17" x="24" y="48" />
          <rect height="17" width="17" x="45" y="48" />
        </g>
        <text className="joe-certification-logo-word" x="76" y="55">
          Microsoft
        </text>
      </>
    );
  }

  if (mark === "linkedin") {
    return (
      <>
        <rect
          className="joe-certification-logo-symbol"
          height="38"
          rx="5"
          width="38"
          x="24"
          y="25"
        />
        <text className="joe-certification-logo-inverse" x="35" y="52">
          in
        </text>
        <text className="joe-certification-logo-word" x="76" y="47">
          LinkedIn
        </text>
        <text className="joe-certification-logo-subword" x="78" y="65">
          Learning
        </text>
      </>
    );
  }

  if (mark === "faa") {
    return (
      <>
        <text
          className="joe-certification-logo-word joe-certification-logo-word-large"
          x="24"
          y="57"
        >
          FAA
        </text>
        <text className="joe-certification-logo-subword" x="92" y="41">
          Safety
        </text>
        <text className="joe-certification-logo-subword" x="92" y="62">
          Team
        </text>
      </>
    );
  }

  if (mark === "unitrends") {
    return (
      <>
        <g className="joe-certification-logo-symbol">
          <rect height="8" width="8" x="25" y="39" />
          <rect height="8" width="8" x="39" y="31" />
          <rect height="8" width="8" x="39" y="47" />
          <rect height="8" width="8" x="53" y="39" />
        </g>
        <text className="joe-certification-logo-word" x="76" y="55">
          Unitrends
        </text>
      </>
    );
  }

  if (mark === "barracuda") {
    return (
      <>
        <path
          className="joe-certification-logo-symbol"
          d="M24 53h25c10 0 17-6 17-15 0-8-7-14-17-14H24v10h23c3 0 5 2 5 5s-2 5-5 5H24Z"
        />
        <text className="joe-certification-logo-word" x="76" y="55">
          Barracuda
        </text>
      </>
    );
  }

  return (
    <text className="joe-certification-logo-word" textAnchor="middle" x="130" y="55">
      {label}
    </text>
  );
}

function roleTitleEs(title: string) {
  const translations: Record<string, string> = {
    "Disaster Recovery Engineer": "Ingeniero de recuperación ante desastres",
    "IT Systems Administrator": "Administrador de sistemas IT",
    "System Administrator": "Administrador de sistemas",
  };

  return translations[title] ?? title;
}

function communityTitleEs(title: string) {
  const translations: Record<string, string> = {
    "Audience frame": "Audiencia",
    "Builder table": "Mesa de builders",
    "React Miami room": "Sala de React Miami",
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
                React / Next.js / TypeScript / JavaScript
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

  return (
    <section
      aria-labelledby="work-title"
      className="joe-section joe-work"
      data-section-id="work"
      data-section-trace="product"
      id="work"
    >
      <div className="site-shell">
        <div className="joe-section-head" data-joe-reveal>
          <SectionLabel section={section} />
          <h2 id="work-title" tabIndex={-1}>
            <T en="Work" es="Trabajo" />
          </h2>
          <p>
            <T
              en={section.copy.detail}
              es="Proyectos ordenados por fecha de inicio."
            />
          </p>
        </div>

        <div className="joe-work-table">
          {projects.map((project, index) => {
            const asset = getPreferredImageAsset(project);
            const media = project.homepageFeature?.thumbnailMedia ?? asset?.media;
            const copy = projectCopy(project);
            const shouldEagerLoadMedia = index === 0;

            return (
              <article data-section-trace="product" id={`work-${project.slug}`} key={project.slug}>
                <div className="joe-work-title">
                  <span className="joe-work-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{project.title}</h3>
                    <p className="joe-work-meta">
                      <T en={project.role} es={copy.roleEs} />
                      {" / "}
                      <T en="Started" es="Inicio" /> {project.started.label}
                      {" / "}
                      <T en={project.status} es={copy.statusEs} />
                    </p>
                  </div>
                </div>
                {media ? (
                  <span className="joe-work-thumb">
                    <Image
                      alt={media.alt}
                      className="joe-cover-image"
                      fetchPriority={shouldEagerLoadMedia ? "high" : undefined}
                      fill
                      loading={shouldEagerLoadMedia ? "eager" : undefined}
                      sizes="(max-width: 980px) calc(100vw - 4rem), (max-width: 1180px) calc(100vw - 9rem), 16rem"
                      src={media.src}
                    />
                  </span>
                ) : (
                  <span aria-hidden="true" className="joe-work-thumb joe-work-thumb-empty" />
                )}
                <button
                  data-project-open={project.slug}
                  type="button"
                >
                  <span aria-hidden="true">
                    <T en="Details" es="Detalles" />
                  </span>
                  <span className="sr-only">
                    <T
                      en={`View details for ${project.title}`}
                      es={`Ver detalles de ${project.title}`}
                    />
                  </span>
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
  const section = portfolioSection("systems");

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
            <T en="Systems" es="Sistemas" />
          </h2>
          <p>
            <T
              en={section.copy.detail}
              es="Tres roles de sistemas de los que estoy orgulloso."
            />
          </p>
        </div>
        <div className="joe-timeline">
          {roles.map((role, index) => (
            <article key={role.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
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
  const issuerGroups = credentialIssuers
    .map((issuer) => ({
      issuer,
      credentials: credentialIssuerCredentials(credentials, issuer),
    }))
    .filter((item) => item.credentials.length > 0);
  const desktopColumnCount = 5;
  const emptyDesktopCells =
    (desktopColumnCount - (issuerGroups.length % desktopColumnCount)) %
    desktopColumnCount;

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
        </div>
        <div
          aria-label="Certification issuers"
          className="joe-certification-wall"
        >
          {issuerGroups.map(({ credentials: issuerCredentials, issuer }) => (
            <details className="joe-certification-logo-card" key={issuer.id}>
              <summary>
                <CredentialLogoMark label={issuer.label} mark={issuer.mark} />
                <span className="sr-only">
                  <T
                    en={`${issuer.label} credentials`}
                    es={`${credentialIssuerLabelEs(issuer.label)} credenciales`}
                  />
                </span>
              </summary>
              <div className="joe-certification-logo-body">
                <ul>
                  {issuerCredentials.map((credential) => {
                    const credentialMeta = [
                      credential.issued,
                      credential.period,
                    ]
                      .filter(Boolean)
                      .join(" / ");
                    const credentialMetaSpanish = [
                      credential.issued
                        ? credentialMetaEs(credential.issued)
                        : undefined,
                      credential.period
                        ? credentialMetaEs(credential.period)
                        : undefined,
                    ]
                      .filter(Boolean)
                      .join(" / ");

                    return (
                      <li key={credential.label}>
                        <strong>{credential.label}</strong>
                        {credentialMeta ? (
                          <span>
                            <T en={credentialMeta} es={credentialMetaSpanish} />
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </details>
          ))}
          {Array.from({ length: emptyDesktopCells }, (_, index) => (
            <span
              aria-hidden="true"
              className="joe-certification-logo-empty-cell"
              key={`certification-empty-${index}`}
            />
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
  const visibleMoments = moments.slice(0, 6);

  const renderMoment = (
    moment: CommunityArtifact,
    index: number,
    copyIndex: number,
  ) => {
    const isDuplicate = copyIndex > 0;
    const isFeatured = moment.title === "ThePrimeagen";

    return (
      <figure
        aria-hidden={isDuplicate || undefined}
        className="joe-photo-card"
        data-featured={isFeatured}
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
        <figcaption>
          {isFeatured ? (
            <T
              en="With ThePrimeagen at React Miami 2026."
              es="Con ThePrimeagen en React Miami 2026."
            />
          ) : (
            <T en={moment.title} es={communityTitleEs(moment.title)} />
          )}
        </figcaption>
      </figure>
    );
  };

  return (
    <section
      aria-labelledby="community-title"
      className="joe-section joe-community"
      data-section-id="community"
      data-section-trace="product"
      id="community"
    >
      <h2 className="sr-only" id="community-title" tabIndex={-1}>
        <T en="Community" es="Comunidad" />
      </h2>
      <div className="site-shell">
        <div
          aria-label="React Miami photo rail"
          className="joe-photo-marquee"
          role="region"
          tabIndex={0}
        >
          <div className="joe-photo-marquee-track">
            <div className="joe-photo-marquee-copy joe-photo-sheet" role="list">
              {visibleMoments.map((moment, index) =>
                renderMoment(moment, index, 0),
              )}
            </div>
            <div
              aria-hidden="true"
              className="joe-photo-marquee-copy joe-photo-sheet"
            >
              {visibleMoments.map((moment, index) =>
                renderMoment(moment, index, 1),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BlogSection({ socialChannels }: { socialChannels: readonly SocialChannel[] }) {
  const section = portfolioSection("blog");
  const xChannel = socialChannel(socialChannels, "X");

  return (
    <section
      aria-labelledby="blog-title"
      className="joe-section joe-blog"
      data-section-id="blog"
      data-section-trace="product"
      id="blog"
    >
      <div className="site-shell">
        <div className="joe-section-head" data-joe-reveal>
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
                en="Public notes and updates live on X while this site stays focused."
                es="Las notas públicas y actualizaciones viven en X para mantener este sitio enfocado."
              />
            </p>
          </div>
          {xChannel ? (
            <a href={xChannel.href} rel="noreferrer" target="_blank">
              <T en="Read on X" es="Leer en X" />
              <ExternalCue show />
            </a>
          ) : null}
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
  const section = portfolioSection("contact");
  const xChannel = socialChannel(socialChannels, "X");
  const secondaryChannels = (["GitHub", "LinkedIn", "Instagram"] as const)
    .map((label) => socialChannel(socialChannels, label))
    .filter((channel): channel is SocialChannel => Boolean(channel));

  return (
    <section
      aria-labelledby="contact-title"
      className="joe-section joe-contact"
      data-section-id="contact"
      data-section-trace="product"
      id="contact"
    >
      <div className="site-shell joe-contact-shell">
        <div>
          <div data-joe-reveal>
            <SectionLabel section={section} />
            <h2 id="contact-title" tabIndex={-1}>
              <T en="Contact" es="Contacto" />
            </h2>
            <p>
              <T
                en={section.copy.detail}
                es="Escríbeme en X. LinkedIn, GitHub e Instagram son formas públicas de contacto y contexto."
              />
            </p>
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
      />
      <WorkSection projects={featuredProjects} />
      <SystemsSection roles={props.proudRoles} />
      <CredentialsSection credentials={props.learningCredentials} />
      <CommunitySection moments={props.communityHighlights} />
      <BlogSection socialChannels={props.socialChannels} />
      <ContactSection socialChannels={props.socialChannels} />
      <PortfolioRuntime
        projectTranslations={projectTranslations}
        projects={featuredProjects}
        sections={portfolioSections}
      />
    </div>
  );
}
