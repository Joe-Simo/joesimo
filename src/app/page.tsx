import { ArrowRight, ExternalLink, Mail } from "lucide-react";

import { MicroPlayground } from "@/components/site/micro-playground";
import { SiteCanvas } from "@/components/site/site-canvas";
import { SocialLinks } from "@/components/site/social-links";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  contactLink,
  navItems,
  portfolioAreas,
  workPrinciples,
} from "@/lib/site-data";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
          <a href="#" className="text-lg font-semibold tracking-normal">
            joesimo.com
          </a>
          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-1 md:flex"
          >
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <Button render={<a href={contactLink.href} />} nativeButton={false}>
            <Mail data-icon="inline-start" />
            {contactLink.label}
          </Button>
        </div>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-10 lg:py-24">
          <div className="flex flex-col gap-7">
            <div className="flex flex-col gap-5">
              <h1 className="max-w-2xl text-5xl font-semibold leading-[0.95] tracking-normal sm:text-6xl lg:text-7xl">
                Joe Simo / joesimo.com
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                A minimal personal site for work, apps, design, writing, and
                tiny interactions that reward curiosity without getting loud.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                render={<a href="#work" />}
                nativeButton={false}
                className="h-10"
              >
                See the work
                <ArrowRight data-icon="inline-end" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={<a href="/blog" />}
                nativeButton={false}
                className="h-10"
              >
                Open blog
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Next.js</Badge>
              <Badge variant="outline">Tailwind CSS</Badge>
              <Badge variant="outline">shadcn/ui</Badge>
              <Badge variant="outline">micro-interactions</Badge>
            </div>
          </div>

          <SiteCanvas />
        </section>

        <MicroPlayground />

        <section
          id="work"
          className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-10 sm:px-8 lg:px-10"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex max-w-2xl flex-col gap-3">
              <h2 className="text-3xl font-semibold tracking-normal sm:text-4xl">
                Portfolio map.
              </h2>
              <p className="text-sm leading-6 text-muted-foreground sm:text-base">
                The structure is ready for real apps, case studies, design
                snapshots, and blog entries. I left fake content out on purpose.
              </p>
            </div>
            <Button
              variant="outline"
              render={<a href="https://github.com/joe-simo" target="_blank" />}
              nativeButton={false}
            >
              GitHub profile
              <ExternalLink data-icon="inline-end" />
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {portfolioAreas.map((area) => {
              const Icon = area.icon;

              return (
                <Card
                  key={area.value}
                  id={area.value === "work" ? undefined : area.value}
                  className="rounded-lg border-foreground/10 bg-background shadow-none transition duration-300 hover:-translate-y-0.5 hover:border-foreground/30"
                >
                  <CardHeader>
                    <span className="grid size-9 place-items-center rounded-lg border border-border text-foreground">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <CardTitle className="text-2xl font-semibold tracking-normal">
                      {area.title}
                    </CardTitle>
                    <CardAction>
                      <a
                        href={area.href}
                        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                      >
                        {area.action}
                        <ArrowRight className="size-3.5" aria-hidden="true" />
                      </a>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {area.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section
          id="design"
          className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-10 sm:px-8 lg:px-10"
        >
          <div className="grid gap-3 md:grid-cols-3">
            {workPrinciples.map((principle) => {
              const Icon = principle.icon;

              return (
                <Card
                  key={principle.title}
                  className="rounded-lg border-foreground/10 bg-muted/20 shadow-none"
                >
                  <CardHeader>
                    <span className="grid size-9 place-items-center rounded-lg border border-border bg-background text-foreground">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <CardTitle>{principle.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {principle.body}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-10 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl font-semibold tracking-normal sm:text-4xl">
              Social and profile links.
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Simple exits to the places people usually check first.
            </p>
          </div>
          <SocialLinks />
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-10 sm:px-8 lg:px-10">
        <Separator />
        <div className="flex flex-col justify-between gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <a href="#" className="text-lg font-semibold text-foreground">
            joesimo.com
          </a>
          <p>Minimal personal page for Joe Simo.</p>
        </div>
      </footer>
    </div>
  );
}
