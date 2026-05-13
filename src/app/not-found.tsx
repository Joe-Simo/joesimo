import Link from "next/link";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteIcon } from "@/components/site/site-icons";
import { siteRecords } from "@/lib/site-data";

const featuredRecords = siteRecords.filter((record) =>
  ["work", "trail", "contact"].includes(record.id),
);
const notFoundCopy =
  "The direct paths are home, work, links, and email.";

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
            <p className="font-pixel text-[10px] uppercase tracking-normal text-muted-foreground">
              404 / Lost path
            </p>
            <h1 className="text-5xl font-semibold leading-none tracking-normal sm:text-6xl lg:text-7xl">
              This path does not resolve.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {notFoundCopy}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-foreground bg-foreground px-4 text-sm font-medium text-background outline-none transition hover:border-[color:var(--signal-accent)] focus-visible:ring-3 focus-visible:ring-ring/35"
            >
              <SiteIcon iconKey="home" aria-hidden />
              Home
            </Link>
            <Link
              href="/#work"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium outline-none transition hover:border-[color:var(--signal-accent)] focus-visible:ring-3 focus-visible:ring-ring/35"
            >
              <SiteIcon iconKey="appWindow" aria-hidden />
              Work
            </Link>
            <Link
              href="/#trail"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium outline-none transition hover:border-[color:var(--signal-accent)] focus-visible:ring-3 focus-visible:ring-ring/35"
            >
              <SiteIcon iconKey="bookOpen" aria-hidden />
              Links
            </Link>
            <a
              href="mailto:hello@joesimo.com"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium outline-none transition hover:border-[color:var(--signal-accent)] focus-visible:ring-3 focus-visible:ring-ring/35"
            >
              <SiteIcon iconKey="mail" aria-hidden />
              Email
            </a>
          </div>

          <div className="grid border-y border-border">
            {featuredRecords.map((record) => (
              <Link
                key={record.id}
                href={`/${record.sectionAnchor}`}
                className="grid gap-3 border-b border-border py-5 outline-none transition last:border-b-0 hover:border-[color:var(--signal-accent)] focus-visible:ring-3 focus-visible:ring-ring/35 md:grid-cols-[8rem_minmax(0,1fr)]"
              >
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  <SiteIcon iconKey={record.iconKey} aria-hidden />
                  {record.label}
                </div>
                <span className="grid gap-1">
                  <span className="text-lg font-medium leading-snug">
                    {record.status}
                  </span>
                  <span className="text-sm leading-6 text-muted-foreground">
                    {record.detail}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
