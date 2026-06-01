import Link from "next/link";
import Image from "next/image";

import { LanguageToggle } from "@/components/site/language-toggle";
import { PrimaryNav } from "@/components/site/primary-nav";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { navItems, type NavHref } from "@/lib/site-data";

function isInternalRouteHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

function BrandMark({ homeHref }: { homeHref: string }) {
  const content = (
    <span className="site-brand-lockup">
      <span aria-hidden="true" className="site-brand-monogram">
        <Image
          alt=""
          className="site-brand-avatar"
          height={20}
          src="/media/joe-simo-x-avatar.webp"
          width={20}
        />
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
  const primaryNavItems = navItems;
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
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
