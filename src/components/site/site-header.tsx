import Link from "next/link";

import { LanguageToggle } from "@/components/site/language-toggle";
import { PrimaryNav } from "@/components/site/primary-nav";
import {
  SiteCommandNav,
  type CommandGroup,
  type CommandText,
} from "@/components/site/site-command-nav";
import { ThemeToggle } from "@/components/site/theme-toggle";
import {
  communityHighlights,
  isHomepageProject,
  navItems,
  projectCaseStudiesPublic,
  socialChannels,
  type NavHref,
} from "@/lib/site-data";

function isInternalRouteHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

function resolveNavHref(href: NavHref | `#${string}`, sectionPrefix: string) {
  return href.startsWith("#") ? `${sectionPrefix}${href}` : href;
}

function commandText(en: string, es = en): CommandText {
  return { en, es };
}

function commandProfileDescription(label: string) {
  switch (label) {
    case "X":
      return commandText("Public notes and updates.", "Notas públicas y actualizaciones.");
    case "GitHub":
      return commandText("Code and public repositories.", "Código y repositorios públicos.");
    case "LinkedIn":
      return commandText("Work history and credentials.", "Experiencia y credenciales.");
    case "Instagram":
      return commandText("Photos and public moments.", "Fotos y momentos públicos.");
    default:
      return commandText("Public profile.", "Perfil público.");
  }
}

function buildCommandGroups(sectionPrefix: string): CommandGroup[] {
  const sectionItems = [
    {
      description: commandText(
        "Return to the first page section.",
        "Volver a la primera sección.",
      ),
      href: resolveNavHref("#joe", sectionPrefix),
      iconKey: "home" as const,
      label: commandText("Joe"),
      meta: commandText("Start", "Inicio"),
    },
    ...navItems.map((item) => ({
      description: commandText(
        `Jump to ${item.label.toLowerCase()}.`,
        `Ir a ${item.label === "Work" ? "trabajo" : item.label === "Systems" ? "sistemas" : item.label === "Credentials" ? "credenciales" : item.label === "Community" ? "comunidad" : item.label === "Contact" ? "contacto" : "blog"}.`,
      ),
      href: resolveNavHref(item.href, sectionPrefix),
      iconKey: item.iconKey,
      label: commandText(
        item.label,
        item.label === "Work"
          ? "Trabajo"
          : item.label === "Systems"
            ? "Sistemas"
            : item.label === "Credentials"
              ? "Credenciales"
              : item.label === "Community"
                ? "Comunidad"
                : item.label === "Contact"
                  ? "Contacto"
                  : item.label,
      ),
      meta: commandText("Section", "Sección"),
    })),
  ];

  const workItems = [...projectCaseStudiesPublic]
    .filter(isHomepageProject)
    .filter((project) => project.assets.length > 0)
    .sort((left, right) => {
      const dateOrder = right.started.sortKey.localeCompare(left.started.sortKey);

      return dateOrder || left.title.localeCompare(right.title);
    })
    .map((project) => ({
      description: commandText(
        `Open the ${project.title} project row.`,
        `Abrir la fila del proyecto ${project.title}.`,
      ),
      href: resolveNavHref(`#work-${project.slug}`, sectionPrefix),
      iconKey: "appWindow" as const,
      label: commandText(project.title),
      meta: commandText(project.started.label),
    }));

  const momentItems = communityHighlights.slice(0, 4).map((artifact) => ({
    description: commandText(
      "Open the React Miami contact sheet.",
      "Abrir la hoja de fotos de React Miami.",
    ),
    href: resolveNavHref("#community", sectionPrefix),
    iconKey: "camera" as const,
    label: commandText(
      artifact.title,
      artifact.title === "React Miami room"
        ? "Sala de React Miami"
        : artifact.title === "Builder table"
          ? "Mesa de builders"
          : artifact.title === "Audience frame"
            ? "Audiencia"
            : artifact.title,
    ),
    meta: commandText(artifact.code),
  }));

  const profileItems = socialChannels
    .filter((channel) => channel.href.startsWith("http"))
    .map((channel) => ({
      description: commandProfileDescription(channel.label),
      external: true,
      href: channel.href,
      iconKey: channel.iconKey,
      label: commandText(channel.label),
      meta: commandText(channel.handle),
    }));

  return [
    { label: commandText("Sections", "Secciones"), items: sectionItems },
    { label: commandText("Work", "Trabajo"), items: workItems },
    { label: commandText("Community", "Comunidad"), items: momentItems },
    { label: commandText("Profiles", "Perfiles"), items: profileItems },
  ];
}

function BrandMark({ homeHref }: { homeHref: string }) {
  const content = (
    <span className="site-brand-lockup">
      <span aria-hidden="true" className="site-brand-monogram">
        JS
      </span>
      <span className="font-mono text-sm font-medium text-foreground">
        Joe Simo
      </span>
    </span>
  );

  const className =
    "inline-flex min-h-11 shrink-0 items-center rounded-md outline-none transition hover:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/30";

  if (isInternalRouteHref(homeHref)) {
    return (
      <Link href={homeHref} aria-label="Joe Simo home" className={className}>
        {content}
      </Link>
    );
  }

  return (
    <a href={homeHref} aria-label="Joe Simo home" className={className}>
      {content}
    </a>
  );
}

export function SiteHeader({
  homeHref = "#joe",
  sectionPrefix = "",
  activeHref,
  surface = "default",
}: {
  homeHref?: string;
  sectionPrefix?: string;
  activeHref?: NavHref;
  surface?: "default" | "home";
}) {
  const showPrimaryNavigation = true;
  const showCommandNavigation = true;
  const commandGroups = buildCommandGroups(sectionPrefix);
  const primaryNavItems = navItems.filter((item) =>
    item.label === "Work" || item.label === "Contact"
  );
  const surfaceClassName =
    surface === "home"
      ? "site-header site-header-home sticky top-0 z-40 border-b border-border/70 bg-background/88 pt-[env(safe-area-inset-top)] backdrop-blur-xl"
      : "site-header sticky top-0 z-40 border-b border-border/70 bg-background/88 pt-[env(safe-area-inset-top)] backdrop-blur-xl";

  return (
    <header className={surfaceClassName}>
      <div className="site-header-shell flex min-h-14 items-center justify-between gap-3 sm:gap-4">
        <BrandMark homeHref={homeHref} />

        {showPrimaryNavigation ? (
          <PrimaryNav
            activeHref={activeHref}
            items={primaryNavItems}
            sectionPrefix={sectionPrefix}
          />
        ) : null}

        <div className="flex items-center gap-2">
          {showPrimaryNavigation && showCommandNavigation ? (
            <SiteCommandNav
              groups={commandGroups}
            />
          ) : null}
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
