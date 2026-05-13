"use client";

import dynamic from "next/dynamic";
import { type CSSProperties, useCallback, useEffect, useState } from "react";

import { SiteIcon } from "@/components/site/site-icons";
import {
  defaultActiveNodeId,
  originNodeId,
  type SiteAction,
  type SiteCanvasRecord,
} from "@/lib/site-data";

type DesktopMapProps = {
  onReady?: () => void;
  quickActions: SiteAction[];
  records: SiteCanvasRecord[];
};

const DesktopMap = dynamic<DesktopMapProps>(
  () =>
    import("@/components/site/site-canvas-desktop").then(
      (module) => module.SiteCanvasDesktopMap,
    ),
  {
    ssr: false,
  },
);

function StaticMapFallback({ records }: { records: SiteCanvasRecord[] }) {
  const origin = records.find((record) => record.id === originNodeId);
  const originPoint = origin?.map.desktopPoint ?? { x: 61, y: 48 };

  return (
    <div
      className="site-flow site-flow-map relative h-full overflow-hidden"
      role="navigation"
      aria-label="Joe Simo section map"
    >
      <p className="sr-only" role="status" aria-live="polite">
        Joe Simo map loading. Sections are available below.
      </p>
      <div className="site-map-topline" aria-hidden>
        <span>Joe Method</span>
        <span>static field</span>
      </div>
      <svg
        className="site-map-lines pointer-events-none absolute inset-0 size-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        {records
          .filter((record) => record.id !== originNodeId)
          .map((record) => (
            <path
              key={record.id}
              d={`M ${originPoint.x} ${originPoint.y} C ${
                (originPoint.x + record.map.desktopPoint.x) / 2
              } ${originPoint.y}, ${
                (originPoint.x + record.map.desktopPoint.x) / 2
              } ${record.map.desktopPoint.y}, ${record.map.desktopPoint.x} ${
                record.map.desktopPoint.y
              }`}
              className="site-map-edge"
              pathLength={1}
              style={{ "--route-progress": 1 } as CSSProperties}
              vectorEffect="non-scaling-stroke"
            />
          ))}
      </svg>
      {records.map((record) => {
        const active = record.id === defaultActiveNodeId;

        return (
          <a
            key={record.id}
            href={record.sectionAnchor}
            className={
              record.id === originNodeId
                ? "site-min-node site-min-node-origin site-min-map-node"
                : `site-min-node site-min-node-route site-min-map-node${
                    active ? " site-min-node-active" : ""
                  }`
            }
            aria-label={`Go to ${record.label}`}
            style={{
              left: `${record.map.desktopPoint.x}%`,
              top: `${record.map.desktopPoint.y}%`,
            }}
          >
            <SiteIcon iconKey={record.iconKey} aria-hidden />
            <span
              className={
                record.id === originNodeId ? undefined : "site-min-node-label"
              }
            >
              {record.label}
            </span>
            {active ? (
              <span className="site-node-active-dot" aria-hidden />
            ) : null}
          </a>
        );
      })}
    </div>
  );
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(query.matches);

    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

export function SiteCanvasDesktop({
  quickActions,
  records,
}: {
  quickActions: SiteAction[];
  records: SiteCanvasRecord[];
}) {
  const isDesktop = useIsDesktop();
  const [mapReady, setMapReady] = useState(false);
  const markMapReady = useCallback(() => setMapReady(true), []);

  return (
    <div className="relative hidden min-h-[38rem] w-full min-w-0 max-w-full lg:block lg:h-[calc(100svh-8rem)]">
      {isDesktop ? (
        <>
          {mapReady ? null : <StaticMapFallback records={records} />}
          <DesktopMap
            onReady={markMapReady}
            records={records}
            quickActions={quickActions}
          />
        </>
      ) : (
        <StaticMapFallback records={records} />
      )}
    </div>
  );
}
