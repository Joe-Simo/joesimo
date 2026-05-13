"use client";

import Image from "next/image";
import {
  type CSSProperties,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { SiteIcon } from "@/components/site/site-icons";
import {
  scrollToExperienceSection,
  useSiteExperienceState,
} from "@/components/site/use-site-experience-state";
import { WebGLSignalField } from "@/components/site/webgl-signal-field";
import {
  defaultActiveNodeId,
  originNodeId,
  type AccentKey,
  type SiteAction,
  type SiteCanvasRecord,
  type SiteNodeId,
} from "@/lib/site-data";
import { cn } from "@/lib/utils";

type CanvasPoint = {
  x: number;
  y: number;
};

type SignaturePhaseId = "breakage" | "signals" | "interface";

type SignaturePhase = {
  id: SignaturePhaseId;
  nodeId: SiteNodeId;
  code: string;
  label: string;
  word: string;
  detail: string;
};

const accentClasses: Record<AccentKey, string> = {
  ink: "border-border",
  signal: "border-border",
  live: "border-border",
};

const routeDisplayLabels: Partial<Record<SiteNodeId, string>> = {
  method: "Background",
  work: "Work",
  trail: "Links",
  contact: "Email",
};

const signaturePhases = [
  {
    id: "breakage",
    nodeId: "method",
    code: "01",
    label: "Support",
    word: "Breakage",
    detail: "Support taught Joe to start with the failure path.",
  },
  {
    id: "signals",
    nodeId: "method",
    code: "02",
    label: "Telematics",
    word: "Signals",
    detail: "Telematics shaped how he reads systems, timing, and state.",
  },
  {
    id: "interface",
    nodeId: "work",
    code: "03",
    label: "Interface",
    word: "Surface",
    detail: "sim0 is the current public surface of that method.",
  },
] as const satisfies readonly SignaturePhase[];

function clampProgress(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}

function createNodePoints(records: readonly SiteCanvasRecord[]) {
  return Object.fromEntries(
    records.map((record) => [record.id, record.map.desktopPoint]),
  ) as Partial<Record<SiteNodeId, CanvasPoint>>;
}

function routePath(
  target: CanvasPoint,
  nodePoints: Partial<Record<SiteNodeId, CanvasPoint>>,
  tension = 0.5,
) {
  const source = nodePoints[originNodeId];

  if (!source) {
    return "";
  }

  const pull = 0.28 + tension * 0.24;
  const deltaX = target.x - source.x;
  const firstControlX = source.x + deltaX * pull;
  const secondControlX = target.x - deltaX * pull;

  return `M ${source.x} ${source.y} C ${firstControlX} ${source.y}, ${secondControlX} ${target.y}, ${target.x} ${target.y}`;
}

function actionTargetProps(action: SiteAction) {
  return action.external
    ? {
        target: "_blank",
        rel: "noreferrer",
      }
    : {};
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function CanvasNode({
  active,
  highlighted,
  onCommit,
  onKeyNavigate,
  onPreview,
  point,
  record,
  tabIndex,
}: {
  active: boolean;
  highlighted: boolean;
  onCommit: (record: SiteCanvasRecord) => void;
  onKeyNavigate: (
    event: KeyboardEvent<HTMLButtonElement>,
    nodeId: SiteNodeId,
  ) => void;
  onPreview: (nodeId: SiteNodeId | null) => void;
  point: CanvasPoint;
  record: SiteCanvasRecord;
  tabIndex: 0 | -1;
}) {
  return (
    <button
      type="button"
      onClick={() => onCommit(record)}
      onFocus={() => onPreview(record.id)}
      onBlur={() => onPreview(null)}
      onKeyDown={(event) => onKeyNavigate(event, record.id)}
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") {
          onPreview(record.id);
        }
      }}
      onPointerLeave={() => onPreview(null)}
      role="radio"
      aria-checked={active}
      aria-controls="site-map-detail"
      aria-label={`Select ${record.label}`}
      tabIndex={tabIndex}
      data-map-node-id={record.id}
      className={cn(
        "site-min-node site-min-node-route site-min-map-node",
        accentClasses[record.accent],
        active && "site-min-node-active",
        highlighted && "site-min-node-highlighted",
      )}
      style={{ left: `${point.x}%`, top: `${point.y}%` }}
    >
      <SiteIcon iconKey={record.iconKey} aria-hidden />
      <span className="site-min-node-label">
        {routeDisplayLabels[record.id] ?? record.label}
      </span>
      {highlighted ? <span className="site-node-active-dot" aria-hidden /> : null}
    </button>
  );
}

function OriginNode({
  onPreview,
  onTrace,
  point,
  record,
  signaturePlaying,
}: {
  onPreview: (nodeId: SiteNodeId | null) => void;
  onTrace: () => void;
  point: CanvasPoint;
  record: SiteCanvasRecord;
  signaturePlaying: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onTrace}
      onFocus={() => onPreview(record.id)}
      onBlur={() => onPreview(null)}
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") {
          onPreview(record.id);
        }
      }}
      onPointerLeave={() => onPreview(null)}
      aria-label="Trace Joe Simo method"
      aria-pressed={signaturePlaying}
      className={cn(
        "site-min-node site-min-node-origin site-min-map-node site-signature-origin",
        signaturePlaying && "site-signature-origin-active",
      )}
      style={{ left: `${point.x}%`, top: `${point.y}%` }}
    >
      {record.media?.kind === "portrait" ? (
        <span className="site-origin-portrait">
          <Image
            src={record.media.src}
            alt=""
            width={record.media.width}
            height={record.media.height}
            sizes="82px"
            className="size-full object-cover grayscale"
          />
        </span>
      ) : (
        <span className="grid size-full overflow-hidden rounded-md bg-muted">
          <span className="grid size-full place-items-center font-pixel text-[10px] uppercase">
          JS
          </span>
        </span>
      )}
      <span className="site-origin-caption" aria-hidden>
        <span>Joe Simo</span>
        <span>Fort Myers</span>
      </span>
    </button>
  );
}

function SignalArtifact({
  progress,
  record,
}: {
  progress: number;
  record: SiteCanvasRecord;
}) {
  if (!record.media || record.media.kind !== "artifact") {
    return null;
  }

  const measuredProgress = clampProgress(progress);
  const artifactStyle = {
    "--artifact-offset": `${Math.round((1 - measuredProgress) * 10)}px`,
    "--artifact-opacity": String(0.08 + measuredProgress * 0.74),
  } as CSSProperties;

  return (
    <a
      href={record.primaryAction.href}
      {...actionTargetProps(record.primaryAction)}
      aria-label={record.primaryAction.ariaLabel}
      className="site-signal-artifact group outline-none focus-visible:ring-3 focus-visible:ring-ring/35"
      style={artifactStyle}
    >
      <span className="site-signal-artifact-meta">
        {record.scene.code} / {record.scene.eyebrow}
      </span>
      <span className="site-signal-artifact-image">
        <Image
          src={record.media.src}
          alt={record.media.alt}
          width={record.media.width}
          height={record.media.height}
          sizes="28vw"
          className="size-full object-cover object-center transition duration-300 group-hover:scale-[1.012]"
        />
      </span>
    </a>
  );
}

function RouteStatus({ record }: { record: SiteCanvasRecord }) {
  return (
    <div id="site-map-detail" className="sr-only">
      {record.label}: {record.status} {record.detail} {record.proof}
    </div>
  );
}

function SignatureReadout({
  announce,
  phase,
  playing,
}: {
  announce: boolean;
  phase: SignaturePhase | null;
  playing: boolean;
}) {
  const displayPhase = phase ?? signaturePhases[0];

  return (
    <>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {playing && announce
          ? `${displayPhase.label}. ${displayPhase.word}. ${displayPhase.detail}`
          : ""}
      </p>
      <div
        className="site-signature-readout"
        data-visible={playing ? "true" : "false"}
        aria-hidden
      >
        <span className="site-signature-kicker">
          Trace Joe / {displayPhase.code}
        </span>
        <strong className="site-signature-word">{displayPhase.word}</strong>
        <span className="site-signature-detail">{displayPhase.detail}</span>
        <span className="site-signature-axis">
          {signaturePhases.map((item) => (
            <span
              key={item.id}
              data-active={item.id === displayPhase.id ? "true" : "false"}
            >
              {item.label}
            </span>
          ))}
        </span>
      </div>
    </>
  );
}

export function SiteCanvasDesktopMap({
  onReady,
  records,
}: {
  onReady?: () => void;
  quickActions: SiteAction[];
  records: SiteCanvasRecord[];
}) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const nodePoints = useMemo(() => createNodePoints(records), [records]);
  const [signatureNodeId, setSignatureNodeId] = useState<SiteNodeId | null>(
    null,
  );
  const [signaturePhaseId, setSignaturePhaseId] =
    useState<SignaturePhaseId | null>(null);
  const [signaturePlaying, setSignaturePlaying] = useState(false);
  const [signatureAnnounce, setSignatureAnnounce] = useState(false);
  const [routeCommitNodeId, setRouteCommitNodeId] =
    useState<SiteNodeId | null>(null);
  const signatureTimeoutsRef = useRef<number[]>([]);
  const routeCommitTimeoutRef = useRef<number | null>(null);
  const introTracePlayedRef = useRef(false);
  const {
    activeNodeId,
    activeRecord,
    commitNode,
    focusableNodeId,
    navigateWithKeys,
    previewNode,
    reset,
    routeProgressById,
    tracedNodeId,
    tracedRecord,
    visibleRecords,
  } = useSiteExperienceState(records, { syncSections: true });
  const originRecord = records.find((record) => record.id === originNodeId);
  const workArtifactRecord = records.find((record) => record.id === "work");
  const webglNodes = useMemo(
    () =>
      records.map((record) => ({
        id: record.id,
        depth: record.route.depth,
        tension: record.route.tension,
        x: record.map.desktopPoint.x,
        y: record.map.desktopPoint.y,
        sceneMode: record.sceneMode,
      })),
    [records],
  );
  const edges = useMemo(
    () =>
      visibleRecords.map((record) => ({
        record,
        path: routePath(
          record.map.desktopPoint,
          nodePoints,
          record.route.tension,
        ),
      })),
    [nodePoints, visibleRecords],
  );
  const originPoint = originRecord ? nodePoints[originRecord.id] : undefined;
  const tracedRouteProgress = Math.max(
    routeProgressById[tracedNodeId] ?? 0,
    tracedNodeId === defaultActiveNodeId ? 0.3 : 0,
    tracedNodeId === activeNodeId ? 0.18 : 0,
  );
  const displayNodeId = routeCommitNodeId ?? signatureNodeId ?? tracedNodeId;
  const displayRecord =
    records.find((record) => record.id === displayNodeId) ?? tracedRecord;
  const signaturePhase =
    signaturePhases.find((phase) => phase.id === signaturePhaseId) ?? null;
  const displayRouteProgress =
    signaturePlaying || routeCommitNodeId ? 1 : tracedRouteProgress;
  const shouldShowArtifact =
    displayRecord.id === "work" || signaturePhase?.id === "interface";
  const artifactRecord = shouldShowArtifact ? workArtifactRecord : null;
  const artifactProgress = shouldShowArtifact
    ? Math.max(
        displayRouteProgress,
        displayRecord.id === "work" && displayRecord.id === activeNodeId
          ? 0.9
          : 0.72,
      )
    : 0;

  const clearSignatureTrace = useCallback(() => {
    signatureTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    signatureTimeoutsRef.current = [];
    setSignaturePlaying(false);
    setSignatureAnnounce(false);
    setSignatureNodeId(null);
    setSignaturePhaseId(null);
  }, []);

  const clearRouteCommit = useCallback(() => {
    if (routeCommitTimeoutRef.current) {
      window.clearTimeout(routeCommitTimeoutRef.current);
      routeCommitTimeoutRef.current = null;
    }

    setRouteCommitNodeId(null);
  }, []);

  const openRoute = useCallback(
    (record: SiteCanvasRecord) => {
      clearRouteCommit();
      setRouteCommitNodeId(record.id);
      commitNode(record.id);

      const delay = prefersReducedMotion() ? 0 : 240;

      routeCommitTimeoutRef.current = window.setTimeout(() => {
        scrollToExperienceSection(record, { focusEntry: true });
        setRouteCommitNodeId(null);
        routeCommitTimeoutRef.current = null;
      }, delay);
    },
    [clearRouteCommit, commitNode],
  );

  const startSignatureTrace = useCallback((commitFinal = true) => {
    clearSignatureTrace();
    clearRouteCommit();

    if (prefersReducedMotion()) {
      if (commitFinal) {
        commitNode("work");
        const workRecord = records.find((record) => record.id === "work");

        if (workRecord) {
          scrollToExperienceSection(workRecord, { focusEntry: true });
        }
      }

      return;
    }

    setSignaturePlaying(true);
    setSignatureAnnounce(commitFinal);

    signaturePhases.forEach((phase, index) => {
      const timeoutId = window.setTimeout(() => {
        setSignaturePhaseId(phase.id);
        setSignatureNodeId(phase.nodeId);

        if (index === signaturePhases.length - 1) {
          if (commitFinal) {
            commitNode(phase.nodeId);
            const workRecord = records.find((record) => record.id === phase.nodeId);

            if (workRecord) {
              window.setTimeout(() => {
                scrollToExperienceSection(workRecord, { focusEntry: true });
              }, 860);
            }
          }

          window.setTimeout(() => {
            clearSignatureTrace();
          }, 1540);
        }
      }, index * 680);

      signatureTimeoutsRef.current.push(timeoutId);
    });
  }, [clearRouteCommit, clearSignatureTrace, commitNode, records]);

  useEffect(() => {
    if (introTracePlayedRef.current || prefersReducedMotion()) {
      return;
    }

    const url = new URL(window.location.href);

    if (url.hash || url.search) {
      return;
    }

    introTracePlayedRef.current = true;

    const timeoutId = window.setTimeout(() => {
      startSignatureTrace(false);
    }, 720);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [startSignatureTrace]);

  useEffect(() => clearSignatureTrace, [clearSignatureTrace]);
  useEffect(() => clearRouteCommit, [clearRouteCommit]);

  return (
    <div
      className="site-flow site-flow-map relative h-full overflow-hidden"
      data-active-node={activeNodeId}
      data-traced-node={displayNodeId}
      data-signature-state={signaturePlaying ? "playing" : "idle"}
    >
      <p id="site-map-keyboard-hint" className="sr-only">
        Use arrow keys to select a section.
      </p>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {activeRecord.label} selected. {activeRecord.status}
      </p>

      <WebGLSignalField
        activeNodeId={displayNodeId}
        activeRouteProgress={displayRouteProgress}
        className="site-webgl-signal-field"
        nodes={webglNodes}
        originNodeId={originNodeId}
        sceneMode={displayRecord.sceneMode}
      />

      <div className="site-map-topline" aria-hidden>
        <span>Joe Method</span>
        <span>
          {displayRecord.scene.code} / {displayRecord.scene.coordinate}
        </span>
      </div>

      <SignatureReadout
        announce={signatureAnnounce}
        phase={signaturePhase}
        playing={signaturePlaying}
      />

      {artifactRecord ? (
        <SignalArtifact progress={artifactProgress} record={artifactRecord} />
      ) : null}

      <div className="site-map-controls" role="group" aria-label="Map controls">
        <button
          type="button"
          onClick={reset}
          aria-label="Focus background"
          title="Focus background"
          disabled={activeRecord.id === defaultActiveNodeId}
        >
          <SiteIcon iconKey="briefcase" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() =>
            scrollToExperienceSection(activeRecord, { focusEntry: true })
          }
          aria-label={`Read ${activeRecord.label}`}
          title="Read"
        >
          <SiteIcon iconKey="arrowUpRight" aria-hidden />
        </button>
      </div>

      <svg
        className="site-map-lines pointer-events-none absolute inset-0 size-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        {edges.map(({ record, path }) => {
          const active = displayNodeId === record.id;
          const routeProgress = Math.max(
            routeProgressById[record.id] ?? 0,
            active ? 0.18 : 0,
          );
          const routeStyle = {
            "--route-progress": clampProgress(routeProgress),
          } as CSSProperties;

          return (
            <path
              key={record.id}
              d={path}
              pathLength={1}
              className={cn(
                "site-map-edge",
                active && "site-map-edge-active",
              )}
              style={routeStyle}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>

      {originRecord && originPoint ? (
        <OriginNode
          onPreview={previewNode}
          onTrace={() => startSignatureTrace(true)}
          point={originPoint}
          record={originRecord}
          signaturePlaying={signaturePlaying}
        />
      ) : null}

      <div
        className="site-map-radio-layer"
        role="radiogroup"
        aria-label="Joe Simo sections"
        aria-describedby="site-map-keyboard-hint"
      >
        {visibleRecords.map((record) => {
          const point = nodePoints[record.id];

          if (!point) {
            return null;
          }

          return (
            <CanvasNode
              key={record.id}
              active={record.id === activeNodeId}
              highlighted={record.id === displayNodeId}
              onCommit={openRoute}
              onKeyNavigate={(event, nodeId) =>
                navigateWithKeys(
                  event,
                  nodeId,
                  (id) => `[data-map-node-id="${id}"]`,
                )
              }
              onPreview={previewNode}
              point={point}
              record={record}
              tabIndex={record.id === focusableNodeId ? 0 : -1}
            />
          );
        })}
      </div>

      <RouteStatus record={displayRecord} />
    </div>
  );
}
