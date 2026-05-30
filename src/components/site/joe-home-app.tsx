import Image from "next/image";

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
import { HeroWebGLField } from "@/components/site/hero-webgl-field";
import { SiteIcon } from "@/components/site/site-icons";
import {
  credentialGroups,
  educationRecords,
  isHomepageProject,
  portfolioSections,
  profileMedia,
  type CommunityArtifact,
  type CredentialGroup,
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
      <span>{section.code}</span>
      <T en={section.label} es={navLabelEs(section.label)} />
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

function educationFocusEs(focus: string) {
  const translations: Record<string, string> = {
    "Bachelor of Science, Telematics Engineering":
      "Licenciatura en Ingeniería Telemática",
    "CCNA 1, IT": "CCNA 1, TI",
    "CCNA 2, IT": "CCNA 2, TI",
    "CCNA 3, IT": "CCNA 3, TI",
    "CCNA 4, IT": "CCNA 4, TI",
    "IT 1, IT": "TI 1, TI",
    "IT 2, IT": "TI 2, TI",
  };

  return translations[focus] ?? focus;
}

function educationDetailEs(detail: string) {
  const translations: Record<string, string> = {
    "Reference degree for developing and programming networks and applications that make the Information Society possible.":
      "Carrera orientada al desarrollo y programación de redes y aplicaciones para la sociedad de la información.",
    "Networking Basics": "Fundamentos de redes",
    "Routers and Routing Basics": "Routers y fundamentos de enrutamiento",
    "Switching Basics and Intermediate Routing":
      "Fundamentos de switching y enrutamiento intermedio",
    "WAN Technologies": "Tecnologías WAN",
    "Hardware and Software": "Hardware y software",
    "Servers and Network OS": "Servidores y sistemas operativos de red",
  };

  return translations[detail] ?? detail;
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
              <HeroWebGLField
                alt={profileMedia.alt}
                imageSrc={profileMedia.src}
                label="Interactive black-and-white Joe Simo portrait"
              />
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
              <nav aria-label="Primary homepage actions" className="joe-actions">
                <a className="joe-action-primary" href="#work">
                  <T en="View work" es="Ver trabajos" />
                </a>
              </nav>
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
  groups,
}: {
  credentials: readonly LearningCredential[];
  groups: readonly CredentialGroup[];
}) {
  const section = portfolioSection("credentials");
  const byLabel = credentialMap(credentials);
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
            <T en="Credentials" es="Credenciales" />
          </h2>
          <p>
            <T
              en={section.copy.detail}
              es="Educación y certificaciones agrupadas por uso."
            />
          </p>
        </div>
        <details className="joe-proof-group joe-education-list">
          <summary>
            <span>
              <T en="Education" es="Educación" />
            </span>
            <div>
              <h3>
                <T en="Education" es="Educación" />
              </h3>
              <p>
                <T
                  en="Degree and Cisco Networking Academy courses."
                  es="Título universitario y cursos de Cisco Networking Academy."
                />
              </p>
            </div>
            <small>
              {educationRecords.length} <T en="records" es="registros" />
            </small>
          </summary>
          <div className="joe-proof-group-body">
            {educationRecords.map((education, index) => (
              <article
                className="joe-education-row"
                key={`${education.school}-${education.focus}`}
              >
              <span>
                {index === 0 ? (
                  <T en="Education" es="Educación" />
                ) : (
                  <T en="Course" es="Curso" />
                )}
              </span>
              <div>
                <h3>
                  <T
                    en={education.focus}
                    es={educationFocusEs(education.focus)}
                  />
                </h3>
                <p>
                  {education.school}
                  {education.detail ? (
                    <>
                      {" / "}
                      <T
                        en={education.detail}
                        es={educationDetailEs(education.detail)}
                      />
                    </>
                  ) : null}
                </p>
              </div>
              <small>{education.period}</small>
              </article>
            ))}
          </div>
        </details>
        <div className="joe-credential-list">
          {groups.map((group) => (
            <details className="joe-proof-group" key={group.id}>
              <summary>
                <span>{String(group.credentialLabels.length).padStart(2, "0")}</span>
                <div>
                  <h3>
                    <T
                      en={group.label}
                      es={
                        group.id === "web"
                          ? "Web, Vercel y SEO"
                          : group.id === "systems-networking"
                            ? "Sistemas y redes"
                            : group.id === "vendor-tools"
                              ? "Herramientas de proveedor"
                              : "Operaciones con drones"
                      }
                    />
                  </h3>
                  <p>
                    <T
                      en={group.detail}
                      es={
                        group.id === "web"
                          ? "Registros de formación web, Vercel y SEO."
                          : group.id === "systems-networking"
                            ? "Fundamentos de redes, hardware y sistemas."
                            : group.id === "vendor-tools"
                              ? "Formación en respaldo, recuperación y seguridad."
                              : "Cursos FAA de drones completados en 2020."
                      }
                    />
                  </p>
                </div>
                <small>
                  {group.credentialLabels.length}{" "}
                  <T en="credentials" es="credenciales" />
                </small>
              </summary>
              <div className="joe-proof-group-body">
                <ul>
                  {group.credentialLabels.map((label) => {
                    const credential = byLabel.get(label);

                    if (!credential) {
                      return null;
                    }

                    const credentialMeta = [
                      credential.issuer,
                      credential.issued,
                      credential.period,
                    ]
                      .filter(Boolean)
                      .join(" / ");
                    const credentialMetaSpanish = [
                      credential.issuer,
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
                      <li key={label}>
                        <strong>{label}</strong>
                        <span>
                          <T en={credentialMeta} es={credentialMetaSpanish} />
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </details>
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
  const section = portfolioSection("community");
  const visibleMoments = moments.slice(0, 3);

  return (
    <section
      aria-labelledby="community-title"
      className="joe-section joe-community"
      data-section-id="community"
      data-section-trace="product"
      id="community"
    >
      <div className="site-shell">
        <div className="joe-section-head" data-joe-reveal>
          <SectionLabel section={section} />
          <h2 id="community-title" tabIndex={-1}>
            <T en="Community" es="Comunidad" />
          </h2>
          <p>
            <T
              en={section.copy.detail}
              es="Fotos de React Miami 2026."
            />
          </p>
        </div>
        <div
          aria-label="React Miami contact sheet"
          className="joe-photo-sheet"
          role="list"
          tabIndex={0}
        >
          {visibleMoments.map((moment, index) => (
            <figure
              data-featured={moment.title === "ThePrimeagen"}
              key={`${moment.code}-${moment.media.src}`}
              role="listitem"
            >
              <span className="joe-photo-frame">
                <Image
                  alt={moment.media.alt}
                  className="joe-cover-image"
                  fetchPriority={index === 0 ? "high" : undefined}
                  fill
                  loading={index === 0 ? "eager" : undefined}
                  sizes={
                    moment.title === "ThePrimeagen"
                      ? "(max-width: 760px) 82vw, 30vw"
                      : "(max-width: 760px) 70vw, 18vw"
                  }
                  src={moment.media.src}
                />
              </span>
              <figcaption>
                <span className="joe-photo-code">{moment.code}</span>
                {moment.title === "ThePrimeagen"
                  ? (
                    <T
                      en="With ThePrimeagen at React Miami 2026."
                      es="Con ThePrimeagen en React Miami 2026."
                    />
                  )
                  : (
                    <T en={moment.title} es={communityTitleEs(moment.title)} />
                  )}
              </figcaption>
            </figure>
          ))}
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
      <CredentialsSection
        credentials={props.learningCredentials}
        groups={credentialGroups}
      />
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
