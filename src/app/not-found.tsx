import Link from "next/link";
import type { Metadata } from "next";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteIcon } from "@/components/site/site-icons";
import { LocalizedText as T } from "@/components/site/localized-text";
import { ButtonLink } from "@/components/ui/button";
import { socialChannels } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "404 / joesimo.com",
  description: "The requested joesimo.com path does not resolve.",
  robots: {
    index: false,
    follow: false,
  },
};

const featuredLinks = [
  {
    detail: "Public and private GitHub project signals.",
    detailEs: "Señales de proyectos públicos y privados en GitHub.",
    href: "/#work",
    iconKey: "appWindow" as const,
    label: "Work",
    labelEs: "Trabajo",
    status: "GitHub projects",
    statusEs: "Proyectos en GitHub",
  },
  {
    detail: "System administration and recovery roles that shaped the work.",
    detailEs:
      "Roles de administración de sistemas y recuperación que dieron forma al trabajo.",
    href: "/#systems",
    iconKey: "briefcase" as const,
    label: "Systems",
    labelEs: "Sistemas",
    status: "Practical systems background",
    statusEs: "Base práctica de sistemas",
  },
  {
    detail: "Certification issuers and training records.",
    detailEs: "Emisores de certificaciones y registros de formación.",
    href: "/#credentials",
    iconKey: "bookOpen" as const,
    label: "Certifications",
    labelEs: "Certificaciones",
    status: "Training record",
    statusEs: "Registro de formación",
  },
  {
    detail: "React Miami contact sheet and public profile exits.",
    detailEs:
      "Hoja de contacto de React Miami y salidas a perfiles públicos.",
    href: "/#community",
    iconKey: "camera" as const,
    label: "Community",
    labelEs: "Comunidad",
    status: "Owned event media",
    statusEs: "Medios propios de eventos",
  },
];

export default function NotFound() {
  return (
    <div id="top" className="min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-background focus:px-4 focus:py-3 focus:text-sm focus:shadow-lg focus:ring-3 focus:ring-ring/35"
      >
        Skip to content
      </a>

      <SiteHeader homeHref="/" sectionPrefix="/" />

      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-[calc(100svh-4rem)] px-5 py-10 sm:px-8 lg:px-10"
      >
        <section className="mx-auto flex w-full max-w-[22rem] flex-col gap-10 py-8 sm:max-w-[78rem] lg:min-h-[34rem] lg:justify-center">
          <div className="grid max-w-3xl gap-5">
            <p className="text-label-12-mono uppercase text-muted-foreground">
              <T en="404 / Lost path" es="404 / Ruta perdida" />
            </p>
            <h1 className="text-heading-56">
              <T
                en="This Path Does Not Resolve"
                es="Esta ruta no existe."
              />
            </h1>
            <p className="max-w-2xl text-copy-16 text-muted-foreground">
              <T
                en="The direct paths are home, work, systems, certifications, community, and contact."
                es="Las rutas directas son inicio, trabajo, sistemas, certificaciones, comunidad y contacto."
              />
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/">
              <SiteIcon iconKey="home" aria-hidden />
              <T en="Home" es="Inicio" />
            </ButtonLink>
            <ButtonLink href="/#work" variant="outline">
              <SiteIcon iconKey="appWindow" aria-hidden />
              <T en="Work" es="Trabajo" />
            </ButtonLink>
            <ButtonLink href="/#credentials" variant="outline">
              <SiteIcon iconKey="bookOpen" aria-hidden />
              <T en="Certifications" es="Certificaciones" />
            </ButtonLink>
          </div>

          <div className="grid border-y border-border">
            {featuredLinks.map((record) => (
              <Link
                key={record.href}
                href={record.href}
                className="grid gap-3 border-b border-border py-5 outline-none transition last:border-b-0 hover:border-[color:var(--signal-accent)] focus-visible:ring-3 focus-visible:ring-ring/35 md:grid-cols-[8rem_minmax(0,1fr)]"
              >
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  <SiteIcon iconKey={record.iconKey} aria-hidden />
                  <T en={record.label} es={record.labelEs} />
                </div>
                <span className="grid gap-1">
                  <span className="text-lg font-medium leading-snug">
                    <T en={record.status} es={record.statusEs} />
                  </span>
                  <span className="text-sm leading-6 text-muted-foreground">
                    <T en={record.detail} es={record.detailEs} />
                  </span>
                </span>
              </Link>
            ))}
          </div>
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
