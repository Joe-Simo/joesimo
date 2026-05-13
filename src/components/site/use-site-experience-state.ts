"use client";

import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  defaultActiveNodeId,
  legacyHashMap,
  legacyNodeIdMap,
  originNodeId,
  type SiteCanvasRecord,
  type SiteNodeId,
} from "@/lib/site-data";

type RouteProgressMap = Partial<Record<SiteNodeId, number>>;

function shouldReduceMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function clampProgress(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}

function roundProgress(value: number) {
  return Math.round(clampProgress(value) * 1000) / 1000;
}

function progressMapsEqual(
  current: RouteProgressMap,
  next: RouteProgressMap,
  ids: readonly SiteNodeId[],
) {
  return ids.every((id) => (current[id] ?? 0) === (next[id] ?? 0));
}

function isKnownNodeId(
  records: readonly SiteCanvasRecord[],
  value: string | null,
): value is SiteNodeId {
  if (!value) {
    return false;
  }

  return records.some((record) => record.id === value);
}

function resolveLegacyNodeId(value: string | null) {
  if (!value) {
    return null;
  }

  return value in legacyNodeIdMap
    ? legacyNodeIdMap[value as keyof typeof legacyNodeIdMap]
    : value;
}

function resolveHashNodeId(hash: string) {
  if (!hash) {
    return null;
  }

  return hash in legacyHashMap
    ? legacyHashMap[hash as keyof typeof legacyHashMap]
    : null;
}

function nodeFromLocation(records: readonly SiteCanvasRecord[]) {
  const url = new URL(window.location.href);
  const hashRecord = records.find(
    (record) => record.sectionAnchor === url.hash,
  );

  if (hashRecord) {
    return normalizeActiveNodeId(hashRecord.id);
  }

  const legacyHashNode = resolveHashNodeId(url.hash);

  if (isKnownNodeId(records, legacyHashNode)) {
    return normalizeActiveNodeId(legacyHashNode);
  }

  const mapNode = resolveLegacyNodeId(url.searchParams.get("map"));

  return isKnownNodeId(records, mapNode)
    ? normalizeActiveNodeId(mapNode)
    : defaultActiveNodeId;
}

function normalizeActiveNodeId(nodeId: SiteNodeId) {
  return nodeId === originNodeId ? defaultActiveNodeId : nodeId;
}

function syncMapStateToUrl(nodeId: SiteNodeId) {
  const url = new URL(window.location.href);
  url.hash = "";

  if (nodeId === originNodeId || nodeId === defaultActiveNodeId) {
    url.searchParams.delete("map");
  } else {
    url.searchParams.set("map", nodeId);
  }

  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
}

function syncSectionStateToUrl(sectionAnchor: string) {
  const url = new URL(window.location.href);

  url.searchParams.delete("map");
  url.hash = sectionAnchor;
  window.history.replaceState(
    null,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}

function cleanMapStateFromHashUrl() {
  const url = new URL(window.location.href);

  if (!url.hash || !url.searchParams.has("map")) {
    return;
  }

  url.searchParams.delete("map");
  window.history.replaceState(
    null,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}

export function scrollToExperienceSection(
  record: SiteCanvasRecord,
  options?: {
    focusEntry?: boolean;
  },
) {
  const target = document.querySelector<HTMLElement>(record.sectionAnchor);

  if (!target) {
    return;
  }

  syncSectionStateToUrl(record.sectionAnchor);
  target.scrollIntoView({
    behavior: shouldReduceMotion() ? "auto" : "smooth",
    block: "start",
  });

  if (!options?.focusEntry) {
    return;
  }

  const entry =
    target.matches(`[data-trace-entry="${record.id}"]`)
      ? target
      : target.querySelector<HTMLElement>(
          `[data-trace-entry="${record.id}"]`,
        );

  if (!entry) {
    return;
  }

  const focusDelay = shouldReduceMotion() ? 0 : 280;

  window.setTimeout(() => {
    entry.focus({ preventScroll: true });
  }, focusDelay);
}

export function useSiteExperienceState(
  records: readonly SiteCanvasRecord[],
  options?: {
    syncSections?: boolean;
  },
) {
  const [activeNodeId, setActiveNodeId] =
    useState<SiteNodeId>(defaultActiveNodeId);
  const [previewNodeId, setPreviewNodeId] = useState<SiteNodeId | null>(null);
  const [routeProgressById, setRouteProgressById] =
    useState<RouteProgressMap>({
      [defaultActiveNodeId]: 1,
    });
  const activeNodeIdRef = useRef(activeNodeId);
  const visibleRecords = useMemo(
    () => records.filter((record) => record.id !== originNodeId),
    [records],
  );
  const activeRecord =
    records.find((record) => record.id === activeNodeId) ??
    records.find((record) => record.id === defaultActiveNodeId) ??
    records[0];
  const tracedNodeId = previewNodeId ?? activeNodeId;
  const tracedRecord =
    records.find((record) => record.id === tracedNodeId) ?? activeRecord;
  const focusableNodeId =
    visibleRecords.find((record) => record.id === activeNodeId)?.id ??
    visibleRecords.find((record) => record.id === defaultActiveNodeId)?.id ??
    visibleRecords[0]?.id ??
    activeNodeId;

  useEffect(() => {
    activeNodeIdRef.current = activeNodeId;
  }, [activeNodeId]);

  useEffect(() => {
    function syncActiveNodeFromLocation() {
      const nextNodeId = nodeFromLocation(records);

      activeNodeIdRef.current = nextNodeId;
      setActiveNodeId(nextNodeId);
      setPreviewNodeId(null);
      cleanMapStateFromHashUrl();
    }

    const frame = window.requestAnimationFrame(syncActiveNodeFromLocation);

    window.addEventListener("popstate", syncActiveNodeFromLocation);
    window.addEventListener("hashchange", syncActiveNodeFromLocation);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("popstate", syncActiveNodeFromLocation);
      window.removeEventListener("hashchange", syncActiveNodeFromLocation);
    };
  }, [records]);

  useEffect(() => {
    if (!options?.syncSections) {
      return;
    }

    const targets = records
      .filter((record) => record.id !== originNodeId)
      .map((record) => ({
        id: record.id,
        target: document.querySelector<HTMLElement>(record.sectionAnchor),
      }))
      .filter(
        (item): item is { id: SiteNodeId; target: HTMLElement } =>
          Boolean(item.target),
      );

    if (targets.length === 0) {
      return;
    }

    let progressFrame = 0;

    function measureRouteProgress() {
      progressFrame = 0;

      const viewportHeight = Math.max(1, window.innerHeight);
      const drawStart = viewportHeight * 1.08;
      const drawEnd = viewportHeight * 0.2;
      const drawDistance = Math.max(1, drawStart - drawEnd);
      const nextProgress = targets.reduce<RouteProgressMap>(
        (progressById, { id, target }) => {
          const rect = target.getBoundingClientRect();
          const measured = (drawStart - rect.top) / drawDistance;

          progressById[id] = roundProgress(measured);

          return progressById;
        },
        {},
      );
      const ids = targets.map(({ id }) => id);

      setRouteProgressById((currentProgress) =>
        progressMapsEqual(currentProgress, nextProgress, ids)
          ? currentProgress
          : nextProgress,
      );
    }

    function scheduleRouteProgress() {
      if (progressFrame) {
        return;
      }

      progressFrame = window.requestAnimationFrame(measureRouteProgress);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) {
          return;
        }

        const nodeId = visible.target.getAttribute("data-site-node-id");

        if (!isKnownNodeId(records, nodeId)) {
          return;
        }

        activeNodeIdRef.current = nodeId;
        setActiveNodeId(nodeId);
        setPreviewNodeId(null);
      },
      {
        root: null,
        rootMargin: "-26% 0px -58% 0px",
        threshold: [0.1, 0.35, 0.65],
      },
    );

    targets.forEach(({ target }) => observer.observe(target));
    scheduleRouteProgress();
    window.addEventListener("scroll", scheduleRouteProgress, { passive: true });
    window.addEventListener("resize", scheduleRouteProgress);

    return () => {
      window.cancelAnimationFrame(progressFrame);
      window.removeEventListener("scroll", scheduleRouteProgress);
      window.removeEventListener("resize", scheduleRouteProgress);
      observer.disconnect();
    };
  }, [options?.syncSections, records]);

  const commitNode = useCallback((nodeId: SiteNodeId) => {
    const nextNodeId = normalizeActiveNodeId(nodeId);

    activeNodeIdRef.current = nextNodeId;
    setActiveNodeId(nextNodeId);
    setPreviewNodeId(null);
    syncMapStateToUrl(nextNodeId);
  }, []);

  const previewNode = useCallback(
    (nodeId: SiteNodeId | null) => {
      if (nodeId === activeNodeIdRef.current) {
        setPreviewNodeId(null);
        return;
      }

      setPreviewNodeId(nodeId);
    },
    [],
  );

  const reset = useCallback(() => {
    commitNode(defaultActiveNodeId);
  }, [commitNode]);

  const readSection = useCallback((record: SiteCanvasRecord) => {
    scrollToExperienceSection(record);
  }, []);

  const navigateWithKeys = useCallback(
    (
      event: KeyboardEvent<HTMLButtonElement>,
      nodeId: SiteNodeId,
      focusSelector: (id: SiteNodeId) => string,
    ) => {
      if (visibleRecords.length === 0) {
        return;
      }

      const currentIndex = visibleRecords.findIndex(
        (record) => record.id === nodeId,
      );
      const fallbackIndex = visibleRecords.findIndex(
        (record) => record.id === focusableNodeId,
      );
      let nextIndex =
        currentIndex >= 0 ? currentIndex : Math.max(fallbackIndex, 0);

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = (nextIndex + 1) % visibleRecords.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex =
          (nextIndex - 1 + visibleRecords.length) % visibleRecords.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = visibleRecords.length - 1;
      } else {
        return;
      }

      event.preventDefault();

      const nextId = visibleRecords[nextIndex]?.id;

      if (!nextId) {
        return;
      }

      commitNode(nextId);
      window.requestAnimationFrame(() => {
        const nextElement =
          document.querySelector<HTMLButtonElement>(focusSelector(nextId));

        nextElement?.focus();
        nextElement?.scrollIntoView({
          behavior: shouldReduceMotion() ? "auto" : "smooth",
          block: "nearest",
          inline: "nearest",
        });
      });
    },
    [commitNode, focusableNodeId, visibleRecords],
  );

  return {
    activeNodeId,
    activeRecord,
    commitNode,
    focusableNodeId,
    navigateWithKeys,
    previewNode,
    previewNodeId,
    readSection,
    reset,
    routeProgressById,
    tracedNodeId,
    tracedRecord,
    visibleRecords,
  };
}
