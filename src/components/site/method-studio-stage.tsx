"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { SiteIcon } from "@/components/site/site-icons";
import type { WebGLSignalFieldProps } from "@/components/site/webgl-signal-field";
import type {
  ArtifactProofPoint,
  GithubRepository,
  OwnedArtifact,
  ProjectSignal,
  SiteAction,
  SocialChannel,
  StudioMoment,
  StudioScene,
  StudioSceneId,
  StudioSpecimen,
} from "@/lib/site-data";
import { cn } from "@/lib/utils";

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

function routePath(origin: StudioScene, target: StudioScene) {
  const deltaX = target.point.x - origin.point.x;
  const pull = 0.34;
  const firstControlX = origin.point.x + deltaX * pull;
  const secondControlX = target.point.x - deltaX * pull;

  return `M ${origin.point.x} ${origin.point.y} C ${firstControlX} ${origin.point.y}, ${secondControlX} ${target.point.y}, ${target.point.x} ${target.point.y}`;
}

function nearestScene(
  scenes: readonly StudioScene[],
  progress: number,
) {
  return scenes.reduce((nearest, scene) => {
    const currentDistance = Math.abs(scene.progress - progress);
    const nearestDistance = Math.abs(nearest.progress - progress);

    return currentDistance < nearestDistance ? scene : nearest;
  }, scenes[0]);
}

function nearestMoment(
  moments: readonly StudioMoment[],
  progress: number,
) {
  return moments.reduce((nearest, moment) => {
    const currentDistance = Math.abs(moment.progress - progress);
    const nearestDistance = Math.abs(nearest.progress - progress);

    return currentDistance < nearestDistance ? moment : nearest;
  }, moments[0]);
}

function sceneFromLocation(scenes: readonly StudioScene[]) {
  const url = new URL(window.location.href);
  const hashScene = scenes.find((scene) => scene.sectionAnchor === url.hash);

  if (hashScene) {
    return hashScene;
  }

  const map = url.searchParams.get("map");
  const mappedSceneId =
    map === "method" || map === "background" || map === "systems"
      ? "breakage"
      : map === "work" || map === "sim0"
        ? "surface"
        : map === "trail" || map === "notes" || map === "writing"
          ? "trail"
          : map === "contact"
            ? "contact"
            : null;

  return mappedSceneId
    ? scenes.find((scene) => scene.id === mappedSceneId)
    : undefined;
}

function syncSceneUrl(scene: StudioScene) {
  const url = new URL(window.location.href);

  url.searchParams.delete("map");
  url.hash = scene.sectionAnchor;
  window.history.replaceState(
    null,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}

function activeRouteProgress(scene: StudioScene, progress: number) {
  if (scene.progress <= 0) {
    return 0;
  }

  return clampProgress(progress / scene.progress);
}

function progressBetween(progress: number, start: number, end: number) {
  if (end <= start) {
    return 0;
  }

  return clampProgress((progress - start) / (end - start));
}

function useDesktopSignal() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const dataPreference = (
      navigator as Navigator & {
        connection?: {
          saveData?: boolean;
        };
      }
    ).connection?.saveData;

    function update() {
      if (!desktopQuery.matches || motionQuery.matches || dataPreference) {
        setEnabled(false);
        return;
      }

      const canvas = document.createElement("canvas");

      setEnabled(Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl")));
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

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);

    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

function StudioAction({
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
      className={cn("method-studio-action", primary && "is-primary")}
    >
      {action.label}
      <SiteIcon iconKey="arrowUpRight" aria-hidden />
      <ExternalCue show={Boolean(action.external)} />
    </a>
  );
}

function SceneMedia({
  moment,
  scene,
  specimen,
}: {
  moment?: StudioMoment;
  scene: StudioScene;
  specimen?: StudioSpecimen;
}) {
  if (scene.id === "joe") {
    return (
      <span className="method-studio-word" aria-hidden>
        Joe
      </span>
    );
  }

  const media = specimen?.media ?? scene.media;

  if (!media) {
    return (
      <span className="method-studio-word" aria-hidden>
        {scene.shortLabel}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "method-studio-media",
        media.kind === "artifact" && "is-artifact",
      )}
      aria-hidden
    >
      <Image
        src={media.src}
        alt=""
        width={media.width}
        height={media.height}
        sizes={
          media.kind === "artifact"
            ? "(min-width: 1024px) 42vw, 92vw"
            : "160px"
        }
        className="size-full object-cover grayscale"
        style={
          moment?.artifactCrop
            ? ({
                objectPosition: moment.artifactCrop.objectPosition,
                scale: moment.artifactCrop.scale,
              } as CSSProperties)
            : undefined
        }
      />
    </span>
  );
}

function StudioSpecimenPanel({
  isTracing,
  moment,
  projectSignals,
  scene,
  specimen,
}: {
  isTracing: boolean;
  moment?: StudioMoment;
  projectSignals: readonly ProjectSignal[];
  scene: StudioScene;
  specimen?: StudioSpecimen;
}) {
  return (
    <article
      id="method-studio-readout"
      className="method-studio-specimen"
      data-scene={scene.id}
      data-tracing={isTracing ? "true" : "false"}
      aria-live="polite"
    >
      <span className="method-studio-kicker">
        {moment?.code ?? scene.code} /{" "}
        {moment?.sourceLabel ?? specimen?.sourceLabel ?? scene.sourceLabel}
      </span>
      <div className="method-studio-specimen-main">
        <SceneMedia moment={moment} scene={scene} specimen={specimen} />
        <span className="method-studio-specimen-copy">
          <strong>{specimen?.title ?? scene.title}</strong>
          <em>{moment?.readout ?? scene.title}</em>
          <span>{specimen?.body ?? scene.body}</span>
        </span>
      </div>
      {scene.id === "trail" ? (
        <ProjectTrace compact projects={projectSignals} />
      ) : null}
      {moment?.actions?.length || specimen?.actions?.length || scene.action ? (
        <div className="method-studio-actions" role="group" aria-label={`${scene.label} actions`}>
          {(
            moment?.actions ??
            specimen?.actions ??
            ([scene.action].filter(Boolean) as SiteAction[])
          ).map(
            (action, index) => (
              <StudioAction
                key={`${action.label}-${action.href}`}
                action={action}
                primary={index === 0}
              />
            ),
          )}
        </div>
      ) : null}
    </article>
  );
}

function ProofCuts({
  active,
  proofPoints,
}: {
  active: boolean;
  proofPoints: readonly ArtifactProofPoint[];
}) {
  return (
    <div className="method-studio-proof-cuts" data-active={active ? "true" : "false"}>
      {proofPoints.map((point) => (
        <span key={point.id}>
          <em>{point.code}</em>
          <strong>{point.label}</strong>
          <small>{point.visibleLabel}</small>
        </span>
      ))}
    </div>
  );
}

function ArtifactReveal({
  active,
  artifacts,
}: {
  active: boolean;
  artifacts: readonly OwnedArtifact[];
}) {
  const primaryArtifact =
    artifacts.find((artifact) => artifact.priority === "primary") ??
    artifacts[0];
  const secondaryArtifacts = artifacts.filter(
    (artifact) => artifact.id !== primaryArtifact?.id,
  );

  if (!primaryArtifact) {
    return null;
  }

  return (
    <aside
      className="method-studio-artifact-reveal"
      data-active={active ? "true" : "false"}
      aria-hidden={active ? undefined : true}
      aria-label="Owned work artifacts"
    >
      <div className="method-studio-artifact-main">
        <span className="method-studio-kicker">
          {primaryArtifact.code} / {primaryArtifact.sourceLabel}
        </span>
        <div className="method-studio-artifact-image">
          <Image
            src={primaryArtifact.media.src}
            alt={primaryArtifact.media.alt}
            width={primaryArtifact.media.width}
            height={primaryArtifact.media.height}
            sizes="(min-width: 1024px) 44vw, 92vw"
            className="size-full object-cover grayscale"
          />
        </div>
        <div className="method-studio-artifact-copy">
          <strong>{primaryArtifact.title}</strong>
          <span>{primaryArtifact.detail}</span>
          {primaryArtifact.action ? (
            <StudioAction action={primaryArtifact.action} primary />
          ) : null}
        </div>
      </div>

      {secondaryArtifacts.length > 0 ? (
        <div
          className="method-studio-artifact-strip"
          aria-label="Secondary owned proof artifacts"
        >
          {secondaryArtifacts.map((artifact) => (
            <figure key={artifact.id}>
              <div className="method-studio-artifact-thumb">
                <Image
                  src={artifact.media.src}
                  alt={artifact.media.alt}
                  width={artifact.media.width}
                  height={artifact.media.height}
                  sizes="(min-width: 1024px) 8rem, 32vw"
                  className="size-full object-cover grayscale"
                />
              </div>
              <figcaption>
                <span>{artifact.code}</span>
                <strong>{artifact.title}</strong>
                <small>{artifact.sourceLabel}</small>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : null}
    </aside>
  );
}

function ProjectTrace({
  compact = false,
  projects,
}: {
  compact?: boolean;
  projects: readonly ProjectSignal[];
}) {
  if (projects.length === 0) {
    return null;
  }

  return (
    <div
      className={cn("method-studio-project-trace", compact && "is-compact")}
      aria-label="Local project trace"
    >
      {projects.map((project) => (
        <article key={project.id}>
          {project.media ? (
            <span className="method-studio-project-media" aria-hidden>
              <Image
                src={project.media.src}
                alt=""
                width={project.media.width}
                height={project.media.height}
                sizes={compact ? "7rem" : "(min-width: 1024px) 12rem, 44vw"}
                className="size-full object-cover grayscale"
              />
            </span>
          ) : null}
          <span>{project.code} / {project.label}</span>
          <strong>{project.title}</strong>
          <small>{project.detail}</small>
          <em>{project.sourceLabel}</em>
        </article>
      ))}
    </div>
  );
}

export function MethodStudioStage({
  githubRepositories,
  moments,
  ownedArtifacts,
  projectSignals,
  proofPoints,
  scenes,
  socialChannels,
  specimens,
}: {
  githubRepositories: readonly GithubRepository[];
  moments: readonly StudioMoment[];
  ownedArtifacts: readonly OwnedArtifact[];
  projectSignals: readonly ProjectSignal[];
  proofPoints: readonly ArtifactProofPoint[];
  scenes: readonly StudioScene[];
  socialChannels: readonly SocialChannel[];
  specimens: readonly StudioSpecimen[];
}) {
  const [activeSceneId, setActiveSceneId] = useState<StudioSceneId>("joe");
  const [isTracing, setIsTracing] = useState(false);
  const [traceProgress, setTraceProgress] = useState(0);
  const [traceVelocity, setTraceVelocity] = useState(0);
  const desktopSignalEnabled = useDesktopSignal();
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const traceRailRef = useRef<HTMLDivElement>(null);
  const scrollSyncHoldUntilRef = useRef(0);
  const lastTraceRef = useRef({
    progress: 0,
    time: 0,
  });
  const originScene = scenes[0];
  const activeMoment = nearestMoment(moments, traceProgress);
  const activeScene =
    scenes.find((scene) => scene.id === activeSceneId) ??
    scenes.find((scene) => scene.id === activeMoment.scene) ??
    originScene;
  const activeSpecimen = specimens.find(
    (specimen) => specimen.scene === activeScene.id,
  );
  const activePath = routePath(originScene, activeScene);
  const routeProgress = activeRouteProgress(activeScene, traceProgress);
  const activeSceneIndex = scenes.findIndex((scene) => scene.id === activeScene.id);
  const rawSurfaceIntensity = progressBetween(traceProgress, 0.48, 0.68);
  const surfaceIntensity =
    activeScene.id === "surface" || traceProgress <= 0.72
      ? rawSurfaceIntensity
      : 0;
  const surfaceActive = surfaceIntensity > 0.24;
  const surfaceArtifacts = ownedArtifacts.filter(
    (artifact) => artifact.scene === "surface",
  );
  const sceneNodes = useMemo(
    () =>
      scenes.map((scene) => ({
        id: scene.id,
        x: scene.point.x,
        y: scene.point.y,
        depth: 0.48 + scene.progress * 0.32,
        tension: 0.42 + scene.progress * 0.22,
        sceneMode: scene.sceneMode,
      })),
    [scenes],
  );
  const style = {
    "--studio-progress": traceProgress,
    "--studio-route-progress": routeProgress,
    "--studio-progress-percent": `${traceProgress * 100}%`,
    "--studio-surface-intensity": surfaceIntensity,
    "--studio-trace-pressure": Math.min(1, Math.abs(traceVelocity) / 4),
    "--studio-trace-velocity": Math.min(Math.abs(traceVelocity), 6),
    "--studio-active-x": `${activeScene.point.x}%`,
    "--studio-active-y": `${activeScene.point.y}%`,
  } as CSSProperties;

  const setScene = useCallback(
    (scene: StudioScene, options?: { scroll?: boolean; syncUrl?: boolean }) => {
      setActiveSceneId(scene.id);
      setTraceProgress(scene.progress);
      setTraceVelocity(0);
      lastTraceRef.current = {
        progress: scene.progress,
        time: performance.now(),
      };

      if (options?.syncUrl) {
        syncSceneUrl(scene);
      }

      if (!options?.scroll) {
        return;
      }

      scrollSyncHoldUntilRef.current =
        performance.now() + (reducedMotion ? 160 : 900);

      if (scene.id === "joe") {
        window.scrollTo({
          top: 0,
          behavior: reducedMotion ? "auto" : "smooth",
        });
        return;
      }

      const target = document.querySelector<HTMLElement>(scene.sectionAnchor);

      target?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    },
    [reducedMotion],
  );

  const setProgress = useCallback(
    (progress: number, options?: { source?: "pointer" | "range" | "scroll" }) => {
      const nextProgress = clampProgress(progress);
      const moment = nearestMoment(moments, nextProgress);
      const scene =
        scenes.find((item) => item.id === moment.scene) ??
        nearestScene(scenes, nextProgress);
      const now = performance.now();
      const elapsed = Math.max(now - lastTraceRef.current.time, 16);
      const velocity =
        Math.abs(nextProgress - lastTraceRef.current.progress) /
        (elapsed / 1000);

      setTraceProgress(nextProgress);
      setActiveSceneId(scene.id);
      setTraceVelocity(
        options?.source === "pointer" || options?.source === "range"
          ? velocity
          : 0,
      );
      lastTraceRef.current = {
        progress: nextProgress,
        time: now,
      };
    },
    [moments, scenes],
  );

  const settleProgress = useCallback(() => {
    const settledProgress = lastTraceRef.current.progress;
    const moment = nearestMoment(moments, settledProgress);
    const scene =
      scenes.find((item) => item.id === moment.scene) ??
      nearestScene(scenes, settledProgress);

    setIsTracing(false);
    setScene(scene, { scroll: true, syncUrl: true });
  }, [moments, scenes, setScene]);

  const progressFromPointer = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const rect = traceRailRef.current?.getBoundingClientRect();

      if (!rect || rect.width <= 0) {
        return traceProgress;
      }

      return clampProgress((event.clientX - rect.left) / rect.width);
    },
    [traceProgress],
  );

  function handleTracePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsTracing(true);
    setProgress(progressFromPointer(event), { source: "pointer" });
  }

  function handleTracePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }

    setProgress(progressFromPointer(event), { source: "pointer" });
  }

  function handleTracePointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    settleProgress();
  }

  function handleSceneKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    scene: StudioScene,
  ) {
    const index = scenes.findIndex((item) => item.id === scene.id);

    if (index < 0) {
      return;
    }

    let nextIndex = index;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % scenes.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + scenes.length) % scenes.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = scenes.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    setScene(scenes[nextIndex], { scroll: true, syncUrl: true });
  }

  useEffect(() => {
    const scene = sceneFromLocation(scenes);

    if (!scene) {
      return;
    }

    const frame = window.requestAnimationFrame(() =>
      setScene(scene, { scroll: true }),
    );

    return () => window.cancelAnimationFrame(frame);
  }, [scenes, setScene]);

  useEffect(() => {
    let frame = 0;

    function syncFromScroll() {
      frame = 0;

      if (isTracing) {
        return;
      }

      if (performance.now() < scrollSyncHoldUntilRef.current) {
        return;
      }

      const root = rootRef.current;

      if (!root) {
        return;
      }

      const rootTop = root.getBoundingClientRect().top + window.scrollY;
      const maxScrollY =
        document.documentElement.scrollHeight - window.innerHeight;

      if (maxScrollY > 0 && window.scrollY >= maxScrollY - 4) {
        setProgress(1, { source: "scroll" });
        return;
      }

      if (window.scrollY <= rootTop + window.innerHeight * 0.35) {
        setProgress(0, { source: "scroll" });
        return;
      }

      const markers = scenes
        .map((scene) => {
          const target = document.querySelector<HTMLElement>(
            `[data-studio-scene="${scene.id}"]`,
          );

          return target
            ? {
                progress: scene.progress,
                top: target.getBoundingClientRect().top + window.scrollY,
              }
            : null;
        })
        .filter(
          (marker): marker is { progress: number; top: number } =>
            Boolean(marker),
        )
        .sort((a, b) => a.top - b.top);

      if (markers.length === 0) {
        return;
      }

      const referenceY = window.scrollY + window.innerHeight * 0.18;
      let previous = markers[0];
      let next = markers[markers.length - 1];

      for (let index = 0; index < markers.length; index += 1) {
        const marker = markers[index];

        if (marker.top <= referenceY) {
          previous = marker;
          next = markers[index + 1] ?? marker;
        }
      }

      const distance = Math.max(next.top - previous.top, 1);
      const progress =
        previous === next
          ? previous.progress
          : previous.progress +
            (next.progress - previous.progress) *
              clampProgress((referenceY - previous.top) / distance);

      setProgress(progress, { source: "scroll" });
    }

    function requestSync() {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(syncFromScroll);
    }

    requestSync();
    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);
    };
  }, [isTracing, scenes, setProgress]);

  return (
    <section
      ref={rootRef}
      id="joe"
      className="method-studio-root"
      data-active-scene={activeScene.id}
      data-site-node-id="joe"
      data-tracing={isTracing ? "true" : "false"}
      style={style}
      aria-label="Joe Simo Method Studio"
    >
      <div className="method-studio-pin">
        {desktopSignalEnabled ? (
          <WebGLSignalField
            activeNodeId={activeScene.id}
            activeRouteProgress={routeProgress}
            className="method-studio-webgl"
            isTracing={isTracing}
            nodes={sceneNodes}
            originNodeId="joe"
            sceneMode={activeScene.sceneMode}
            traceVelocity={traceVelocity}
          />
        ) : (
          <div className="method-studio-static-field" aria-hidden />
        )}

        <div className="method-studio-frame">
          <div className="method-studio-identity">
            <span className="method-studio-kicker">
              Joe Simo / Method Studio
            </span>
            <div className="method-studio-title-row">
              <span className="method-studio-portrait" aria-hidden>
                <Image
                  src={originScene.media?.src ?? "/media/joe-simo-x-avatar.webp"}
                  alt=""
                  width={originScene.media?.width ?? 512}
                  height={originScene.media?.height ?? 512}
                  sizes="76px"
                  className="size-full object-cover grayscale"
                />
              </span>
              <h1>{originScene.title}</h1>
            </div>
            <p>{originScene.body}</p>
            <span className="method-studio-meta">
              Support breakage / telematics signal / interface surface
            </span>
          </div>

          <div className="method-studio-instrument" aria-label="Method trace instrument">
            <svg
              className="method-studio-lines"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              {scenes.slice(1).map((scene) => (
                <path
                  key={scene.id}
                  d={routePath(originScene, scene)}
                  pathLength={1}
                  className="method-studio-line"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              <path
                d={activePath}
                pathLength={1}
                className="method-studio-line-active"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            <div
              className="method-studio-scene-nodes"
              role="radiogroup"
              aria-label="Method Studio scenes"
            >
              {scenes.map((scene, index) => {
                const active = scene.id === activeScene.id;
                const adjacent =
                  activeSceneIndex >= 0 &&
                  Math.abs(activeSceneIndex - index) === 1;

                return (
                  <button
                    key={scene.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-controls="method-studio-readout"
                    className="method-studio-node"
                    data-adjacent={adjacent ? "true" : "false"}
                    data-active={active ? "true" : "false"}
                    style={
                      {
                        "--node-x": `${scene.point.x}%`,
                        "--node-y": `${scene.point.y}%`,
                      } as CSSProperties
                    }
                    onClick={() =>
                      setScene(scene, { scroll: true, syncUrl: true })
                    }
                    onKeyDown={(event) => handleSceneKeyDown(event, scene)}
                  >
                    <span>{scene.code}</span>
                    <strong>{scene.shortLabel}</strong>
                  </button>
                );
              })}
            </div>

            <span className="method-studio-signal-head" aria-hidden />

            <StudioSpecimenPanel
              isTracing={isTracing}
              moment={activeMoment}
              projectSignals={projectSignals}
              scene={activeScene}
              specimen={activeSpecimen}
            />

            <ArtifactReveal
              active={surfaceActive}
              artifacts={surfaceArtifacts}
            />
          </div>

          <div className="method-studio-console">
            <label htmlFor="method-studio-range">
              Hold and trace the method
            </label>
            <div
              ref={traceRailRef}
              className="method-studio-trace"
              data-tracing={isTracing ? "true" : "false"}
              onPointerCancel={handleTracePointerEnd}
              onPointerDown={handleTracePointerDown}
              onPointerMove={handleTracePointerMove}
              onPointerUp={handleTracePointerEnd}
            >
              <span className="method-studio-trace-track" aria-hidden>
                <span className="method-studio-trace-fill" />
                <span className="method-studio-trace-head" />
              </span>
              <input
                id="method-studio-range"
                type="range"
                min={0}
                max={1}
                step={0.001}
                value={traceProgress}
                aria-label="Trace Joe Simo method studio"
                aria-valuetext={`${activeMoment.label}. ${activeMoment.readout}`}
                onBlur={settleProgress}
                onChange={(event) =>
                  setProgress(Number(event.currentTarget.value), {
                    source: "range",
                  })
                }
                onFocus={() => {
                  lastTraceRef.current = {
                    progress: traceProgress,
                    time: performance.now(),
                  };
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    settleProgress();
                    return;
                  }

                  if (event.key === "Home") {
                    event.preventDefault();
                    setIsTracing(false);
                    setScene(scenes[0], { scroll: true, syncUrl: true });
                    return;
                  }

                  if (event.key === "End") {
                    event.preventDefault();
                    setIsTracing(false);
                    setScene(scenes[scenes.length - 1], {
                      scroll: true,
                      syncUrl: true,
                    });
                    return;
                  }

                  const direction =
                    event.key === "ArrowRight" || event.key === "ArrowUp"
                      ? 1
                      : event.key === "ArrowLeft" || event.key === "ArrowDown"
                        ? -1
                        : 0;

                  if (direction !== 0) {
                    event.preventDefault();
                    setIsTracing(true);
                    setProgress(traceProgress + direction * 0.04, {
                      source: "range",
                    });
                  }
                }}
                onKeyUp={(event) => {
                  if (
                    event.key === "ArrowRight" ||
                    event.key === "ArrowUp" ||
                    event.key === "ArrowLeft" ||
                    event.key === "ArrowDown"
                  ) {
                    settleProgress();
                  }
                }}
              />
            </div>
            <output
              className="method-studio-trace-readout"
              htmlFor="method-studio-range"
            >
              <span>{activeMoment.code}</span>
              {activeMoment.readout}
            </output>
            <div className="method-studio-stop-row" aria-hidden>
              {moments.map((moment) => (
                <span key={moment.id}>{moment.code}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="method-studio-chapters" aria-label="Method Studio chapters">
        {scenes.map((scene) => {
          const specimen = specimens.find((item) => item.scene === scene.id);
          const id = scene.sectionAnchor.slice(1);

          return (
            <section
              key={scene.id}
              id={id === "joe" ? undefined : id}
              className="method-studio-chapter"
              data-studio-scene={scene.id}
              data-site-node-id={
                scene.id === "surface"
                  ? "work"
                  : scene.id === "breakage" || scene.id === "signals"
                    ? "method"
                    : scene.id
              }
              aria-label={scene.title}
            >
              <div className="method-studio-chapter-content">
                <span className="method-studio-chapter-code">
                  {scene.code} / {scene.sourceLabel}
                </span>
                <h2 id={`studio-${scene.id}-title`}>{scene.title}</h2>
                <p>{specimen?.body ?? scene.body}</p>
                {scene.id === "surface" ? (
                  <ProofCuts active proofPoints={proofPoints} />
                ) : null}
                {scene.id === "trail" ? (
                  <>
                    <ProjectTrace projects={projectSignals} />
                    <div className="method-studio-public-trail">
                      {githubRepositories.slice(0, 2).map((repo) => (
                        <a
                          key={repo.href}
                          href={repo.href}
                          {...actionTargetProps({
                            href: repo.href,
                            label: repo.name,
                            external: true,
                          })}
                        >
                          <strong>{repo.name}</strong>
                          <span>{repo.kind}</span>
                          <ExternalCue show />
                        </a>
                      ))}
                      {socialChannels.map((channel) => (
                        <a
                          key={channel.href}
                          href={channel.href}
                          {...actionTargetProps({
                            href: channel.href,
                            label: channel.label,
                            external: channel.href.startsWith("http"),
                          })}
                        >
                          <strong>{channel.label}</strong>
                          <span>{channel.handle}</span>
                          <ExternalCue show={channel.href.startsWith("http")} />
                        </a>
                      ))}
                    </div>
                  </>
                ) : null}
                {scene.action ? <StudioAction action={scene.action} primary /> : null}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
