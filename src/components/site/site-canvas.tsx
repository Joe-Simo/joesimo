import { SiteCanvasDesktopLoader } from "@/components/site/site-canvas-desktop-loader";
import { SiteIcon } from "@/components/site/site-icons";
import { siteRecords } from "@/lib/site-data";
import { cn } from "@/lib/utils";

const accentClasses = {
  ink: "border-foreground/45 text-foreground",
  signal: "border-[var(--workbench-accent)]/70 text-[var(--workbench-accent)]",
  green: "border-[var(--workbench-green)]/70 text-[var(--workbench-green)]",
  red: "border-[var(--workbench-red)]/70 text-[var(--workbench-red)]",
} as const;

export function SiteCanvas() {
  return (
    <>
      <SiteCanvasMobile />
      <SiteCanvasDesktopLoader />
    </>
  );
}

function SiteCanvasMobile() {
  const records = siteRecords.filter((record) => record.id !== "home");

  return (
    <div
      className="overflow-hidden rounded-[1.25rem] border border-border bg-background md:hidden"
      aria-label="Joe Simo operating map"
    >
      <div className="relative min-h-36 border-b border-border p-4">
        <div className="absolute left-8 right-8 top-1/2 h-px bg-border" />
        <div className="relative mx-auto grid size-24 place-items-center rounded-full border border-foreground/30 bg-background shadow-[0_18px_60px_oklch(0.145_0_0_/_0.08)]">
          <span className="font-pixel text-[10px] uppercase text-muted-foreground">
            Joe Simo
          </span>
        </div>
      </div>

      <div className="flex snap-x gap-3 overflow-x-auto p-4">
        {records.map((record) => (
          <a
            key={record.id}
            href={record.primaryAction.href}
            target={record.primaryAction.external ? "_blank" : undefined}
            rel={record.primaryAction.external ? "noreferrer" : undefined}
            className="group grid min-w-[76%] snap-start gap-4 rounded-lg border border-border bg-background p-4 outline-none transition hover:-translate-y-0.5 hover:border-foreground/35 focus-visible:border-foreground focus-visible:ring-3 focus-visible:ring-ring/35"
          >
            <span className="flex items-start justify-between gap-4">
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-md border",
                  accentClasses[record.accent],
                )}
              >
                <SiteIcon iconKey={record.iconKey} aria-hidden />
              </span>
              <span className="font-mono text-[11px] uppercase text-muted-foreground">
                {record.kind === "shelf" ? "area" : record.kind}
              </span>
            </span>
            <span className="grid gap-1">
              <span className="text-lg font-medium">{record.label}</span>
              <span className="text-sm leading-6 text-muted-foreground">
                {record.status}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase text-muted-foreground transition group-hover:text-foreground">
              {record.primaryAction.label}
              <SiteIcon iconKey="arrowUpRight" aria-hidden />
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
