"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

import { SiteIcon } from "@/components/site/site-icons";
import type { WebGLSignalFieldProps } from "@/components/site/webgl-signal-field";
import type {
  ArchiveArtifact,
  CaseAction,
  CaseActionId,
  CommunityArtifact,
  EducationRecord,
  FieldNote,
  InvestigationCase,
  InvestigationStatus,
  InvestigationStep,
  JoeProfile,
  LearningCredential,
  MachineState,
  MethodLens,
  MethodWorldChapter,
  MethodWorldMoment,
  ProfileFact,
  ProductReportArtifact,
  PublicProjectCaseStudy,
  SiteAction,
  SiteMedia,
  SocialChannel,
  WritingFragment,
} from "@/lib/site-data";
import { cn } from "@/lib/utils";

const WORK_PROJECT_PROGRESS_START = 0.44;
const WORK_PROJECT_PROGRESS_END = 0.54;
const WORK_PROJECT_PROGRESS_SPAN =
  WORK_PROJECT_PROGRESS_END - WORK_PROJECT_PROGRESS_START;
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

type HistoryMode = "push" | "replace";
type HashScrollBehavior = ScrollBehavior | "instant";

type InvestigationState = {
  activeLens: MethodLens;
  activeProofPointId: string;
  inspectedProofPointIds: string[];
  isOperating: boolean;
  selectedProjectSlug: string | null;
  status: InvestigationStatus;
  traceProgress: number;
};

type InvestigationAction =
  | {
      type: "set_progress";
      isOperating?: boolean;
      progress: number;
      status?: InvestigationStatus;
    }
  | {
      type: "set_operating";
      isOperating: boolean;
      status?: InvestigationStatus;
    }
  | {
      type: "commit_chapter";
      clearProject?: boolean;
      progress: number;
      status?: InvestigationStatus;
    }
  | {
      type: "select_project";
      progress: number;
      slug: string;
    }
  | {
      type: "select_proof";
      lens: MethodLens;
      progress: number;
      requiredStepIds: readonly string[];
      stepId: string;
      stepIds?: readonly string[];
    }
  | {
      type: "hydrate";
      activeLens?: MethodLens;
      activeProofPointId?: string;
      inspectedProofPointIds?: string[];
      isOperating?: boolean;
      selectedProjectSlug?: string | null;
      status?: InvestigationStatus;
      traceProgress?: number;
    };

const WebGLSignalField = dynamic<WebGLSignalFieldProps>(
  () =>
    import("@/components/site/webgl-signal-field").then(
      (module) => module.WebGLSignalField,
    ),
  {
    ssr: false,
    loading: () => <StaticWorldField />,
  },
);

function StaticWorldField() {
  return <div className="method-world-static-field" aria-hidden />;
}

function scrollTargetIntoView(target: HTMLElement, behavior: HashScrollBehavior) {
  const headerOffset =
    document.querySelector<HTMLElement>("header")?.getBoundingClientRect().height ?? 64;
  const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;

  window.scrollTo({
    behavior: behavior as ScrollBehavior,
    top: Math.max(0, targetTop),
  });
}

function scrollCurrentHashTargetIntoView(behavior: HashScrollBehavior) {
  const hash = window.location.hash === "#trail" ? "#notes" : window.location.hash;

  if (!hash || hash === "#joe") {
    return false;
  }

  const target = document.getElementById(hash.slice(1));

  if (!target) {
    return false;
  }

  scrollTargetIntoView(target, behavior);
  return true;
}

function actionLabel(actionId: CaseActionId) {
  switch (actionId) {
    case "find":
      return "Find";
    case "trace":
      return "Trace";
    case "ship":
      return "Ship";
  }
}

function lensLabel(lens: MethodLens) {
  switch (lens) {
    case "breakage":
      return "Breakage";
    case "signals":
      return "Signals";
    case "surface":
      return "Surface";
  }
}

function proofIdsForAction(action: CaseAction) {
  return uniqueIds([action.primaryProofPointId, ...action.supportingProofPointIds]);
}

function proofPointsForAction(
  action: CaseAction,
  proofPoints: readonly InvestigationStep[],
) {
  const actionProofIds = proofIdsForAction(action);

  return actionProofIds
    .map((proofId) => proofPoints.find((proofPoint) => proofPoint.id === proofId))
    .filter((proofPoint): proofPoint is InvestigationStep => Boolean(proofPoint));
}

function nextProofPointForAction(
  action: CaseAction,
  proofPoints: readonly InvestigationStep[],
  inspectedProofPointIds: readonly string[],
) {
  const actionProofPoints = proofPointsForAction(action, proofPoints);

  return (
    actionProofPoints.find(
      (proofPoint) => !inspectedProofPointIds.includes(proofPoint.id),
    ) ?? actionProofPoints[0]
  );
}

function orderedRequiredProofPoints(
  proofPoints: readonly InvestigationStep[],
  requiredStepIds: readonly string[],
) {
  return requiredStepIds
    .map((stepId) => proofPoints.find((proofPoint) => proofPoint.id === stepId))
    .filter((proofPoint): proofPoint is InvestigationStep => Boolean(proofPoint));
}

function proofRouteLabel(proofPoints: readonly InvestigationStep[]) {
  return proofPoints.map((proofPoint) => proofPoint.label).join(" -> ");
}

function proofRoutePath(proofPoints: readonly InvestigationStep[]) {
  if (proofPoints.length === 0) {
    return "";
  }

  return proofPoints
    .map((proofPoint, index) =>
      `${index === 0 ? "M" : "L"} ${proofPoint.x} ${proofPoint.y}`,
    )
    .join(" ");
}

function clamp(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}

function uniqueIds(ids: readonly string[]) {
  return Array.from(new Set(ids));
}

function hasCompletedRequiredSteps(
  inspectedProofPointIds: readonly string[],
  requiredStepIds: readonly string[],
) {
  return requiredStepIds.every((stepId) =>
    inspectedProofPointIds.includes(stepId),
  );
}

function statusForInspection(
  inspectedProofPointIds: readonly string[],
  requiredStepIds: readonly string[],
): InvestigationStatus {
  if (hasCompletedRequiredSteps(inspectedProofPointIds, requiredStepIds)) {
    return "shipped";
  }

  return inspectedProofPointIds.length > 1 ? "synthesizing" : "inspecting";
}

function investigationReducer(
  state: InvestigationState,
  action: InvestigationAction,
): InvestigationState {
  switch (action.type) {
    case "set_progress":
      return {
        ...state,
        isOperating: action.isOperating ?? state.isOperating,
        status:
          action.status ??
          (action.isOperating ? "tracing" : state.status),
        traceProgress: clamp(action.progress),
      };
    case "set_operating":
      return {
        ...state,
        isOperating: action.isOperating,
        status:
          action.status ??
          (action.isOperating ? "tracing" : state.status),
      };
    case "commit_chapter":
      return {
        ...state,
        isOperating: false,
        selectedProjectSlug: action.clearProject
          ? null
          : state.selectedProjectSlug,
        status: action.status ?? "briefing",
        traceProgress: clamp(action.progress),
      };
    case "select_project":
      return {
        ...state,
        isOperating: true,
        selectedProjectSlug: action.slug,
        status: action.slug === "sim0" ? "inspecting" : "briefing",
        traceProgress: clamp(action.progress),
      };
    case "select_proof": {
      const inspectedProofPointIds = uniqueIds([
        ...state.inspectedProofPointIds,
        ...(action.stepIds ?? [action.stepId]),
      ]);

      return {
        ...state,
        activeLens: action.lens,
        activeProofPointId: action.stepId,
        inspectedProofPointIds,
        isOperating: true,
        selectedProjectSlug: "sim0",
        status: statusForInspection(
          inspectedProofPointIds,
          action.requiredStepIds,
        ),
        traceProgress: clamp(action.progress),
      };
    }
    case "hydrate":
      return {
        ...state,
        activeLens: action.activeLens ?? state.activeLens,
        activeProofPointId:
          action.activeProofPointId ?? state.activeProofPointId,
        inspectedProofPointIds:
          action.inspectedProofPointIds ?? state.inspectedProofPointIds,
        isOperating: action.isOperating ?? state.isOperating,
        selectedProjectSlug:
          action.selectedProjectSlug === undefined
            ? state.selectedProjectSlug
            : action.selectedProjectSlug,
        status: action.status ?? state.status,
        traceProgress:
          action.traceProgress === undefined
            ? state.traceProgress
            : clamp(action.traceProgress),
      };
  }
}

function nearestChapter(
  chapters: readonly MethodWorldChapter[],
  progress: number,
) {
  return chapters.reduce((nearest, chapter) =>
    Math.abs(chapter.progress - progress) <
    Math.abs(nearest.progress - progress)
      ? chapter
      : nearest,
  chapters[0]);
}

function nearestMoment(
  moments: readonly MethodWorldMoment[],
  progress: number,
) {
  return moments.reduce((nearest, moment) =>
    Math.abs(moment.progress - progress) <
    Math.abs(nearest.progress - progress)
      ? moment
      : nearest,
  moments[0]);
}

function chapterFromLocation(chapters: readonly MethodWorldChapter[]) {
  const url = new URL(window.location.href);
  const hash = url.hash === "#trail" ? "#notes" : url.hash;
  const hashChapter = chapters.find((chapter) => chapter.anchor === hash);

  if (hashChapter) {
    return hashChapter;
  }

  const map = url.searchParams.get("map");
  const mappedId =
    map === "method" || map === "background" || map === "systems"
      ? "method"
      : map === "work" || map === "sim0"
        ? "work"
        : map === "trail" || map === "notes" || map === "writing"
          ? "notes"
          : map === "contact"
            ? "contact"
            : null;

  return mappedId
    ? chapters.find((chapter) => chapter.id === mappedId)
    : undefined;
}

function writeHistoryUrl(url: URL, mode: HistoryMode) {
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;

  if (mode === "push") {
    window.history.pushState(null, "", nextUrl);
    return;
  }

  window.history.replaceState(null, "", nextUrl);
}

function syncChapterUrl(
  chapter: MethodWorldChapter,
  mode: HistoryMode = "replace",
) {
  const url = new URL(window.location.href);

  url.searchParams.delete("map");
  url.searchParams.delete("work");
  url.searchParams.delete("proof");
  url.searchParams.delete("lens");
  url.searchParams.delete("route");
  url.hash = chapter.anchor;
  writeHistoryUrl(url, mode);
}

function syncProjectUrl(
  project: PublicProjectCaseStudy,
  mode: HistoryMode = "push",
) {
  const url = new URL(window.location.href);

  url.searchParams.delete("map");
  url.searchParams.delete("proof");
  url.searchParams.delete("lens");
  url.searchParams.delete("route");
  url.searchParams.set("work", project.slug);
  url.hash = "#work";
  writeHistoryUrl(url, mode);
}

function projectFromLocation(projects: readonly PublicProjectCaseStudy[]) {
  const slug = new URL(window.location.href).searchParams.get("work");

  return slug ? projects.find((project) => project.slug === slug) : undefined;
}

function projectProgress(index: number, total: number) {
  return (
    WORK_PROJECT_PROGRESS_START +
    (index / Math.max(total - 1, 1)) * WORK_PROJECT_PROGRESS_SPAN
  );
}

function proofNodeId(stepId: string) {
  return `proof:${stepId}`;
}

function isMethodLens(value: string | null): value is MethodLens {
  return value === "breakage" || value === "signals" || value === "surface";
}

function proofPointFromLocation(
  proofPoints: readonly InvestigationStep[],
) {
  const proofId = new URL(window.location.href).searchParams.get("proof");

  return proofId
    ? proofPoints.find((proofPoint) => proofPoint.id === proofId)
    : undefined;
}

function proofRouteFromLocation(proofPoints: readonly InvestigationStep[]) {
  const route = new URL(window.location.href).searchParams.get("route");

  if (!route) {
    return [];
  }

  const validProofIds = new Set(proofPoints.map((proofPoint) => proofPoint.id));

  return uniqueIds(
    route
      .split(",")
      .map((proofId) => proofId.trim())
      .filter((proofId) => validProofIds.has(proofId)),
  );
}

function lensFromLocation() {
  const lens = new URL(window.location.href).searchParams.get("lens");

  return isMethodLens(lens) ? lens : undefined;
}

function syncProofUrl(
  proofPoint: InvestigationStep,
  lens: MethodLens,
  mode: HistoryMode = "push",
  inspectedProofPointIds: readonly string[] = [proofPoint.id],
) {
  const url = new URL(window.location.href);
  const routeIds = uniqueIds(inspectedProofPointIds);

  url.searchParams.delete("map");
  url.searchParams.set("work", "sim0");
  url.searchParams.set("proof", proofPoint.id);
  url.searchParams.set("lens", lens);
  if (routeIds.length > 1) {
    url.searchParams.set("route", routeIds.join(","));
  } else {
    url.searchParams.delete("route");
  }
  url.hash = "#work";
  writeHistoryUrl(url, mode);
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

function MethodAction({
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
      className={cn("method-world-action", primary && "is-primary")}
    >
      {action.label}
      <SiteIcon iconKey="arrowUpRight" aria-hidden />
      <ExternalCue show={Boolean(action.external)} />
    </a>
  );
}

const primaryProfileFactLabels = [
  "Location",
  "Bio",
  "Professional track",
  "Telematics",
  "Languages",
  "Design",
] as const;

const personalProofFactLabels = [
  "Design shelf",
  "Coding spark",
  "Admiration",
  "Places lived",
  "Formation",
  "Chess",
  "Stargazing",
  "Independent physics note",
] as const;

function factsByLabel(
  facts: readonly ProfileFact[],
  labels: readonly string[],
) {
  return labels
    .map((label) => facts.find((fact) => fact.label === label))
    .filter((fact): fact is ProfileFact => Boolean(fact));
}

function useDesktopWorldMotion() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const saveData = (
      navigator as Navigator & {
        connection?: {
          saveData?: boolean;
        };
      }
    ).connection?.saveData;

    function update() {
      setEnabled(desktopQuery.matches && !motionQuery.matches && !saveData);
    }

    update();
    desktopQuery.addEventListener("change", update);
    motionQuery.addEventListener("change", update);

    return () => {
      desktopQuery.removeEventListener("change", update);
      motionQuery.removeEventListener("change", update);
    };
  }, []);

  return enabled;
}

function stageLabel(stage: PublicProjectCaseStudy["methodStage"]) {
  switch (stage) {
    case "breakage":
      return "Breakage";
    case "signals":
      return "Signals";
    case "surface":
      return "Surface";
  }
}

function ProjectChamber({
  activeProject,
  project,
}: {
  activeProject: PublicProjectCaseStudy;
  project: PublicProjectCaseStudy;
}) {
  const active = activeProject.slug === project.slug;

  return (
    <span
      className="method-world-chamber"
      data-active={active ? "true" : "false"}
    >
      <span>
        {project.code} / {stageLabel(project.methodStage)}
      </span>
      <strong>{project.title}</strong>
      <small>{project.role}</small>
    </span>
  );
}

function ProjectDeepLink({ project }: { project: PublicProjectCaseStudy }) {
  return (
    <Link href={`/work/${project.slug}`} className="method-world-deep-link">
      Open case
      <SiteIcon iconKey="arrowUpRight" aria-hidden />
    </Link>
  );
}

function JoeEditorialArtifact({
  profileMedia,
  traceProgress,
}: {
  profileMedia: SiteMedia;
  traceProgress: number;
}) {
  return (
    <aside
      className="method-world-editorial-media"
      aria-label="Joe Simo portrait and method summary"
      style={
        {
          "--bench-signal": traceProgress,
        } as CSSProperties
      }
    >
      <figure className="method-world-editorial-portrait">
        <Image
          src={profileMedia.src}
          alt={profileMedia.alt}
          width={profileMedia.width}
          height={profileMedia.height}
          sizes="(max-width: 1023px) 92vw, 34vw"
          preload
        />
        <span className="method-world-editorial-scan" aria-hidden />
      </figure>

      <div className="method-world-editorial-caption">
        <span>Fort Myers / Devsigner</span>
        <strong>Support -&gt; Signals -&gt; Surface</strong>
        <small>
          The personal method: find the stuck point, read the system, remove
          what does not help the next action.
        </small>
      </div>
    </aside>
  );
}

function CaseActionRail({
  activeActionId,
  actions,
  activeActionProofIds,
  inspectedProofPointIds,
  onSelectAction,
  proofPoints,
}: {
  activeActionId: CaseActionId;
  actions: readonly CaseAction[];
  activeActionProofIds: readonly string[];
  inspectedProofPointIds: readonly string[];
  onSelectAction: (action: CaseAction) => void;
  proofPoints: readonly InvestigationStep[];
}) {
  return (
    <div className="method-case-actions" role="group" aria-label="Operate the featured work proof">
      {actions.map((action) => {
        const active = activeActionId === action.id;
        const actionProofPoints = proofPointsForAction(action, proofPoints);
        const inspectedCount = actionProofPoints.filter((proofPoint) =>
          inspectedProofPointIds.includes(proofPoint.id),
        ).length;
        const complete = actionProofPoints.every((proofPoint) =>
          inspectedProofPointIds.includes(proofPoint.id),
        );

        return (
          <button
            key={action.id}
            type="button"
            aria-pressed={active}
            className="method-case-action"
            data-active={active ? "true" : "false"}
            data-complete={complete ? "true" : "false"}
            onClick={() => onSelectAction(action)}
          >
            <span>{action.label}</span>
            <small>{action.hook}</small>
            <em>
              {complete
                ? action.completionLabel
                : `${action.label} ${inspectedCount}/${actionProofPoints.length}`}
            </em>
            <i aria-hidden>
              {actionProofPoints.map((proofPoint) => (
                <b
                  key={proofPoint.id}
                  data-active={
                    activeActionProofIds.includes(proofPoint.id) ? "true" : "false"
                  }
                  data-seen={
                    inspectedProofPointIds.includes(proofPoint.id)
                      ? "true"
                      : "false"
                  }
                />
              ))}
            </i>
          </button>
        );
      })}
    </div>
  );
}

function machineStateForProofPoint({
  activeProofPoint,
  caseComplete,
  investigationCase,
}: {
  activeProofPoint: InvestigationStep;
  caseComplete: boolean;
  investigationCase: InvestigationCase;
}): MachineState | undefined {
  if (caseComplete) {
    return (
      investigationCase.machineStates.find(
        (machineState) => machineState.id === "receipt",
      ) ?? investigationCase.machineStates.at(-1)
    );
  }

  return (
    investigationCase.machineStates.find(
      (machineState) => machineState.id === activeProofPoint.action,
    ) ??
    investigationCase.machineStates.find((machineState) =>
      machineState.proofPointIds.includes(activeProofPoint.id),
    ) ??
    investigationCase.machineStates[0]
  );
}

function ProofViewport({
  activeProofPoint,
  caseComplete,
  completionProgress,
  investigationCase,
  inspectedProofPointIds,
  onSelectProofPoint,
  proofPoints,
}: {
  activeProofPoint: InvestigationStep;
  caseComplete: boolean;
  completionProgress: number;
  investigationCase: InvestigationCase;
  inspectedProofPointIds: readonly string[];
  onSelectProofPoint: (
    proofPoint: InvestigationStep,
    mode?: HistoryMode,
    stepIds?: readonly string[],
  ) => void;
  proofPoints: readonly InvestigationStep[];
}) {
  const activeMachineState = machineStateForProofPoint({
    activeProofPoint,
    caseComplete,
    investigationCase,
  });
  const activeMachineMedia = activeMachineState
    ? investigationCase.proofMedia.find(
        (media) => media.id === activeMachineState.mediaId,
      )
    : undefined;
  const activeMedia =
    activeMachineMedia?.kind === "image"
      ? activeMachineMedia
      : investigationCase.artifact;
  const nextProofPoint =
    proofPoints.find(
      (proofPoint) => !inspectedProofPointIds.includes(proofPoint.id),
    ) ?? activeProofPoint;
  const activeRouteIds = uniqueIds([
    ...inspectedProofPointIds,
    activeProofPoint.id,
  ]);

  return (
    <figure
      className="method-proof-viewport method-world-object"
      data-complete={caseComplete ? "true" : "false"}
      data-machine-state={activeMachineState?.id ?? activeProofPoint.action}
      style={
        {
          "--machine-route-progress": completionProgress,
          "--object-x": `${activeProofPoint.zoom.x}%`,
          "--object-y": `${activeProofPoint.zoom.y}%`,
        } as CSSProperties
      }
    >
      <div className="method-proof-screen method-world-object-plane">
        <Image
          src={activeMedia.src}
          alt={activeMedia.alt}
          width={activeMedia.width}
          height={activeMedia.height}
          sizes="(min-width: 1280px) 44vw, 94vw"
          className="method-proof-image method-world-object-image"
        />
        <svg
          className="method-world-object-route"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d={proofRoutePath(proofPoints)}
            pathLength={1}
            className="is-base"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={proofRoutePath(proofPoints)}
            pathLength={1}
            className="is-active"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span className="method-world-object-scan" aria-hidden />
        <span className="method-world-object-target" aria-hidden />
        <div className="method-world-object-leds" aria-hidden>
          {proofPoints.map((proofPoint) => (
            <i
              key={proofPoint.id}
              data-active={proofPoint.id === activeProofPoint.id ? "true" : "false"}
              data-complete={
                inspectedProofPointIds.includes(proofPoint.id) ? "true" : "false"
              }
            />
          ))}
        </div>
        <div
          className="method-world-object-pins method-proof-hotspots"
          aria-label="Featured work proof hotspots"
        >
          {proofPoints.map((proofPoint) => {
            const active = activeProofPoint.id === proofPoint.id;
            const inspected = inspectedProofPointIds.includes(proofPoint.id);
            const armed = activeMachineState?.proofPointIds.includes(proofPoint.id);

            return (
              <button
                key={proofPoint.id}
                type="button"
                className="method-proof-hotspot method-world-object-pin"
                data-active={active ? "true" : "false"}
                data-armed={armed ? "true" : "false"}
                data-inspected={inspected ? "true" : "false"}
                style={
                  {
                    "--pin-x": `${proofPoint.x}%`,
                    "--pin-y": `${proofPoint.y}%`,
                  } as CSSProperties
                }
                aria-controls="method-proof-inspector"
                aria-current={active ? "step" : undefined}
                aria-label={`Inspect ${proofPoint.label} in the featured work proof`}
                onClick={() => onSelectProofPoint(proofPoint)}
              >
                <span>{proofPoint.code}</span>
              </button>
            );
          })}
        </div>
        {activeMachineState ? (
          <div
            className="method-world-machine-state"
            data-accent={activeMachineState.accent}
            aria-hidden
          >
            <span>{activeMachineState.label}</span>
            <strong>{activeMachineState.title}</strong>
            <small>{activeMachineState.detail}</small>
          </div>
        ) : null}
        {!caseComplete ? (
          <button
            type="button"
            className="method-world-object-next"
            aria-label={`Inspect next proof point: ${nextProofPoint.label}`}
            onClick={() => onSelectProofPoint(nextProofPoint)}
          >
            <span>Next signal</span>
            <strong>{nextProofPoint.label}</strong>
          </button>
        ) : null}
      </div>
      <figcaption>
        <span>{activeMachineState?.label ?? "Featured work proof"}</span>
        <small>
          {activeRouteIds.length}/{proofPoints.length} inspected /{" "}
          {activeProofPoint.sourceLabel}
        </small>
      </figcaption>
    </figure>
  );
}

function ProofInspector({ activeProofPoint }: { activeProofPoint: InvestigationStep }) {
  return (
    <article
      id="method-proof-inspector"
      className="method-proof-inspector"
      aria-live="polite"
      aria-atomic="true"
    >
      <span>
        {activeProofPoint.code} / {actionLabel(activeProofPoint.action)} / {lensLabel(activeProofPoint.lens)}
      </span>
      <h2>{activeProofPoint.title}</h2>
      <em>{activeProofPoint.readout}</em>
      <p>{activeProofPoint.detail}</p>
      <small>{activeProofPoint.interfaceDecision}</small>
    </article>
  );
}

function CaseSignalReceipt({
  caseComplete,
  completionProgress,
  investigationCase,
  investigationStatus,
}: {
  caseComplete: boolean;
  completionProgress: number;
  investigationCase: InvestigationCase;
  investigationStatus: InvestigationStatus;
}) {
  return (
    <aside
      className="method-case-signal"
      data-complete={caseComplete ? "true" : "false"}
      aria-live="polite"
    >
      <span>
        {investigationCase.signature.label} / {investigationStatus}
      </span>
      <strong>
        {caseComplete
          ? investigationCase.signature.title
          : `${Math.round(completionProgress * 100)}% routed`}
      </strong>
      <p>
        {caseComplete
          ? investigationCase.signature.detail
          : investigationCase.emotionalStake}
      </p>
    </aside>
  );
}

function CaseCompletionPayoff({
  contactAction,
  investigationCase,
  motionEnabled,
  requiredProofPoints,
  sim0Project,
}: {
  contactAction?: SiteAction;
  investigationCase: InvestigationCase;
  motionEnabled: boolean;
  requiredProofPoints: readonly InvestigationStep[];
  sim0Project: PublicProjectCaseStudy;
}) {
  const replayMedia = investigationCase.proofMedia.find(
    (media) => media.id === "sim0-route-replay",
  );

  return (
    <aside className="method-completion-payoff" aria-labelledby="method-completion-title">
      {replayMedia ? (
        <figure className="method-completion-replay">
          <video
            aria-label={replayMedia.alt}
            autoPlay={motionEnabled}
            loop={motionEnabled}
            muted
            playsInline
            poster={replayMedia.posterSrc}
            preload="metadata"
            width={replayMedia.width}
            height={replayMedia.height}
          >
            <source src={replayMedia.src} type="video/webm" />
          </video>
          <figcaption>
            <span>{replayMedia.label}</span>
            <small>{replayMedia.sourceLabel}</small>
          </figcaption>
        </figure>
      ) : null}
      <div>
        <span>{investigationCase.signature.label}</span>
        <h2 id="method-completion-title">{investigationCase.signature.title}</h2>
        <p>{investigationCase.signature.detail}</p>
      </div>
      <div className="method-completion-before-after" aria-label="Before and after route">
        <article>
          <span>Before</span>
          <strong>Hidden state</strong>
          <p>{requiredProofPoints[0]?.finding}</p>
        </article>
        <article>
          <span>After</span>
          <strong>Readable surface</strong>
          <p>{investigationCase.outcome}</p>
        </article>
      </div>
      <ol aria-label="Completed proof route">
        {requiredProofPoints.map((proofPoint) => (
          <li key={proofPoint.id}>
            <span>{proofPoint.code}</span>
            <strong>{proofPoint.label}</strong>
            <small>{proofPoint.completionLabel}</small>
          </li>
        ))}
      </ol>
      <div className="method-completion-actions">
        {contactAction ? <MethodAction action={contactAction} primary /> : null}
        {sim0Project.links.map((action) => (
          <MethodAction key={`${action.label}-${action.href}`} action={action} />
        ))}
        <ProjectDeepLink project={sim0Project} />
      </div>
    </aside>
  );
}

function ProjectEvidenceRail({
  activeProject,
  caseComplete,
  motionEnabled,
  onSelectProject,
  projects,
}: {
  activeProject: PublicProjectCaseStudy;
  caseComplete: boolean;
  motionEnabled: boolean;
  onSelectProject: (project: PublicProjectCaseStudy, index: number) => void;
  projects: readonly PublicProjectCaseStudy[];
}) {
  const featuredProjects = projects
    .filter((project) => project.homepageFeature)
    .sort(
      (a, b) =>
        (a.homepageFeature?.rank ?? 99) - (b.homepageFeature?.rank ?? 99),
    )
    .slice(0, 4);

  return (
    <div
      className="method-project-rail"
      data-complete={caseComplete ? "true" : "false"}
      aria-label="Top work proof media"
    >
	      {featuredProjects.map((project) => {
	          const index = projects.findIndex((item) => item.slug === project.slug);
	          const active = activeProject.slug === project.slug;
	          const featureAssetIds = project.homepageFeature?.mediaAssetIds ?? [];
          const miniWorldMedia = project.miniWorld?.media[0];
	          const heroAsset =
	            project.assets.find((asset) => featureAssetIds.includes(asset.id)) ??
	            project.assets[0];

          return (
            <article
              key={project.slug}
              className="method-project-card"
              data-active={active ? "true" : "false"}
              data-mode={project.proofMode}
            >
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onSelectProject(project, index)}
              >
                <span>
                  {project.code} / {project.proofMode}
                </span>
                <strong>{project.title}</strong>
                <small>{project.role}</small>
              </button>
              {miniWorldMedia?.kind === "video" ? (
                <video
                  aria-label={miniWorldMedia.alt}
                  autoPlay={active && motionEnabled}
                  loop={motionEnabled}
                  muted
                  playsInline
                  poster={miniWorldMedia.posterSrc}
                  preload="metadata"
                  width={miniWorldMedia.width}
                  height={miniWorldMedia.height}
                  className="method-project-card-image object-cover"
                >
                  <source src={miniWorldMedia.src} type="video/webm" />
                </video>
              ) : heroAsset ? (
                <Image
                  src={heroAsset.media.src}
                  alt={heroAsset.media.alt}
                  width={heroAsset.media.width}
                  height={heroAsset.media.height}
                  sizes="(min-width: 1280px) 14vw, 70vw"
                  className={cn(
                    "method-project-card-image",
                    heroAsset.media.height > heroAsset.media.width
                      ? "object-contain"
                      : "object-cover",
                  )}
                />
              ) : (
                <div className="method-project-card-specimen" aria-hidden>
                  <span>{project.code}</span>
                </div>
              )}
              <p>{project.proofSummary}</p>
              <ProjectDeepLink project={project} />
            </article>
          );
        })}
    </div>
  );
}

function ProofCaseStage({
  activeActionId,
  activeActionProofIds,
  activeLens,
  activeProject,
  activeProofPoint,
  caseComplete,
	  completionProgress,
	  contactAction,
	  investigationCase,
	  investigationStatus,
	  inspectedProofPointIds,
  motionEnabled,
	  onSelectAction,
  onSelectProject,
  onSelectProofPoint,
  orderedRequiredSteps,
  projects,
  proofPoints,
}: {
  activeActionId: CaseActionId;
  activeActionProofIds: readonly string[];
  activeLens: MethodLens;
  activeProject: PublicProjectCaseStudy;
  activeProofPoint: InvestigationStep;
  caseComplete: boolean;
  completionProgress: number;
  contactAction?: SiteAction;
  investigationCase: InvestigationCase;
	  investigationStatus: InvestigationStatus;
	  inspectedProofPointIds: readonly string[];
  motionEnabled: boolean;
	  onSelectAction: (action: CaseAction) => void;
  onSelectProject: (project: PublicProjectCaseStudy, index: number) => void;
  onSelectProofPoint: (
    proofPoint: InvestigationStep,
    mode?: HistoryMode,
    stepIds?: readonly string[],
  ) => void;
  orderedRequiredSteps: readonly InvestigationStep[];
  projects: readonly PublicProjectCaseStudy[];
  proofPoints: readonly InvestigationStep[];
}) {
  const sim0Project = projects.find((project) => project.slug === "sim0") ?? projects[0];

  return (
    <article
      className="method-proof-case"
      data-complete={caseComplete ? "true" : "false"}
      data-lens={activeLens}
      data-status={investigationStatus}
	    >
      <div className="method-proof-case-copy">
        <span>{sim0Project.code} / Featured proof</span>
        <h2>{investigationCase.title}</h2>
        <p>{investigationCase.emotionalStake}</p>
      </div>
      <dl className="method-proof-stakes" aria-label="Human stakes for the sim0 case">
        <div>
          <dt>Blocked</dt>
          <dd>{investigationCase.humanStake.blockedPerson}</dd>
        </div>
        <div>
          <dt>Confusing</dt>
          <dd>{investigationCase.humanStake.confusion}</dd>
        </div>
        <div>
          <dt>Visible</dt>
          <dd>{investigationCase.humanStake.madeVisible}</dd>
        </div>
      </dl>
	      <CaseActionRail
        activeActionId={activeActionId}
        activeActionProofIds={activeActionProofIds}
        actions={investigationCase.actions}
        inspectedProofPointIds={inspectedProofPointIds}
        onSelectAction={onSelectAction}
        proofPoints={proofPoints}
      />
      <div className="method-proof-case-grid">
        <ProofViewport
          activeProofPoint={activeProofPoint}
          caseComplete={caseComplete}
          completionProgress={completionProgress}
          investigationCase={investigationCase}
          inspectedProofPointIds={inspectedProofPointIds}
          onSelectProofPoint={onSelectProofPoint}
          proofPoints={proofPoints}
        />
        <div className="method-proof-side">
          <ProofInspector activeProofPoint={activeProofPoint} />
          <CaseSignalReceipt
            caseComplete={caseComplete}
            completionProgress={completionProgress}
            investigationCase={investigationCase}
            investigationStatus={investigationStatus}
          />
          <div className="method-world-project-actions">
            {caseComplete && contactAction ? (
              <MethodAction action={contactAction} primary={caseComplete} />
            ) : null}
            {sim0Project.links.map((action) => (
              <MethodAction
                key={`${action.label}-${action.href}`}
                action={action}
              />
            ))}
            <ProjectDeepLink project={sim0Project} />
          </div>
        </div>
      </div>
      {caseComplete ? (
	        <CaseCompletionPayoff
	          contactAction={contactAction}
	          investigationCase={investigationCase}
          motionEnabled={motionEnabled}
	          requiredProofPoints={orderedRequiredSteps}
	          sim0Project={sim0Project}
	        />
      ) : null}
	      <ProjectEvidenceRail
	        activeProject={activeProject}
	        caseComplete={caseComplete}
        motionEnabled={motionEnabled}
	        onSelectProject={onSelectProject}
	        projects={projects}
	      />
    </article>
  );
}

function MethodTouchConsole({
  activeProject,
  activeProofPoint,
  caseComplete,
  completionProgress,
  contactAction,
  investigationCase,
  investigationStatus,
  inspectedProofPointIds,
  onSelectProofPoint,
  proofPoints,
}: {
  activeProject: PublicProjectCaseStudy;
  activeProofPoint: InvestigationStep;
  caseComplete: boolean;
  completionProgress: number;
  contactAction?: SiteAction;
  investigationCase: InvestigationCase;
  investigationStatus: InvestigationStatus;
  inspectedProofPointIds: readonly string[];
  onSelectProofPoint: (
    proofPoint: InvestigationStep,
    mode?: HistoryMode,
    stepIds?: readonly string[],
  ) => void;
	  proofPoints: readonly InvestigationStep[];
	}) {
  const [isHolding, setIsHolding] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const holdTimerRef = useRef<number | null>(null);
  const activeProofIndex = Math.max(
    0,
    proofPoints.findIndex((proofPoint) => proofPoint.id === activeProofPoint.id),
  );
  const activeProofProgress =
    activeProofIndex / Math.max(proofPoints.length - 1, 1);
  const commitProofIndex = (nextIndex: number) => {
    const boundedIndex = Math.min(
      Math.max(Math.round(nextIndex), 0),
      Math.max(proofPoints.length - 1, 0),
    );
    const nextProofPoint = proofPoints[boundedIndex];

    if (nextProofPoint) {
      onSelectProofPoint(
        nextProofPoint,
        "replace",
        proofPoints
          .slice(0, boundedIndex + 1)
          .map((proofPoint) => proofPoint.id),
      );
    }
  };
  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);
  const proofIndexFromPointer = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();

      if (rect.width <= 0) {
        return activeProofIndex;
      }

      return ((event.clientX - rect.left) / rect.width) * (proofPoints.length - 1);
    },
    [activeProofIndex, proofPoints.length],
  );

  useEffect(() => clearHoldTimer, [clearHoldTimer]);

  function handleTouchObjectPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;

    if (target.closest("button, input, a")) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setIsTouching(true);
    setIsHolding(false);
    commitProofIndex(proofIndexFromPointer(event));
    clearHoldTimer();
    holdTimerRef.current = window.setTimeout(() => {
      setIsHolding(true);
    }, 260);
  }

  function handleTouchObjectPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }

    commitProofIndex(proofIndexFromPointer(event));
  }

  function handleTouchObjectPointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    clearHoldTimer();
    setIsHolding(false);
    setIsTouching(false);
  }

  return (
    <section
      className="method-touch-console"
      data-complete={caseComplete ? "true" : "false"}
      data-holding={isHolding ? "true" : "false"}
      data-status={investigationStatus}
      data-touching={isTouching ? "true" : "false"}
      aria-labelledby="method-touch-title"
      aria-describedby="method-touch-description"
      style={
        {
          "--method-touch-progress": activeProofProgress,
          "--method-touch-progress-percent": `${activeProofProgress * 100}%`,
          "--method-touch-proof-x": `${activeProofPoint.zoom.x}%`,
          "--method-touch-proof-y": `${activeProofPoint.zoom.y}%`,
        } as CSSProperties
      }
    >
      <div className="method-touch-game">
        <div className="method-touch-readout">
          <span>Work / featured case</span>
          <strong id="method-touch-title">{investigationCase.hook}</strong>
          <p id="method-touch-description">{investigationCase.emotionalStake}</p>
        </div>

        <figure className="method-touch-object">
          <div
            className="method-touch-object-plane"
            role="group"
            aria-label="Drag across the featured work proof surface"
            onPointerDown={handleTouchObjectPointerDown}
            onPointerMove={handleTouchObjectPointerMove}
            onPointerUp={handleTouchObjectPointerEnd}
            onPointerCancel={handleTouchObjectPointerEnd}
            onLostPointerCapture={handleTouchObjectPointerEnd}
          >
            <Image
              src={investigationCase.artifact.src}
              alt={investigationCase.artifact.alt}
              width={investigationCase.artifact.width}
              height={investigationCase.artifact.height}
              sizes="100vw"
              className="method-touch-object-image"
            />
            <span className="method-touch-object-marker" aria-hidden />
            <div className="method-touch-object-pins" aria-label="Proof steps">
              {proofPoints.map((proofPoint, index) => (
                <button
                  key={proofPoint.id}
                  type="button"
                  aria-current={proofPoint.id === activeProofPoint.id ? "step" : undefined}
                  aria-label={`Inspect ${proofPoint.label}`}
                  data-active={proofPoint.id === activeProofPoint.id ? "true" : "false"}
                  data-seen={
                    inspectedProofPointIds.includes(proofPoint.id) ? "true" : "false"
                  }
                  style={
                    {
                      "--touch-pin-x": `${proofPoint.x}%`,
                      "--touch-pin-y": `${proofPoint.y}%`,
                    } as CSSProperties
                  }
                  onClick={() => commitProofIndex(index)}
                >
                  {proofPoint.code}
                </button>
              ))}
            </div>
          </div>
          <figcaption>
            <span>{activeProofPoint.code}</span>
            <strong>{activeProofPoint.label}</strong>
          </figcaption>
        </figure>

        <label className="method-touch-rail">
          <span id="method-touch-rail-label">Find / Trace / Ship</span>
          <input
            type="range"
            min={0}
            max={Math.max(proofPoints.length - 1, 0)}
            step={1}
            value={activeProofIndex}
            aria-labelledby="method-touch-rail-label"
            aria-describedby="method-touch-description"
            aria-valuetext={`Step ${activeProofIndex + 1} of ${proofPoints.length}. ${activeProofPoint.label}. ${activeProofPoint.readout}`}
            onChange={(event) => {
              commitProofIndex(Number(event.currentTarget.value));
            }}
            onInput={(event) => {
              commitProofIndex(Number(event.currentTarget.value));
            }}
            onKeyUp={(event) => {
              commitProofIndex(Number(event.currentTarget.value));
            }}
          />
          <i aria-hidden>
            {proofPoints.map((proofPoint) => (
              <b
                key={proofPoint.id}
                data-active={proofPoint.id === activeProofPoint.id ? "true" : "false"}
                data-seen={inspectedProofPointIds.includes(proofPoint.id) ? "true" : "false"}
              />
            ))}
          </i>
        </label>

        <article className="method-touch-proof-reveal" aria-live="polite" aria-atomic="true">
          <span>
            {activeProofPoint.code} / {actionLabel(activeProofPoint.action)}
          </span>
          <h2>{activeProofPoint.prompt}</h2>
          <p>{activeProofPoint.finding}</p>
          <small>{activeProofPoint.interfaceDecision}</small>
        </article>

        <CaseSignalReceipt
          caseComplete={caseComplete}
          completionProgress={completionProgress}
          investigationCase={investigationCase}
          investigationStatus={investigationStatus}
        />

        <div className="method-touch-completion" data-visible={caseComplete ? "true" : "false"}>
          {contactAction ? <MethodAction action={contactAction} primary /> : null}
          {activeProject.links.map((action) => (
            <MethodAction key={action.href} action={action} />
          ))}
          <ProjectDeepLink project={activeProject} />
        </div>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {caseComplete
            ? "Surface shipped. Completed proof receipt is available."
            : `${activeProofPoint.label}. ${activeProofPoint.readout}`}
        </p>
      </div>
    </section>
  );
}

export function MethodWorldStage({
  archiveArtifacts,
  chapters,
  communityArtifacts,
  educationRecords,
  fieldNotes,
  investigationCase,
  joeProfile,
  learningCredentials,
  moments,
  profileFacts,
  productReportArtifacts,
  profileMedia,
  proofPoints,
  projects,
  socialChannels,
  writingFragments,
}: {
  archiveArtifacts: readonly ArchiveArtifact[];
  chapters: readonly MethodWorldChapter[];
  communityArtifacts: readonly CommunityArtifact[];
  educationRecords: readonly EducationRecord[];
  fieldNotes: readonly FieldNote[];
  investigationCase: InvestigationCase;
  joeProfile: JoeProfile;
  learningCredentials: readonly LearningCredential[];
  moments: readonly MethodWorldMoment[];
  profileFacts: readonly ProfileFact[];
  productReportArtifacts: readonly ProductReportArtifact[];
  profileMedia: SiteMedia;
  proofPoints: readonly InvestigationStep[];
  projects: readonly PublicProjectCaseStudy[];
  socialChannels: readonly SocialChannel[];
  writingFragments: readonly WritingFragment[];
}) {
  const [state, dispatch] = useReducer(investigationReducer, {
    activeLens: proofPoints[0]?.lens ?? "breakage",
    activeProofPointId: proofPoints[0]?.id ?? "preview",
    inspectedProofPointIds: [],
    isOperating: false,
    selectedProjectSlug: null,
    status: "idle",
    traceProgress: 0,
  } satisfies InvestigationState);
  const {
    activeLens,
    activeProofPointId,
    inspectedProofPointIds,
    isOperating,
    selectedProjectSlug,
    status: investigationStatus,
    traceProgress,
  } = state;
  const desktopMotion = useDesktopWorldMotion();
  const rootRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const calibrationTimerRef = useRef<number | null>(null);
  const operatingRef = useRef(false);
  const lastProgressRef = useRef(0);
  const programmaticScrollUntilRef = useRef(0);
  const pendingHashScrollBehaviorRef = useRef<HashScrollBehavior | null>(null);
  const inspectedProofPointIdsRef = useRef(inspectedProofPointIds);
  const activeMoment = nearestMoment(moments, traceProgress);
  const activeChapter =
    chapters.find((chapter) => chapter.id === activeMoment.chapter) ??
    nearestChapter(chapters, traceProgress);
  const workProgress = clamp(
    (traceProgress - WORK_PROJECT_PROGRESS_START) / WORK_PROJECT_PROGRESS_SPAN,
  );
  const progressProjectIndex = Math.min(
    projects.length - 1,
    Math.max(0, Math.round(workProgress * (projects.length - 1))),
  );
  const selectedProjectIndex = selectedProjectSlug
    ? projects.findIndex((project) => project.slug === selectedProjectSlug)
    : -1;
  const activeProjectIndex =
    activeChapter.id === "work" && selectedProjectIndex >= 0
      ? selectedProjectIndex
      : progressProjectIndex;
  const activeProject = projects[activeProjectIndex] ?? projects[0];
  const sim0Project = projects.find((project) => project.slug === "sim0") ?? projects[0];
  const activeProofPoint =
    proofPoints.find((proofPoint) => proofPoint.id === activeProofPointId) ??
    proofPoints[0]!;
  const activeCaseAction =
    investigationCase.actions.find((action) => action.id === activeProofPoint.action) ??
    investigationCase.actions[0];
  const requiredStepIds = investigationCase.signature.requiredStepIds;
  const orderedRequiredSteps = orderedRequiredProofPoints(
    proofPoints,
    requiredStepIds,
  );
  const activeActionProofPoints = activeCaseAction
    ? proofPointsForAction(activeCaseAction, proofPoints)
    : [];
  const activeActionProofIds = activeActionProofPoints.map(
    (proofPoint) => proofPoint.id,
  );
  const inspectedRequiredCount = requiredStepIds.filter((stepId) =>
    inspectedProofPointIds.includes(stepId),
  ).length;
  const completionProgress =
    inspectedRequiredCount / Math.max(requiredStepIds.length, 1);
  const caseComplete = completionProgress >= 1;
  const projectVisible = activeChapter.id === "work";
  const emailChannel = socialChannels.find((channel) => channel.label === "Email");
  const [isCalibrating, setIsCalibrating] = useState(false);
  const routeReceipt = proofRouteLabel(orderedRequiredSteps);
  const primaryProfileFacts = factsByLabel(profileFacts, primaryProfileFactLabels);
  const personalProofFacts = factsByLabel(profileFacts, personalProofFactLabels);
  const featuredCommunityArtifacts = communityArtifacts.slice(0, 6);
  const contactAction: SiteAction | undefined = emailChannel
    ? {
        id: "send-stuck-interface",
        label: "Send Joe a stuck interface",
        href: `${emailChannel.href}?subject=${encodeURIComponent(
          caseComplete
            ? "Surface shipped route for Joe"
            : "Stuck interface for Joe",
        )}&body=${encodeURIComponent(
          [
            "Joe, I have a stuck interface.",
            "",
            `Completed route: ${routeReceipt}`,
            `Current proof: ${activeProofPoint.label}`,
            "",
            "What is stuck:",
          ].join("\n"),
        )}`,
        external: false,
        ariaLabel: "Email Joe about a stuck interface",
        kind: "primary",
      }
    : undefined;
  const workChapter =
    chapters.find((chapter) => chapter.id === "work") ?? chapters[2] ?? chapters[0];
  const activeRouteProgress =
    activeChapter.progress <= 0
      ? 0
      : clamp(traceProgress / activeChapter.progress);
  const nodes = useMemo(
    () => [
      ...chapters.map((chapter) => ({
          id: chapter.id,
          x: chapter.point.x,
          y: chapter.point.y,
          depth: 0.46 + chapter.progress * 0.34,
          tension: 0.38 + chapter.progress * 0.28,
          sceneMode: chapter.sceneMode,
        })),
      ...investigationCase.steps.map((step) => ({
        id: proofNodeId(step.id),
        x: step.webglNode.x,
        y: step.webglNode.y,
        depth: step.webglNode.depth,
        tension: step.webglNode.tension,
        sceneMode: "work" as const,
      })),
    ],
    [chapters, investigationCase.steps],
  );
  const activeWebGLNodeId =
    activeChapter.id === "work"
      ? proofNodeId(activeProofPoint.id)
      : activeChapter.id;
  const style = {
    "--method-world-progress": traceProgress,
    "--method-world-progress-percent": `${traceProgress * 100}%`,
    "--method-world-active-x": `${activeChapter.point.x}%`,
    "--method-world-active-y": `${activeChapter.point.y}%`,
    "--method-world-completion-percent": `${completionProgress * 100}%`,
    "--method-world-route-progress": activeRouteProgress,
  } as CSSProperties;

  const setProgress = useCallback((progress: number) => {
    const nextProgress = clamp(progress);

    lastProgressRef.current = nextProgress;
    dispatch({ type: "set_progress", progress: nextProgress });
  }, []);

  const requestHashScroll = useCallback((behavior: HashScrollBehavior) => {
    programmaticScrollUntilRef.current = performance.now() + 650;
    pendingHashScrollBehaviorRef.current = behavior;
  }, []);

  useIsomorphicLayoutEffect(() => {
    const behavior = pendingHashScrollBehaviorRef.current;

    if (!behavior) {
      return;
    }

    pendingHashScrollBehaviorRef.current = null;
    scrollCurrentHashTargetIntoView(behavior);
  });

  const clearCalibrationTimer = useCallback(() => {
    if (calibrationTimerRef.current !== null) {
      window.clearTimeout(calibrationTimerRef.current);
      calibrationTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearCalibrationTimer();
  }, [clearCalibrationTimer]);

  useEffect(() => {
    inspectedProofPointIdsRef.current = inspectedProofPointIds;
  }, [inspectedProofPointIds]);

  const commitProgress = useCallback(
    (
      progress = lastProgressRef.current,
      options?: { history?: HistoryMode; scroll?: boolean },
    ) => {
      const chapter = nearestChapter(chapters, progress);

      operatingRef.current = false;
      dispatch({
        type: "commit_chapter",
        clearProject: chapter.id !== "work",
        progress: chapter.progress,
        status: chapter.id === "work" ? "inspecting" : "briefing",
      });
      lastProgressRef.current = chapter.progress;
      syncChapterUrl(chapter, options?.history ?? "replace");

      if (options?.scroll) {
        requestHashScroll(desktopMotion ? "smooth" : "auto");
      }
    },
    [chapters, desktopMotion, requestHashScroll],
  );

  const commitChapter = useCallback(
    (chapter: MethodWorldChapter, options?: { scroll?: boolean }) => {
      lastProgressRef.current = chapter.progress;
      dispatch({
        type: "commit_chapter",
        clearProject: chapter.id !== "work",
        progress: chapter.progress,
        status: chapter.id === "work" ? "inspecting" : "briefing",
      });
      syncChapterUrl(chapter, "push");

      if (options?.scroll) {
        requestHashScroll(desktopMotion ? "smooth" : "auto");
      }
    },
    [desktopMotion, requestHashScroll],
  );

  const commitProject = useCallback(
    (project: PublicProjectCaseStudy, index: number) => {
      const nextProgress = projectProgress(index, projects.length);

      operatingRef.current = true;
      lastProgressRef.current = nextProgress;
      dispatch({
        type: "select_project",
        progress: nextProgress,
        slug: project.slug,
      });
      syncProjectUrl(project, "push");
      window.setTimeout(() => {
        operatingRef.current = false;
        dispatch({ type: "set_operating", isOperating: false });
      }, 180);
    },
    [projects.length],
  );

  const selectProofPoint = useCallback(
    (
      proofPoint: InvestigationStep,
      mode: HistoryMode = "push",
      stepIds: readonly string[] = [proofPoint.id],
    ) => {
      operatingRef.current = true;
      lastProgressRef.current = WORK_PROJECT_PROGRESS_START;
      dispatch({
        type: "select_proof",
        lens: proofPoint.lens,
        progress: WORK_PROJECT_PROGRESS_START,
        requiredStepIds,
        stepId: proofPoint.id,
        stepIds,
      });
      syncProofUrl(proofPoint, proofPoint.lens, mode, uniqueIds([
        ...inspectedProofPointIdsRef.current,
        ...stepIds,
      ]));
      window.setTimeout(() => {
        operatingRef.current = false;
        dispatch({ type: "set_operating", isOperating: false });
      }, 180);
    },
    [requiredStepIds],
  );

  const selectCaseAction = useCallback(
    (action: CaseAction, mode: HistoryMode = "push") => {
      const primaryProofPoint = nextProofPointForAction(
        action,
        proofPoints,
        inspectedProofPointIdsRef.current,
      );

      if (!primaryProofPoint) {
        return;
      }

      selectProofPoint(primaryProofPoint, mode, [primaryProofPoint.id]);
    },
    [proofPoints, selectProofPoint],
  );

  const keepFocusedControlVisible = useCallback(
    (element: HTMLElement) => {
      function revealFocusedControl() {
        const rect = element.getBoundingClientRect();
        const topGuard = 88;
        const bottomGuard = window.innerHeight - 32;

        if (rect.top >= topGuard && rect.bottom <= bottomGuard) {
          return;
        }

        const targetTop = Math.max(
          0,
          rect.top + window.scrollY - window.innerHeight * 0.42,
        );

        window.scrollTo({
          behavior: "instant",
          top: targetTop,
        });
      }

      window.requestAnimationFrame(() => {
        revealFocusedControl();
        window.requestAnimationFrame(revealFocusedControl);
      });
    },
    [],
  );

  const progressFromPointer = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const rect = railRef.current?.getBoundingClientRect();

      if (!rect || rect.width <= 0) {
        return traceProgress;
      }

      return clamp((event.clientX - rect.left) / rect.width);
    },
    [traceProgress],
  );

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const progress = progressFromPointer(event);

    event.currentTarget.setPointerCapture(event.pointerId);
    clearCalibrationTimer();
    setIsCalibrating(false);
    calibrationTimerRef.current = window.setTimeout(() => {
      setIsCalibrating(true);
    }, 220);
    operatingRef.current = true;
    lastProgressRef.current = progress;
    dispatch({
      type: "set_progress",
      isOperating: true,
      progress,
      status: "tracing",
    });
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }

    setProgress(progressFromPointer(event));
  }

  function handlePointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    clearCalibrationTimer();
    setIsCalibrating(false);
    commitProgress();
  }

  function handleRangeKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      commitProgress(undefined, { scroll: true });
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setProgress(0);
      commitProgress(0, { scroll: true });
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setProgress(1);
      commitProgress(1, { scroll: true });
      return;
    }

    const direction =
      event.key === "ArrowRight" || event.key === "ArrowUp"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowDown"
          ? -1
          : 0;

    if (!direction) {
      return;
    }

    event.preventDefault();
    const progress = traceProgress + direction * 0.035;

    operatingRef.current = true;
    lastProgressRef.current = clamp(progress);
    dispatch({
      type: "set_progress",
      isOperating: true,
      progress,
      status: "tracing",
    });
  }

  const applyLocationState = useCallback(
    (options?: { scroll?: boolean }) => {
      const routeProofIds = proofRouteFromLocation(proofPoints);
      const routeProofPoint =
        routeProofIds.length > 0
          ? proofPoints.find(
              (proofPoint) => proofPoint.id === routeProofIds.at(-1),
            )
          : undefined;
      const proofPoint = proofPointFromLocation(proofPoints) ?? routeProofPoint;
      const lens = lensFromLocation();

      if (proofPoint) {
        const nextLens = lens ?? proofPoint.lens;
        const nextInspectedProofPointIds = uniqueIds([
          ...inspectedProofPointIdsRef.current,
          ...routeProofIds,
          proofPoint.id,
        ]);

        operatingRef.current = true;
        lastProgressRef.current = WORK_PROJECT_PROGRESS_START;
        dispatch({
          type: "hydrate",
          activeLens: nextLens,
          activeProofPointId: proofPoint.id,
          inspectedProofPointIds: nextInspectedProofPointIds,
          isOperating: true,
          selectedProjectSlug: "sim0",
          status: statusForInspection(
            nextInspectedProofPointIds,
            requiredStepIds,
          ),
          traceProgress: WORK_PROJECT_PROGRESS_START,
        });

        if (options?.scroll) {
          requestHashScroll("instant");
        }

        window.setTimeout(() => {
          operatingRef.current = false;
          dispatch({ type: "set_operating", isOperating: false });
        }, 240);
        return;
      }

      const project = projectFromLocation(projects);

      if (project) {
        const projectIndex = projects.findIndex(
          (item) => item.slug === project.slug,
        );
        const nextProgress = projectProgress(projectIndex, projects.length);

        operatingRef.current = true;
        lastProgressRef.current = nextProgress;
        dispatch({
          type: "hydrate",
          isOperating: true,
          selectedProjectSlug: project.slug,
          status: project.slug === "sim0" ? "inspecting" : "briefing",
          traceProgress: nextProgress,
        });

        if (options?.scroll) {
          requestHashScroll("instant");
        }

        window.setTimeout(() => {
          operatingRef.current = false;
          dispatch({ type: "set_operating", isOperating: false });
        }, 240);
        return;
      }

      const chapter = chapterFromLocation(chapters);

      if (chapter) {
        lastProgressRef.current = chapter.progress;
        dispatch({
          type: "hydrate",
          selectedProjectSlug: chapter.id === "work" ? undefined : null,
          status: chapter.id === "work" ? "inspecting" : "briefing",
          traceProgress: chapter.progress,
        });

        if (options?.scroll) {
          requestHashScroll("instant");
        }
      }
    },
    [chapters, projects, proofPoints, requestHashScroll, requiredStepIds],
  );

  useIsomorphicLayoutEffect(() => {
    applyLocationState({ scroll: true });
    scrollCurrentHashTargetIntoView("instant");

    const timers = [90, 450].map((delay) =>
      window.setTimeout(() => {
        applyLocationState({ scroll: true });
        scrollCurrentHashTargetIntoView("instant");
      }, delay),
    );

    function handleLocationChange() {
      applyLocationState({ scroll: true });
      window.requestAnimationFrame(() => {
        scrollCurrentHashTargetIntoView("instant");
      });
    }

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, [applyLocationState]);

  useEffect(() => {
    if (!desktopMotion || !rootRef.current) {
      return;
    }

    let cancelled = false;
    let context: { revert: () => void } | undefined;
    let trigger: { kill: () => void } | undefined;

    async function setupScrollTrigger() {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled || !rootRef.current) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);
      context = gsap.context(() => {
        trigger = ScrollTrigger.create({
          trigger: rootRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            if (
              !operatingRef.current &&
              performance.now() >= programmaticScrollUntilRef.current
            ) {
              setProgress(self.progress);
            }
          },
        });

        window.requestAnimationFrame(() => {
          applyLocationState({ scroll: true });
          scrollCurrentHashTargetIntoView("instant");
        });
      }, rootRef);
    }

    setupScrollTrigger();

    return () => {
      cancelled = true;
      trigger?.kill();
      context?.revert();
    };
  }, [applyLocationState, desktopMotion, setProgress]);

  useEffect(() => {
    if (desktopMotion) {
      return;
    }

    const targets = chapters
      .map((chapter) => document.querySelector<HTMLElement>(chapter.anchor))
      .filter((target): target is HTMLElement => Boolean(target));

    if (targets.length === 0) {
      return;
    }

    let frame = 0;

    function updateFromScroll() {
      frame = 0;

      if (
        operatingRef.current ||
        performance.now() < programmaticScrollUntilRef.current
      ) {
        return;
      }

      const anchorLine = Math.min(window.innerHeight * 0.42, 260);
      const visibleTarget =
        targets.find((target) => {
          const rect = target.getBoundingClientRect();

          return rect.top <= anchorLine && rect.bottom >= anchorLine;
        }) ??
        targets
          .map((target) => {
            const rect = target.getBoundingClientRect();

            return {
              distance: Math.abs(rect.top - anchorLine),
              target,
            };
          })
          .sort((a, b) => a.distance - b.distance)[0]?.target;

      const chapter = chapters.find(
        (item) => item.anchor === `#${visibleTarget?.id}`,
      );

      if (chapter) {
        setProgress(chapter.progress);
      }
    }

    function scheduleUpdate() {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(updateFromScroll);
    }

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [chapters, desktopMotion, setProgress]);

  return (
    <section
      ref={rootRef}
      id="method-world"
      className="method-world-root"
      data-active-chapter={activeChapter.id}
      data-calibrating={isCalibrating ? "true" : "false"}
      data-investigation-status={investigationStatus}
      data-operating={isOperating ? "true" : "false"}
      style={style}
      aria-label="Joe Simo personal method and work"
    >
      <div className="method-world-pin">
        <div className="method-world-calibration" aria-hidden>
          <span>PX / 26.5470 N</span>
        </div>
        {desktopMotion ? (
          <WebGLSignalField
            activeActionId={activeCaseAction.id}
            activeNodeId={activeWebGLNodeId}
            activeRouteProgress={activeRouteProgress}
            caseComplete={caseComplete}
            completionProgress={completionProgress}
            className="method-world-webgl"
            inspectedNodeIds={inspectedProofPointIds.map(proofNodeId)}
            investigationStatus={investigationStatus}
            isTracing={isOperating}
            interactionMode={
              caseComplete
                ? "receipt"
                : isOperating
                  ? "scrubbing"
                  : "idle"
            }
            nodes={nodes}
            originNodeId="joe"
            sceneMode={activeChapter.sceneMode}
            traceVelocity={isOperating ? 2 : 0}
          />
        ) : (
          <StaticWorldField />
        )}

        <div className="method-world-frame">
          <div className="method-world-identity">
            <span className="method-world-kicker">
              {joeProfile.kicker}
            </span>
            <div className="method-world-title-row">
              <h1>Joe Simo</h1>
            </div>
            <p>
              <span>{joeProfile.headline}</span>
              <small>{joeProfile.detail}</small>
            </p>
            <div className="method-world-primary-actions">
              <a
                href="#work"
                className="method-world-action is-primary"
                onClick={(event) => {
                  event.preventDefault();
                  commitChapter(workChapter, { scroll: true });
                }}
              >
                Explore the Work
                <SiteIcon iconKey="arrowUpRight" aria-hidden />
              </a>
              <a
                href={emailChannel?.href ?? "mailto:hello@joesimo.com"}
                className="method-world-action"
              >
                Email Joe
                <SiteIcon iconKey="arrowUpRight" aria-hidden />
              </a>
            </div>
          </div>

          <JoeEditorialArtifact
            profileMedia={profileMedia}
            traceProgress={traceProgress}
          />

          <div className="method-world-console">
            <label htmlFor="method-world-range">
              Method route
            </label>
            <div
              ref={railRef}
              className="method-world-trace"
              data-operating={isOperating ? "true" : "false"}
              data-calibrating={isCalibrating ? "true" : "false"}
              onPointerCancel={handlePointerEnd}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
            >
              <span className="method-world-trace-track" aria-hidden>
                <span className="method-world-trace-fill" />
                <span className="method-world-trace-head" />
              </span>
              <input
                id="method-world-range"
                type="range"
                min={0}
                max={1}
                step={0.001}
                value={traceProgress}
                aria-label="Trace Joe Simo's method and work"
                aria-valuetext={`${activeMoment.label}. ${activeMoment.readout}`}
                onBlur={() => commitProgress()}
                onChange={(event) => setProgress(Number(event.currentTarget.value))}
                onFocus={() => {
                  operatingRef.current = true;
                  dispatch({
                    type: "set_operating",
                    isOperating: true,
                    status: "tracing",
                  });
                }}
                onKeyDown={handleRangeKeyDown}
                onKeyUp={() => {
                  operatingRef.current = false;
                  dispatch({ type: "set_operating", isOperating: false });
                }}
              />
            </div>
            <output htmlFor="method-world-range">
              {isCalibrating ? joeProfile.receiptTitle : activeMoment.readout}
            </output>
            <p className="sr-only" aria-live="polite" aria-atomic="true">
              {activeMoment.label}: {activeMoment.readout}
              {projectVisible
                ? ` Active proof: ${activeProofPoint.label}. Active work: ${activeProject.title}.`
                : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="method-world-chapters" aria-label="Method world chapters">
        {chapters.map((chapter) => (
          <section
            key={chapter.id}
            id={chapter.anchor.slice(1)}
            data-method-chapter={chapter.id}
            className="method-world-chapter"
            aria-label={chapter.title}
          >
            <div className="method-world-chapter-copy">
              <span>{chapter.code} / {chapter.label}</span>
              <h2>{chapter.title}</h2>
              <p>{chapter.body}</p>
            </div>

            {chapter.id === "joe" ? (
              <div className="method-world-joe-record">
                <dl className="method-world-profile-grid" aria-label="Joe Simo profile facts">
                  {primaryProfileFacts.map((fact) => (
                    <div key={fact.label}>
                      <dt>{fact.label}</dt>
                      <dd>
                        <strong>{fact.value}</strong>
                        {fact.detail ? <span>{fact.detail}</span> : null}
                        {fact.source ? <em>{fact.source}</em> : null}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div
                  className="method-world-personal-proof"
                  aria-label="Personal proof and taste references"
                >
                  {personalProofFacts.map((fact) => (
                    <article key={fact.label}>
                      <span>{fact.source}</span>
                      <strong>{fact.value}</strong>
                      <small>{fact.detail}</small>
                    </article>
                  ))}
                </div>

                <section
                  className="method-world-learning-record"
                  aria-label="Joe Simo education and certifications"
                >
                  <div className="method-world-learning-intro">
                    <span>Learning record</span>
                    <strong>Schools and certifications matter here.</strong>
                    <p>
                      The LinkedIn trail adds formal proof behind the method:
                      telematics, infrastructure, support tooling, and security
                      surfaces.
                    </p>
                  </div>

                  <div className="method-world-education-list">
                    {educationRecords.map((record) => (
                      <a
                        key={`${record.school}-${record.focus}`}
                        href={record.href}
                        target={record.href?.startsWith("http") ? "_blank" : undefined}
                        rel={record.href?.startsWith("http") ? "noreferrer" : undefined}
                      >
                        <span>{record.sourceLabel}</span>
                        <strong>{record.focus}</strong>
                        <small>{record.school}</small>
                        <em>{record.period}</em>
                        <p>{record.detail}</p>
                      </a>
                    ))}
                  </div>

                  <div className="method-world-certification-list">
                    {learningCredentials.map((credential) => (
                      <a
                        key={`${credential.issuer}-${credential.label}`}
                        href={credential.href}
                        target={credential.href?.startsWith("http") ? "_blank" : undefined}
                        rel={credential.href?.startsWith("http") ? "noreferrer" : undefined}
                      >
                        <span>{credential.sourceLabel}</span>
                        <strong>{credential.label}</strong>
                        <small>{credential.issuer}</small>
                        {credential.issued || credential.period ? (
                          <em>{credential.issued ?? credential.period}</em>
                        ) : null}
                      </a>
                    ))}
                  </div>
                </section>
              </div>
            ) : null}

            {chapter.id === "method" ? (
              <div className="method-world-receipts">
                {fieldNotes.map((note) => (
                  <span key={note.code}>
                    <em>{note.code}</em>
                    <strong>{note.title}</strong>
                    <small>{note.source}</small>
                  </span>
                ))}
              </div>
            ) : null}

            {chapter.id === "work" ? (
              <>
                <MethodTouchConsole
                  activeProject={sim0Project}
                  activeProofPoint={activeProofPoint}
                  caseComplete={caseComplete}
                  completionProgress={completionProgress}
                  contactAction={contactAction}
                  investigationCase={investigationCase}
                  investigationStatus={investigationStatus}
                  inspectedProofPointIds={inspectedProofPointIds}
                  onSelectProofPoint={selectProofPoint}
                  proofPoints={proofPoints}
                />
                <div className="method-world-work-proof">
                  <ProofCaseStage
                    activeActionId={activeCaseAction.id}
                    activeActionProofIds={activeActionProofIds}
                    activeLens={activeLens}
                    activeProject={activeProject}
                    activeProofPoint={activeProofPoint}
                    caseComplete={caseComplete}
                    completionProgress={completionProgress}
                    contactAction={contactAction}
                    investigationCase={investigationCase}
                    investigationStatus={investigationStatus}
                    inspectedProofPointIds={inspectedProofPointIds}
                    motionEnabled={desktopMotion}
                    onSelectAction={selectCaseAction}
                    onSelectProject={commitProject}
                    onSelectProofPoint={selectProofPoint}
                    orderedRequiredSteps={orderedRequiredSteps}
                    projects={projects}
                    proofPoints={proofPoints}
                  />
                </div>
                <div className="method-world-chamber-grid">
                  {projects.map((project, index) => (
                    <button
                      key={project.slug}
                      type="button"
                      className="method-world-chamber-button"
                      data-active={index === activeProjectIndex ? "true" : "false"}
                      onClick={() => {
                        commitProject(project, index);
                      }}
                      onFocus={(event) => {
                        keepFocusedControlVisible(event.currentTarget);
                      }}
                      aria-current={index === activeProjectIndex ? "step" : undefined}
                      aria-label={`Show ${project.title} in the Work proof`}
                    >
                      <ProjectChamber activeProject={activeProject} project={project} />
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {chapter.id === "notes" ? (
              <div className="method-world-notes-stack">
                <div className="method-world-product-reports">
                  {productReportArtifacts.map((artifact) => (
                    <article key={artifact.code}>
                      <span>{artifact.code} / {artifact.sourceLabel}</span>
                      <strong>{artifact.title}</strong>
                      <small>{artifact.body}</small>
                      <em>{artifact.outcome}</em>
                    </article>
                  ))}
                </div>

                <div
                  className="method-world-community-strip"
                  role="region"
                  tabIndex={0}
                  aria-label="React Miami 2026 developer community trail"
                >
                  <article className="method-world-community-intro">
                    <span>R00 / Community trail</span>
                    <strong>React Miami developer trail</strong>
                    <small>
                      Six owned frames from React Miami 2026. They add a human
                      layer without turning the page into a social wall.
                    </small>
                  </article>
                  {featuredCommunityArtifacts.map((artifact) => (
                    <article key={artifact.code}>
                      <div className="method-world-community-media">
                        <Image
                          src={artifact.media.src}
                          alt={artifact.media.alt}
                          width={artifact.media.width}
                          height={artifact.media.height}
                          sizes="(max-width: 768px) 78vw, 22vw"
                        />
                      </div>
                      <span>{artifact.code} / {artifact.sourceLabel}</span>
                      <strong>{artifact.title}</strong>
                    </article>
                  ))}
                </div>

                <div
                  className="method-world-archive-strip"
                  role="region"
                  tabIndex={0}
                  aria-label="Surviving web and logo archive"
                >
                  {archiveArtifacts.map((artifact) => (
                    <article key={artifact.code}>
                      <div className="method-world-archive-media">
                        <Image
                          src={artifact.media.src}
                          alt={artifact.media.alt}
                          width={artifact.media.width}
                          height={artifact.media.height}
                          sizes="(max-width: 768px) 70vw, 18vw"
                        />
                      </div>
                      <span>{artifact.code} / {artifact.sourceLabel}</span>
                      <strong>{artifact.title}</strong>
                      <small>{artifact.body}</small>
                    </article>
                  ))}
                </div>

                <div className="method-world-notes-grid">
                  {writingFragments.map((fragment) => (
                    <article key={fragment.code}>
                      <span>{fragment.code} / {fragment.source}</span>
                      <strong>{fragment.title}</strong>
                      <small>{fragment.body}</small>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            {chapter.id === "contact" ? (
              <div className="method-world-contact-panel">
                <a
                  href="mailto:hello@joesimo.com"
                  onFocus={(event) => {
                    keepFocusedControlVisible(event.currentTarget);
                  }}
                >
                  hello@joesimo.com
                </a>
                <span>{joeProfile.contactPrompt}</span>
              </div>
            ) : null}
          </section>
        ))}
      </div>
    </section>
  );
}
