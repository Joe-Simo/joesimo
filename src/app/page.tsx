import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { MethodTraceInstrument } from "@/components/site/method-trace-instrument";
import { SiteCanvasMobile } from "@/components/site/site-canvas";
import { SiteCanvasDesktop } from "@/components/site/site-canvas-desktop-loader";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteIcon } from "@/components/site/site-icons";
import { Sim0ProofInstrument } from "@/components/site/sim0-proof-instrument";
import {
  desktopCanvasRecords,
  featuredWork,
  githubRepositories,
  heroCopy,
  mobileCanvasOriginRecord,
  mobileCanvasRecords,
  proofItems,
  profileFacts,
  profileMedia,
  sim0ProofPoints,
  socialChannels,
  siteRecords,
  type IconKey,
  type ProofItem,
  type SiteAction,
  type SiteNodeId,
  type SiteRecord,
  type WorkArtifact,
} from "@/lib/site-data";
import { cn } from "@/lib/utils";

const contactEmail = socialChannels.find((channel) => channel.label === "Email");
const contactChannels = socialChannels.filter(
  (channel) => channel.label !== "Email",
);
const trailChannels = socialChannels.filter((channel) =>
  ["GitHub", "X", "Instagram", "LinkedIn", "YouTube"].includes(channel.label),
);

const viewWorkAction: SiteAction = {
  id: "view-work-hero",
  label: "View Work",
  href: "#work",
  kind: "section",
};

const heroQuickActions: SiteAction[] = [
  ...(contactEmail
    ? [
        {
          id: "email-joe-hero",
          label: "Email Joe",
          href: contactEmail.href,
          kind: "primary" as const,
        },
      ]
    : []),
  viewWorkAction,
];

function getRecord(id: SiteNodeId) {
  const record = siteRecords.find((candidate) => candidate.id === id);

  if (!record) {
    throw new Error(`Missing site record: ${id}`);
  }

  return record;
}

const joeRecord = getRecord("joe");
const methodRecord = getRecord("method");
const workRecord = getRecord("work");
const trailRecord = getRecord("trail");
const contactRecord = getRecord("contact");

function isExternalHref(href: string) {
  return href.startsWith("http");
}

function isInternalRouteHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

function actionTargetProps(action: SiteAction) {
  return action.external
    ? {
        target: "_blank",
        rel: "noreferrer",
      }
    : {};
}

function ExternalCue({ show }: { show: boolean }) {
  return show ? <span className="sr-only">opens in a new tab</span> : null;
}

function linkTargetProps(href: string) {
  return isExternalHref(href)
    ? {
        target: "_blank",
        rel: "noreferrer",
      }
    : {};
}

function TextLink({
  action,
  quiet = false,
}: {
  action: SiteAction;
  quiet?: boolean;
}) {
  const className = cn(
    "inline-flex min-h-11 w-fit items-center gap-2 rounded-md border px-4 font-mono text-[10px] uppercase tracking-[0.14em] outline-none transition focus-visible:ring-3 focus-visible:ring-ring/35",
    quiet
      ? "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
      : "border-border text-foreground hover:border-foreground/35",
  );

  if (isInternalRouteHref(action.href)) {
    return (
      <Link href={action.href} className={className}>
        {action.label}
        <SiteIcon iconKey="arrowUpRight" aria-hidden />
        <ExternalCue show={Boolean(action.external)} />
      </Link>
    );
  }

  return (
    <a
      href={action.href}
      {...actionTargetProps(action)}
      aria-label={action.ariaLabel}
      className={className}
    >
      {action.label}
      <SiteIcon iconKey="arrowUpRight" aria-hidden />
      <ExternalCue show={Boolean(action.external)} />
    </a>
  );
}

function SocialPill({
  href,
  label,
  iconKey,
}: {
  href: string;
  label: string;
  iconKey: IconKey;
}) {
  return (
    <a
      href={href}
      {...linkTargetProps(href)}
      className="inline-flex min-h-11 min-w-10 items-center gap-2 border-b border-transparent px-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground outline-none transition hover:border-foreground/35 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/35"
    >
      <SiteIcon iconKey={iconKey} aria-hidden />
      {label}
      <ExternalCue show={isExternalHref(href)} />
    </a>
  );
}

function RowLabel({ children }: { children: string }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
      {children}
    </p>
  );
}

function HeroIdentityArtifact({ showImage = true }: { showImage?: boolean }) {
  return (
    <div className="flex max-w-full min-w-0 items-center gap-3">
      {showImage ? (
        <span className="relative grid size-12 overflow-hidden rounded-md border border-border bg-muted">
          <Image
            src={profileMedia.src}
            alt={profileMedia.alt}
            width={profileMedia.width}
            height={profileMedia.height}
            sizes="48px"
            className="size-full object-cover grayscale"
          />
        </span>
      ) : null}
      <span className="grid min-w-0 gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Fort Myers / Devsigner
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground break-words">
          English + Spanish / hello@joesimo.com
        </span>
        <span className="text-sm font-medium leading-none text-foreground">
          Joe Simo
        </span>
      </span>
    </div>
  );
}

function SectionShell({
  action,
  children,
  className,
  record,
  title,
}: {
  action?: SiteAction;
  children: ReactNode;
  className?: string;
  record: SiteRecord;
  title: string;
}) {
  const id = record.sectionAnchor.slice(1);

  return (
    <section
      id={id}
      data-site-node-id={record.id}
      data-trace-entry={record.id}
      tabIndex={-1}
      aria-labelledby={`${id}-title`}
      className={cn(
        "personal-section group grid scroll-mt-24 gap-8 border-t border-border py-16 outline-none md:grid-cols-[10rem_minmax(0,1fr)] md:gap-12 md:py-24 lg:grid-cols-1 lg:gap-7 lg:py-[18vh] xl:grid-cols-[8rem_minmax(0,1fr)] xl:gap-8",
        className,
      )}
    >
      <div className="grid h-fit gap-3 md:sticky md:top-24">
        <RowLabel>{record.label}</RowLabel>
        <span className="hidden size-10 place-items-center rounded-md border border-border text-muted-foreground transition group-hover:border-foreground/35 group-hover:text-foreground md:grid">
          <SiteIcon iconKey={record.iconKey} aria-hidden />
        </span>
        <span className="hidden font-pixel text-[10px] uppercase text-muted-foreground md:block">
          {record.scene.code}
        </span>
      </div>

      <div className="grid min-w-0 gap-8">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div className="grid max-w-3xl gap-3">
            <h2
              id={`${id}-title`}
              className="text-3xl font-medium leading-tight tracking-normal md:text-5xl"
            >
              {title}
            </h2>
            <p className="text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
              {record.detail}
            </p>
          </div>
          {action ? <TextLink action={action} /> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

function HeroIntro({
  className,
  desktop = false,
  mapSlot,
}: {
  className?: string;
  desktop?: boolean;
  mapSlot?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid min-w-0 content-center gap-5 md:gap-6",
        desktop ? "max-w-[38rem]" : "w-full max-w-[26rem]",
        className,
      )}
    >
      <HeroIdentityArtifact showImage={!desktop} />

      <div className="grid gap-5">
        <h1
          className={cn(
            "text-balance font-medium leading-[0.86] tracking-normal",
            desktop
              ? "text-[clamp(5.25rem,9vw,9.5rem)] leading-[0.9]"
              : "text-5xl min-[380px]:text-6xl sm:text-7xl",
          )}
        >
          {heroCopy.title}
        </h1>
        <div className="grid max-w-lg gap-3">
          <p
            className={cn(
              "text-foreground",
              desktop ? "text-lg leading-7" : "text-lg leading-8",
            )}
          >
            {heroCopy.intro}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {heroCopy.detail}
          </p>
        </div>
      </div>

      {!desktop && mapSlot ? <div className="pt-1">{mapSlot}</div> : null}

      {desktop ? (
        <div className="flex flex-wrap gap-3">
          <TextLink action={contactRecord.primaryAction} />
          <TextLink action={viewWorkAction} quiet />
        </div>
      ) : null}
    </div>
  );
}

function SignalStrip({ signal }: { signal: WorkArtifact["signal"] }) {
  return (
    <span className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
      {signal.map((item) => (
        <span key={item} className="border-b border-border pb-1">
          {item}
        </span>
      ))}
    </span>
  );
}

function ProofMedia({ item }: { item: ProofItem }) {
  if (!item.media || item.proofType === "identity") {
    return null;
  }

  const style = {
    aspectRatio: item.crop?.aspectRatio,
  } as CSSProperties;

  return (
    <span
      className="relative block w-full max-w-32 overflow-hidden border border-border bg-background sm:w-24"
      style={style}
      aria-hidden
    >
      <Image
        src={item.media.src}
        alt=""
        width={item.media.width}
        height={item.media.height}
        sizes="128px"
        className="size-full object-cover grayscale"
        style={{ objectPosition: item.crop?.objectPosition }}
      />
    </span>
  );
}

function EvidenceRows() {
  return (
    <div className="grid gap-4 border-t border-border pt-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <RowLabel>Profile marks</RowLabel>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Origin, method, current work
        </span>
      </div>

      <div className="grid border-y border-border">
        {proofItems.map((item) => {
          const content = (
            <>
              <span className="grid min-w-0 gap-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {item.label} / {item.sourceLabel}
                </span>
                <span className="text-sm leading-6 text-foreground">
                  {item.claim}
                </span>
                {item.detail ? (
                  <span className="text-sm leading-6 text-muted-foreground">
                    {item.detail}
                  </span>
                ) : null}
              </span>
              <ProofMedia item={item} />
            </>
          );
          const className =
            "grid min-h-16 gap-4 border-b border-border py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center";

          if (!item.href) {
            return (
              <div key={item.id} className={className}>
                {content}
              </div>
            );
          }

          return (
            <a
              key={item.id}
              href={item.href}
              {...linkTargetProps(item.href)}
              className={cn(
                className,
                "outline-none transition hover:border-foreground/35 focus-visible:ring-3 focus-visible:ring-ring/35",
              )}
            >
              {content}
              <ExternalCue show={isExternalHref(item.href)} />
            </a>
          );
        })}
      </div>
    </div>
  );
}

function WorkStage() {
  return (
    <div className="grid gap-8">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="grid max-w-3xl gap-3">
          <RowLabel>{featuredWork.label}</RowLabel>
          <h3 className="text-3xl font-medium leading-tight">
            {featuredWork.title}
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            {featuredWork.detail}
          </p>
        </div>
        <TextLink action={workRecord.primaryAction} />
      </div>

      <Sim0ProofInstrument artifact={featuredWork} action={workRecord.primaryAction} />

      <div className="work-proof-strip" aria-label="sim0 context">
        {[
          ["Surface", "sim0.com"],
          ["Capture", "Local editor artifact / May 11, 2026"],
          [
            "Focus",
            sim0ProofPoints
              .map((point) => point.visibleLabel)
              .join(" / "),
          ],
        ].map(([label, value]) => (
          <span key={label}>
            <strong>{label}</strong>
            <em>{value}</em>
          </span>
        ))}
      </div>

      <SignalStrip signal={featuredWork.signal} />
    </div>
  );
}

function JoeContextStrip() {
  return (
    <div className="joe-context-strip" aria-label="Joe Simo profile context">
      {profileFacts
        .filter((fact) =>
          ["Location", "Bio", "Telematics background", "Languages"].includes(
            fact.label,
          ),
        )
        .map((fact) => (
          <span key={fact.label}>
            <strong>{fact.label}</strong>
            <em>{fact.value}</em>
          </span>
        ))}
    </div>
  );
}

function MethodStage() {
  return (
    <div className="grid gap-8">
      <JoeContextStrip />

      <p className="method-statement">
        Breakage first. Signal second. Interface last.
      </p>

      <div className="method-origin-note">
        <span className="method-origin-mark" aria-hidden>
          JS
        </span>
        <div className="grid gap-5">
          <div className="grid max-w-3xl gap-3">
            <RowLabel>Working note</RowLabel>
            <p>
              I work from the part of software people actually feel: the moment
              something breaks, stalls, or stops making sense. Support gave me
              that edge. Telematics gave me the signal language. The interface
              is where those two things become useful.
            </p>
          </div>
          <ol className="method-origin-beats" aria-label="Joe Simo working method">
            {[
              ["Support", "Start where the user can describe the break."],
              ["Telematics", "Trace the system state behind it."],
              ["Interface", "Move the next action into view."],
            ].map(([label, detail]) => (
              <li key={label}>
                <strong>{label}</strong>
                <em>{detail}</em>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <MethodTraceInstrument
        emailAction={contactRecord.primaryAction}
        workAction={workRecord.primaryAction}
      />

      <EvidenceRows />
    </div>
  );
}

function LinksStage() {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(18rem,0.65fr)]">
      <div className="grid gap-5">
        {githubRepositories.map((repo) => (
          <a
            key={repo.name}
            href={repo.href}
            {...linkTargetProps(repo.href)}
            className="group grid gap-4 border-t border-border py-5 outline-none transition focus-visible:ring-3 focus-visible:ring-ring/35"
          >
            <span className="grid gap-2">
              <span className="text-xl font-medium leading-snug">
                {repo.name}
              </span>
              <span className="text-sm leading-6 text-muted-foreground">
                {repo.description}
              </span>
            </span>
            <span className="flex flex-wrap gap-3">
              {repo.meta.map((item) => (
                <span
                  key={item}
                  className="border-b border-border pb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
                >
                  {item}
                </span>
              ))}
            </span>
            <span className="inline-flex w-fit items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground">
              View profile
              <SiteIcon iconKey="arrowUpRight" aria-hidden />
              <ExternalCue show />
            </span>
          </a>
        ))}
      </div>

      <div className="grid content-start gap-7">
        <div className="grid gap-3">
          <RowLabel>Public links</RowLabel>
          <div className="grid border-y border-border">
            {trailChannels.map((channel) => (
              <a
                key={channel.label}
                href={channel.href}
                {...linkTargetProps(channel.href)}
                className="group grid grid-cols-[1fr_auto] items-center gap-4 border-b border-border py-4 outline-none transition last:border-b-0 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/35"
              >
                <span className="grid gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {channel.label}
                  </span>
                  <span className="text-sm font-medium">{channel.handle}</span>
                  <span className="text-sm leading-6 text-muted-foreground">
                    {channel.description}
                  </span>
                </span>
                <SiteIcon
                  iconKey={channel.iconKey}
                  className="text-muted-foreground transition group-hover:text-foreground"
                  aria-hidden
                />
                <ExternalCue show={isExternalHref(channel.href)} />
              </a>
            ))}
          </div>
        </div>

        <div className="grid gap-3 border-t border-border py-5">
          <RowLabel>Contact rhythm</RowLabel>
          <p className="text-sm leading-6 text-muted-foreground">
            Public links stay separate from the work. For support, systems, web
            consulting, sim0, or interface work, email is the direct path.
          </p>
        </div>
      </div>
    </div>
  );
}

function ContactStage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.75fr)]">
      <div className="grid gap-5">
        <p className="max-w-2xl text-2xl font-medium leading-snug text-foreground md:text-4xl">
          Tell me what is stuck.
        </p>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
          Support, systems, web consulting, sim0, interface work, or a clean
          introduction all fit here. English and Spanish are both fine.
        </p>
        {contactEmail ? (
          <SocialPill
            href={contactEmail.href}
            label={contactEmail.handle}
            iconKey={contactEmail.iconKey}
          />
        ) : null}
      </div>

      <div className="grid content-start gap-3">
        <RowLabel>Public handles</RowLabel>
        <div className="flex flex-wrap gap-x-3 gap-y-2">
          {contactChannels.map((channel) => (
            <SocialPill
              key={channel.label}
              href={channel.href}
              label={channel.label}
              iconKey={channel.iconKey}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div id="top" className="min-h-screen overflow-x-clip bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-background focus:px-4 focus:py-3 focus:text-sm focus:shadow-lg focus:ring-3 focus:ring-ring/35"
      >
        Skip to content
      </a>

      <SiteHeader />

      <main id="main-content" tabIndex={-1}>
        <div
          id="joe"
          data-site-node-id={joeRecord.id}
          className="signal-hero relative isolate overflow-x-clip border-b border-border"
        >
          <span className="workbench-backdrop" aria-hidden />
          <div className="site-page-shell relative z-10 grid w-full gap-7 pb-20 pt-7 lg:max-w-[100rem] lg:grid-cols-1 lg:items-start lg:gap-10 lg:pb-24 lg:pt-0">
            <div className="grid gap-5 lg:hidden">
              <HeroIntro
                mapSlot={
                  <SiteCanvasMobile
                    originRecord={mobileCanvasOriginRecord}
                    records={mobileCanvasRecords}
                    quickActions={heroQuickActions}
                  />
                }
              />
            </div>

            <div className="relative hidden min-w-0 max-w-full lg:sticky lg:top-16 lg:block lg:h-[calc(100svh-4rem)]">
              <div className="pointer-events-none absolute bottom-[clamp(2rem,5vw,4.5rem)] left-[clamp(2rem,5vw,5rem)] z-20 w-[min(42rem,44%)]">
                <HeroIntro desktop className="pointer-events-auto" />
              </div>
              <SiteCanvasDesktop
                records={desktopCanvasRecords}
                quickActions={heroQuickActions}
              />
            </div>

            <div className="mx-auto grid w-full gap-1 lg:max-w-[78rem]">
              <SectionShell
                record={methodRecord}
                title="Support, systems, and interfaces."
                action={methodRecord.primaryAction}
              >
                <MethodStage />
              </SectionShell>

              <SectionShell
                record={workRecord}
                title="Current work: sim0.com."
                action={workRecord.primaryAction}
                className="work-section"
              >
                <WorkStage />
              </SectionShell>

              <SectionShell
                record={trailRecord}
                title="Public links are simple."
                action={trailRecord.primaryAction}
              >
                <LinksStage />
              </SectionShell>

              <SectionShell
                record={contactRecord}
                title="Email Joe."
                action={contactRecord.primaryAction}
              >
                <ContactStage />
              </SectionShell>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
