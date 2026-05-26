import Link from "next/link";

import { PrimaryNav } from "@/components/site/primary-nav";
import { SiteCommandNav } from "@/components/site/site-command-nav";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { type NavHref } from "@/lib/site-data";

function isInternalRouteHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

function BrandMark({ homeHref }: { homeHref: string }) {
  const content = (
    <span className="text-sm font-medium text-foreground">
      Joe Simo
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
  const showCommandNavigation = surface !== "home";
  const surfaceClassName =
    surface === "home"
      ? "site-header site-header-home sticky top-0 z-40 border-b border-border/70 bg-background/88 pt-[env(safe-area-inset-top)] backdrop-blur-xl"
      : "site-header sticky top-0 z-40 border-b border-border/70 bg-background/88 pt-[env(safe-area-inset-top)] backdrop-blur-xl";

  return (
    <header className={surfaceClassName}>
      <div className="site-header-shell flex min-h-14 items-center justify-between gap-3 sm:gap-4">
        <BrandMark homeHref={homeHref} />

        {showPrimaryNavigation ? (
          <PrimaryNav activeHref={activeHref} sectionPrefix={sectionPrefix} />
        ) : null}

        <div className="flex items-center gap-2">
          {showPrimaryNavigation && showCommandNavigation ? (
            <SiteCommandNav sectionPrefix={sectionPrefix} />
          ) : null}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
