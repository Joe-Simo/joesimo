"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
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
import type { WebGLSignalFieldProps } from "@/components/site/webgl-signal-field";
import {
  defaultActiveNodeId,
  originNodeId,
  traceStages,
  type AccentKey,
  type SiteAction,
  type SiteCanvasRecord,
  type SiteNodeId,
  type TraceStage,
  type TraceStageId,
} from "@/lib/site-data";
import { cn } from "@/lib/utils";

type CanvasPoint = {
  x: number;
  y: number;
};

const accentClasses: Record<AccentKey, string> = {
  ink: "border-border",
  signal: "border-border",
  fault: "border-border",
  live: "border-border",
};

const routeDisplayLabels: Partial<Record<SiteNodeId, string>> = {
  method: "Method",
  work: "Work",
  trail: "Trail",
  contact: "Email",
};

const WebGLSignalField = dynamic<WebGLSignalFieldProps>(
  () =>
    import("@/components/site/webgl-signal-field").then(
      (module) => module.WebGLSignalField,
    ),
  {
    ssr: false,
  },
);

function clampProgress(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}

function phaseFromProgress(progress: number) {
  const boundedProgress = clampProgress(progress);
  const phaseIndex = Math.min(
    traceStages.length - 1,
    Math.round(boundedProgress * (traceStages.length - 1)),
  );

  return traceStages[phaseIndex] ?? traceStages[0];
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

function allowsWebGLImport() {
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const dataPreference = (
    navigator as Navigator & {
      connection?: {
        saveData?: boolean;
      };
    }
  ).connection?.saveData;

  if (motionQuery.matches || dataPreference) {
    return false;
  }

  const canvas = document.createElement("canvas");

  return Boolean(
    canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
  );
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
      aria-label={`Preview ${record.label}`}
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

function StaticSignalField({ className }: { className?: string }) {
  return (
    <div
      className={cn("site-webgl-signal-field", className)}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
      aria-hidden
    >
      <div className="site-webgl-static-field" />
    </div>
  );
}

function LazySignalField(props: WebGLSignalFieldProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (!cancelled && allowsWebGLImport()) {
        setEnabled(true);
      }
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  if (!enabled) {
    return <StaticSignalField className={props.className} />;
  }

  return <WebGLSignalField {...props} />;
}

function ExternalCue({ show }: { show: boolean }) {
  return show ? <span className="sr-only">opens in a new tab</span> : null;
}

function InspectorAction({
  action,
  primary = false,
}: {
  action: SiteAction;
  primary?: boolean;
}) {
  return (
    <a
      href={action.href}
      {...actionTargetProps(action)}
      aria-label={action.ariaLabel}
      className={cn(
        "site-route-inspector-action",
        primary && "site-route-inspector-action-primary",
      )}
    >
      {action.label}
      <SiteIcon iconKey="arrowUpRight" aria-hidden />
      <ExternalCue show={Boolean(action.external)} />
    </a>
  );
}

function RouteInspector({
  onRead,
  point,
  record,
}: {
  onRead: (record: SiteCanvasRecord) => void;
  point?: CanvasPoint;
  record: SiteCanvasRecord;
}) {
  const style = point
    ? ({
        "--inspector-x": `${point.x}%`,
        "--inspector-y": `${point.y}%`,
        "--inspector-translate-x":
          point.x > 72 ? "-108%" : point.x < 36 ? "2rem" : "-50%",
        "--inspector-translate-y":
          point.y > 68 ? "-78%" : point.y < 32 ? "0" : "-50%",
      } as CSSProperties)
    : undefined;

  return (
    <aside
      className="site-min-detail site-route-inspector"
      aria-label={`${record.label} route inspector`}
      style={style}
    >
      <span className="site-route-inspector-kicker">
        {record.scene.code} / {record.scene.eyebrow}
      </span>
      <div className="site-route-inspector-copy">
        <strong>{record.status}</strong>
        <span>{record.detail}</span>
      </div>
      <span className="site-route-inspector-proof">{record.proof}</span>
      <div className="site-route-rail" role="group" aria-label={`${record.label} actions`}>
        <button
          type="button"
          onClick={() => onRead(record)}
          className="site-route-inspector-action site-route-inspector-action-primary"
        >
          {record.readActionLabel}
          <SiteIcon iconKey="arrowUpRight" aria-hidden />
        </button>
        <InspectorAction action={record.primaryAction} />
      </div>
    </aside>
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
  phase: TraceStage | null;
  playing: boolean;
}) {
  const displayPhase = phase ?? traceStages[0];

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
          {traceStages.map((item) => (
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

function TraceController({
  activePhase,
  onCommit,
  onSettle,
  onTraceProgress,
  progress,
}: {
  activePhase: TraceStage;
  onCommit: (phase: TraceStage) => void;
  onSettle: () => void;
  onTraceProgress: (progress: number) => void;
  progress: number;
}) {
  const ariaValue = phaseFromProgress(progress).ariaValue;

  return (
    <div
      className="site-trace-controller"
      style={
        {
          "--manual-trace-progress": String(progress),
          "--manual-trace-percent": `${progress * 100}%`,
        } as CSSProperties
      }
    >
      <label
        htmlFor="site-method-trace"
        className="site-trace-controller-label"
      >
        Operate the method
      </label>
      <input
        id="site-method-trace"
        aria-label="Trace Joe Simo method"
        type="range"
        min={0}
        max={1}
        step={0.001}
        value={progress}
        aria-valuetext={ariaValue}
        onChange={(event) => {
          onTraceProgress(Number(event.currentTarget.value));
        }}
        onBlur={onSettle}
        onKeyUp={onSettle}
        onPointerUp={onSettle}
      />
      <div className="site-trace-controller-stops" role="group" aria-label="Method trace stops">
        {traceStages.map((phase) => {
          return (
            <button
              key={phase.id}
              type="button"
              aria-pressed={phase.id === activePhase.id}
              onClick={() => {
                onTraceProgress(phase.progress);
                onCommit(phase);
              }}
            >
              <span>{phase.code}</span>
              <strong>{phase.word}</strong>
            </button>
          );
        })}
      </div>
    </div>
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
    useState<TraceStageId | null>(null);
  const [signaturePlaying, setSignaturePlaying] = useState(false);
  const [signatureAnnounce, setSignatureAnnounce] = useState(false);
  const [routeCommitNodeId, setRouteCommitNodeId] =
    useState<SiteNodeId | null>(null);
  const [manualTraceActive, setManualTraceActive] = useState(false);
  const [manualTraceProgress, setManualTraceProgress] = useState(0);
  const [originIntroVisible, setOriginIntroVisible] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    const url = new URL(window.location.href);

    return !url.hash && !url.search;
  });
  const signatureTimeoutsRef = useRef<number[]>([]);
  const routeCommitTimeoutRef = useRef<number | null>(null);
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
  const manualPhase = phaseFromProgress(manualTraceProgress);
  const manualNodeId = manualTraceActive ? manualPhase.nodeId : null;
  const displayNodeId =
    routeCommitNodeId ??
    signatureNodeId ??
    manualNodeId ??
    (originIntroVisible ? originNodeId : tracedNodeId);
  const displayRecord =
    records.find((record) => record.id === displayNodeId) ?? tracedRecord;
  const signaturePhase =
    traceStages.find((phase) => phase.id === signaturePhaseId) ?? null;
  const displayPhase =
    signaturePhase ?? (manualTraceActive ? manualPhase : null);
  const displayRouteProgress =
    signaturePlaying || routeCommitNodeId
      ? 1
      : manualTraceActive
        ? Math.max(0.18, manualTraceProgress)
        : tracedRouteProgress;
  const shouldShowArtifact =
    displayRecord.id === "work" || displayPhase?.id === "surface";
  const artifactRecord = shouldShowArtifact ? workArtifactRecord : null;
  const artifactProgress = shouldShowArtifact
    ? Math.max(
        displayRouteProgress,
        displayRecord.id === "work" && displayRecord.id === activeNodeId
          ? 0.9
          : 0.72,
      )
    : 0;
  const showRouteInspector =
    !originIntroVisible ||
    manualTraceActive ||
    signaturePlaying ||
    Boolean(routeCommitNodeId);

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

  const commitRoute = useCallback(
    (record: SiteCanvasRecord) => {
      clearRouteCommit();
      setOriginIntroVisible(false);
      setManualTraceActive(false);
      setManualTraceProgress(0);
      setRouteCommitNodeId(record.id);
      commitNode(record.id);

      const delay = prefersReducedMotion() ? 160 : 760;

      routeCommitTimeoutRef.current = window.setTimeout(() => {
        setRouteCommitNodeId(null);
        routeCommitTimeoutRef.current = null;
      }, delay);
    },
    [clearRouteCommit, commitNode],
  );

  const updateManualTrace = useCallback(
    (progress: number) => {
      clearSignatureTrace();
      clearRouteCommit();
      setOriginIntroVisible(false);

      const nextProgress = clampProgress(progress);

      setManualTraceActive(true);
      setManualTraceProgress(nextProgress);
    },
    [clearRouteCommit, clearSignatureTrace],
  );

  const commitManualPhase = useCallback(
    (phase: TraceStage) => {
      setManualTraceActive(true);
      setManualTraceProgress(phase.progress);
      commitNode(phase.nodeId);
    },
    [commitNode],
  );

  const settleManualTrace = useCallback(() => {
    if (!manualTraceActive) {
      return;
    }

    const settledPhase = phaseFromProgress(manualTraceProgress);

    setManualTraceProgress(settledPhase.progress);
    commitNode(settledPhase.nodeId);
  }, [commitNode, manualTraceActive, manualTraceProgress]);

  const startSignatureTrace = useCallback((commitFinal = true) => {
    clearSignatureTrace();
    clearRouteCommit();
    setOriginIntroVisible(false);
    setManualTraceActive(false);
    setManualTraceProgress(0);

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

    traceStages.forEach((phase, index) => {
      const timeoutId = window.setTimeout(() => {
        setSignaturePhaseId(phase.id);
        setSignatureNodeId(phase.nodeId);

        if (index === traceStages.length - 1) {
          if (commitFinal) {
            commitNode(phase.nodeId);
          }

          window.setTimeout(() => {
            clearSignatureTrace();
          }, 1540);
        }
      }, index * 680);

      signatureTimeoutsRef.current.push(timeoutId);
    });
  }, [clearRouteCommit, clearSignatureTrace, commitNode, records]);

  useEffect(() => clearSignatureTrace, [clearSignatureTrace]);
  useEffect(() => clearRouteCommit, [clearRouteCommit]);

  return (
    <div
      className="site-flow site-flow-map relative h-full overflow-hidden"
      data-active-node={activeNodeId}
      data-traced-node={displayNodeId}
      data-signature-state={signaturePlaying ? "playing" : "idle"}
      data-manual-trace={manualTraceActive ? "active" : "idle"}
    >
      <p id="site-map-keyboard-hint" className="sr-only">
        Use arrow keys to select a section.
      </p>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {activeRecord.label} selected. {activeRecord.status}
      </p>

      <LazySignalField
        activeNodeId={displayNodeId}
        activeRouteProgress={displayRouteProgress}
        className="site-webgl-signal-field"
        nodes={webglNodes}
        originNodeId={originNodeId}
        sceneMode={displayRecord.sceneMode}
      />

      <div className="site-map-topline" aria-hidden>
        <span>Method Instrument</span>
        <span>
          {displayRecord.scene.code} / {displayRecord.scene.coordinate}
        </span>
      </div>

      <SignatureReadout
        announce={signatureAnnounce}
        phase={displayPhase}
        playing={signaturePlaying || manualTraceActive}
      />

      <TraceController
        activePhase={displayPhase ?? traceStages[0]}
        onCommit={commitManualPhase}
        onSettle={settleManualTrace}
        onTraceProgress={updateManualTrace}
        progress={manualTraceProgress}
      />

      {artifactRecord ? (
        <SignalArtifact progress={artifactProgress} record={artifactRecord} />
      ) : null}

      {showRouteInspector ? (
        <RouteInspector
          onRead={(record) =>
            scrollToExperienceSection(record, { focusEntry: true })
          }
          point={nodePoints[displayRecord.id]}
          record={displayRecord}
        />
      ) : null}

      <div className="site-map-controls" role="group" aria-label="Map controls">
        <button
          type="button"
          onClick={() => {
            setManualTraceProgress(0);
            setManualTraceActive(false);
            reset();
          }}
          aria-label="Focus method"
          title="Focus method"
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
          const active = !originIntroVisible && displayNodeId === record.id;
          const routeProgress = originIntroVisible
            ? 0.16
            : Math.max(
                routeProgressById[record.id] ?? 0,
                active ? displayRouteProgress : 0,
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
          signaturePlaying={signaturePlaying || manualTraceActive}
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
              active={!originIntroVisible && record.id === activeNodeId}
              highlighted={!originIntroVisible && record.id === displayNodeId}
              onCommit={commitRoute}
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
