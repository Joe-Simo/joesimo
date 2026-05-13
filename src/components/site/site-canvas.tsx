"use client";

import {
  type CSSProperties,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { SiteIcon } from "@/components/site/site-icons";
import {
  scrollToExperienceSection,
  useSiteExperienceState,
} from "@/components/site/use-site-experience-state";
import type {
  AccentKey,
  SiteAction,
  SiteCanvasRecord,
  SiteNodeId,
} from "@/lib/site-data";
import { cn } from "@/lib/utils";

const accentClasses: Record<AccentKey, string> = {
  ink: "border-border text-foreground",
  signal: "border-border text-foreground",
  live: "border-border text-foreground",
};

const routeDisplayLabels: Partial<Record<SiteNodeId, string>> = {
  method: "Background",
  work: "Work",
  trail: "Links",
  contact: "Email",
};

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

function normalizeActionHref(href: string) {
  return href.endsWith("/") ? href.slice(0, -1) : href;
}

function getVisibleQuickActions(
  quickActions: readonly SiteAction[],
  record: SiteCanvasRecord,
) {
  const primaryHref = normalizeActionHref(record.primaryAction.href);
  const secondaryHrefs = new Set(
    record.secondaryActions.map((action) => normalizeActionHref(action.href)),
  );

  return [
    ...record.secondaryActions,
    ...quickActions.filter((action) => {
      const href = normalizeActionHref(action.href);

      return href !== primaryHref && !secondaryHrefs.has(href);
    }),
  ].slice(0, 3);
}

function mobilePath(record: SiteCanvasRecord) {
  const target = record.map.mobilePoint;

  return `M 50 50 L ${target.x} ${target.y}`;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function SiteCanvasMobile({
  originRecord,
  quickActions,
  records,
}: {
  originRecord: SiteCanvasRecord;
  quickActions: SiteAction[];
  records: SiteCanvasRecord[];
}) {
  const {
    activeNodeId,
    activeRecord,
    commitNode,
    focusableNodeId,
    navigateWithKeys,
    previewNode,
    tracedNodeId,
    tracedRecord,
    visibleRecords,
  } = useSiteExperienceState(records);
  const [signatureNodeId, setSignatureNodeId] = useState<SiteNodeId | null>(
    null,
  );
  const [signaturePlaying, setSignaturePlaying] = useState(false);
  const signatureTimeoutsRef = useRef<number[]>([]);
  const displayNodeId = signatureNodeId ?? tracedNodeId;
  const displayRecord =
    records.find((record) => record.id === displayNodeId) ?? tracedRecord;
  const visibleQuickActions = getVisibleQuickActions(
    quickActions,
    displayRecord,
  );

  const clearSignatureTrace = useCallback(() => {
    signatureTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    signatureTimeoutsRef.current = [];
    setSignaturePlaying(false);
    setSignatureNodeId(null);
  }, []);

  const startSignatureTrace = useCallback(() => {
    clearSignatureTrace();

    if (prefersReducedMotion()) {
      commitNode("work");
      const workRecord = records.find((record) => record.id === "work");

      if (workRecord) {
        scrollToExperienceSection(workRecord, { focusEntry: true });
      }

      return;
    }

    setSignaturePlaying(true);

    const sequence = [...visibleRecords, records.find((record) => record.id === "work")]
      .filter((record): record is SiteCanvasRecord => Boolean(record));

    sequence.forEach((record, index) => {
      const timeoutId = window.setTimeout(() => {
        setSignatureNodeId(record.id);

        if (index === sequence.length - 1) {
          commitNode(record.id);
          window.setTimeout(() => {
            if (record.id === "work") {
              scrollToExperienceSection(record, { focusEntry: true });
            }
            clearSignatureTrace();
          }, 260);
        }
      }, index * 620);

      signatureTimeoutsRef.current.push(timeoutId);
    });
  }, [clearSignatureTrace, commitNode, records, visibleRecords]);

  useEffect(() => clearSignatureTrace, [clearSignatureTrace]);

  return (
    <div className="w-full max-w-full lg:hidden">
      <p id="site-mobile-map-keyboard-hint" className="sr-only">
        Use arrow keys to select a section.
      </p>
      <p
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {activeRecord.label} selected. {activeRecord.status}
      </p>
      <div className="grid max-w-full overflow-hidden border-y border-border bg-background">
        <div className="grid gap-3 border-b border-border p-3">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <span className="min-w-0 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Joe method / {displayRecord.shortLabel} active
            </span>
          </div>

          <div className="site-mobile-map-field relative min-h-[12rem] min-w-0">
            <svg
              className="pointer-events-none absolute inset-0 size-full text-border"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              {visibleRecords.map((record) => (
                <path
                  key={record.id}
                  d={mobilePath(record)}
                  pathLength={1}
                  className={cn(
                    "site-map-edge",
                    displayNodeId === record.id && "site-map-edge-active",
                  )}
                  style={
                    {
                      "--route-progress": displayNodeId === record.id ? 1 : 0.45,
                    } as CSSProperties
                  }
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
            <button
              type="button"
              onClick={startSignatureTrace}
              aria-label="Trace Joe Simo background to current work"
              aria-pressed={signaturePlaying}
              className="absolute left-1/2 top-1/2 z-10 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center overflow-hidden rounded-md border border-border bg-background font-pixel text-[10px] uppercase text-muted-foreground outline-none transition hover:border-foreground/35 focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/35"
            >
              {originRecord.shortLabel}
            </button>
            <div
              className="site-mobile-route-radiogroup"
              role="radiogroup"
              aria-label="Joe Simo sections"
              aria-describedby="site-mobile-map-keyboard-hint"
            >
              {visibleRecords.map((record) => {
                const active = record.id === activeNodeId;
                const highlighted = record.id === displayNodeId;
                const point = record.map.mobilePoint;

                return (
                  <button
                    key={record.id}
                    type="button"
                    onClick={() => commitNode(record.id)}
                    onFocus={() => previewNode(record.id)}
                    onBlur={() => previewNode(null)}
                    onPointerEnter={(event) => {
                      if (event.pointerType !== "touch") {
                        previewNode(record.id);
                      }
                    }}
                    onPointerLeave={() => previewNode(null)}
                    onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) =>
                      navigateWithKeys(
                        event,
                        record.id,
                        (id: SiteNodeId) => `[data-mobile-map-node-id="${id}"]`,
                      )
                    }
                    role="radio"
                    aria-checked={active}
                    aria-controls="site-mobile-map-detail"
                    aria-label={`Select ${record.label}`}
                    tabIndex={record.id === focusableNodeId ? 0 : -1}
                    data-mobile-map-node-id={record.id}
                    className={cn(
                      "group absolute z-10 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-md border border-border bg-background font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground outline-none transition hover:border-foreground/35 focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/35",
                      active && "border-foreground text-foreground",
                      highlighted && "border-[color-mix(in_oklab,var(--signal-accent)_56%,var(--border))] text-foreground",
                    )}
                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  >
                    <span
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-md transition group-hover:-translate-y-0.5",
                        accentClasses[record.accent],
                      )}
                    >
                      <SiteIcon iconKey={record.iconKey} aria-hidden />
                    </span>
                    <span className="sr-only">{record.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="grid grid-cols-2 gap-x-3 gap-y-2 border-t border-border pt-3"
            aria-hidden
          >
            {visibleRecords.map((record) => (
              <span
                key={record.id}
                className={cn(
                  "flex min-w-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground",
                  displayNodeId === record.id && "text-foreground",
                )}
              >
                <span className="h-px w-5 shrink-0 bg-current" />
                <span className="truncate">
                  {routeDisplayLabels[record.id] ?? record.label}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div
          id="site-mobile-map-detail"
          className="grid content-between gap-4 p-4"
        >
          <div className="grid gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {originRecord.label} / {displayRecord.scene.code} / {displayRecord.label}
            </p>
            <div className="grid gap-2">
              <p className="text-xl font-medium leading-tight text-foreground">
                {displayRecord.status}
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                {displayRecord.detail}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                scrollToExperienceSection(displayRecord, { focusEntry: true })
              }
              className="inline-flex min-h-11 w-fit items-center rounded-md border border-border px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground outline-none transition hover:border-foreground/40 focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/35"
            >
              {displayRecord.readActionLabel}
            </button>
            <a
              href={displayRecord.primaryAction.href}
              {...actionTargetProps(displayRecord.primaryAction)}
              aria-label={displayRecord.primaryAction.ariaLabel}
              className="inline-flex min-h-11 w-fit items-center gap-2 rounded-md border border-border px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground outline-none transition hover:border-foreground/40 focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/35"
            >
              {displayRecord.primaryAction.label}
              <SiteIcon iconKey="arrowUpRight" aria-hidden />
              <ExternalCue show={Boolean(displayRecord.primaryAction.external)} />
            </a>
          </div>
          {visibleQuickActions.length > 0 ? (
            <div
              className="flex flex-wrap gap-2 border-t border-border pt-3"
              role="group"
              aria-label="Fast exits"
            >
              {visibleQuickActions.map((action) => (
                <a
                  key={`${action.label}-${action.href}`}
                  href={action.href}
                  {...actionTargetProps(action)}
                  aria-label={action.ariaLabel}
                  className="inline-flex min-h-11 w-fit items-center rounded-md border border-border px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground outline-none transition hover:border-foreground/40 hover:text-foreground focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/35"
                >
                  {action.label}
                  <ExternalCue show={Boolean(action.external)} />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
