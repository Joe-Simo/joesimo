import { MobileNav } from "@/components/site/mobile-nav";
import { SiteCanvas } from "@/components/site/site-canvas";
import { SiteIcon } from "@/components/site/site-icons";
import { SocialLinks } from "@/components/site/social-links";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  contactLink,
  heroCopy,
  navItems,
  shelfRecords,
  socialChannels,
} from "@/lib/site-data";

const githubLink = socialChannels.find((channel) => channel.label === "GitHub");

export default function Home() {
  return (
    <div
      id="top"
      className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background"
    >
      <header className="sticky top-0 z-40 border-b border-border bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[88rem] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
          <a
            href="#top"
            className="font-pixel text-sm uppercase tracking-normal outline-none transition hover:text-[var(--workbench-accent)] focus-visible:text-[var(--workbench-accent)]"
          >
            joesimo.com
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-1 md:flex"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground outline-none transition hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <MobileNav />
            <Button
              render={<a href={contactLink.href} />}
              nativeButton={false}
              className="hidden h-9 sm:inline-flex"
            >
              <SiteIcon iconKey="mail" data-icon="inline-start" />
              Email
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-[88rem] content-center gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[0.38fr_0.62fr] lg:px-10">
          <div className="relative z-10 flex min-w-0 flex-col justify-center gap-7 lg:pb-16">
            <div className="flex flex-col gap-5">
              <p className="font-pixel text-xs uppercase text-muted-foreground">
                operating map
              </p>
              <h1 className="max-w-2xl text-6xl font-medium leading-[0.9] tracking-normal sm:text-7xl lg:text-8xl">
                {heroCopy.title}
              </h1>
              <p className="max-w-xl text-xl leading-8 text-foreground sm:text-2xl sm:leading-9">
                {heroCopy.intro}
              </p>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                {heroCopy.detail}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {githubLink ? (
                <Button
                  size="lg"
                  render={
                    <a
                      href={githubLink.href}
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                  nativeButton={false}
                  className="h-10"
                >
                  <SiteIcon iconKey="github" data-icon="inline-start" />
                  GitHub
                </Button>
              ) : null}
              <Button
                size="lg"
                variant="outline"
                render={<a href="#links" />}
                nativeButton={false}
                className="h-10"
              >
                <SiteIcon iconKey="arrowUpRight" data-icon="inline-start" />
                Links
              </Button>
            </div>
          </div>

          <div className="min-w-0 lg:-ml-10">
            <SiteCanvas />
          </div>
        </section>

        <section
          id="work"
          className="mx-auto grid w-full max-w-[88rem] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.28fr_0.72fr] lg:px-10"
        >
          <div className="flex flex-col gap-3">
            <p className="font-pixel text-xs uppercase text-muted-foreground">
              index
            </p>
            <h2 className="text-3xl font-medium tracking-normal sm:text-4xl">
              Public surfaces
            </h2>
          </div>

          <div className="grid border-y border-border">
            {shelfRecords.map((record) => (
              <article
                key={record.id}
                id={record.id}
                className="grid gap-4 border-b border-border py-5 last:border-b-0 sm:grid-cols-[11rem_1fr_auto] sm:items-center"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-md border border-border bg-background">
                    <SiteIcon iconKey={record.iconKey} aria-hidden />
                  </span>
                  <h3 className="font-medium">{record.label}</h3>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {record.status}
                </p>
                <a
                  href={record.primaryAction.href}
                  target={record.primaryAction.external ? "_blank" : undefined}
                  rel={record.primaryAction.external ? "noreferrer" : undefined}
                  className="inline-flex h-8 w-fit items-center gap-1.5 rounded-md px-2.5 font-mono text-[11px] uppercase text-muted-foreground outline-none transition hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-ring/35"
                >
                  {record.primaryAction.label}
                  <SiteIcon iconKey="arrowUpRight" aria-hidden />
                </a>
              </article>
            ))}
          </div>
        </section>

        <section
          id="links"
          className="mx-auto grid w-full max-w-[88rem] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.28fr_0.72fr] lg:px-10"
        >
          <div className="flex flex-col gap-3">
            <p className="font-pixel text-xs uppercase text-muted-foreground">
              exits
            </p>
            <h2 className="text-3xl font-medium tracking-normal sm:text-4xl">
              Profiles
            </h2>
          </div>
          <SocialLinks />
        </section>

        <section
          id="contact"
          className="mx-auto grid w-full max-w-[88rem] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.28fr_0.72fr] lg:px-10"
        >
          <div className="flex flex-col gap-3">
            <p className="font-pixel text-xs uppercase text-muted-foreground">
              contact
            </p>
            <h2 className="text-3xl font-medium tracking-normal sm:text-4xl">
              Send a note
            </h2>
          </div>
          <div className="flex flex-col gap-5 border-y border-border py-6">
            <p className="max-w-2xl text-lg leading-8 text-foreground">
              Reach out about work, apps, design, writing, or a useful
              introduction.
            </p>
            <Button
              render={<a href={contactLink.href} />}
              nativeButton={false}
              className="h-10 w-fit"
            >
              <SiteIcon iconKey="mail" data-icon="inline-start" />
              {contactLink.handle}
            </Button>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-[88rem] flex-col gap-5 px-5 py-10 sm:px-8 lg:px-10">
        <Separator />
        <div className="flex flex-col justify-between gap-5 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <a
            href="#top"
            className="font-pixel text-xs uppercase text-foreground outline-none transition hover:text-[var(--workbench-accent)] focus-visible:text-[var(--workbench-accent)]"
          >
            Joe Simo
          </a>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {socialChannels.map((channel) => (
              <a
                key={channel.label}
                href={channel.href}
                target={channel.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={
                  channel.href.startsWith("mailto:") ? undefined : "noreferrer"
                }
                className="outline-none transition hover:text-foreground focus-visible:text-foreground"
              >
                {channel.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
