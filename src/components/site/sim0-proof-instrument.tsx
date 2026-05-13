"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import { useMemo, useRef, useState } from "react";
import Image from "next/image";

import { SiteIcon } from "@/components/site/site-icons";
import {
  sim0ProofPoints,
  type SiteAction,
  type WorkArtifact,
} from "@/lib/site-data";
import { cn } from "@/lib/utils";

type Sim0ProofInstrumentProps = {
  artifact: WorkArtifact;
  action: SiteAction;
};

type ProofPointId = (typeof sim0ProofPoints)[number]["id"];

function actionTargetProps(action: SiteAction) {
  return action.external
    ? {
        target: "_blank",
        rel: "noreferrer",
      }
    : {};
}

function nextIndex(currentIndex: number, key: string) {
  if (key === "ArrowRight" || key === "ArrowDown") {
    return (currentIndex + 1) % sim0ProofPoints.length;
  }

  if (key === "ArrowLeft" || key === "ArrowUp") {
    return (currentIndex - 1 + sim0ProofPoints.length) % sim0ProofPoints.length;
  }

  if (key === "Home") {
    return 0;
  }

  if (key === "End") {
    return sim0ProofPoints.length - 1;
  }

  return currentIndex;
}

export function Sim0ProofInstrument({
  action,
  artifact,
}: Sim0ProofInstrumentProps) {
  const [activeId, setActiveId] = useState<ProofPointId>(sim0ProofPoints[0].id);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeHotspot = useMemo(
    () => sim0ProofPoints.find((hotspot) => hotspot.id === activeId),
    [activeId],
  );

  if (!artifact.media || !activeHotspot) {
    return null;
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (
      ![
        "ArrowRight",
        "ArrowDown",
        "ArrowLeft",
        "ArrowUp",
        "Home",
        "End",
      ].includes(event.key)
    ) {
      return;
    }

    event.preventDefault();

    const targetIndex = nextIndex(index, event.key);
    const targetHotspot = sim0ProofPoints[targetIndex];

    setActiveId(targetHotspot.id);
    buttonRefs.current[targetIndex]?.focus();
  }

  return (
    <div className="sim0-proof-instrument">
      <div
        className="sim0-proof-frame"
        style={
          {
            "--proof-x": `${activeHotspot.x}%`,
            "--proof-y": `${activeHotspot.y}%`,
          } as CSSProperties
        }
      >
        <Image
          src={artifact.media.src}
          alt={artifact.media.alt}
          width={artifact.media.width}
          height={artifact.media.height}
          sizes="(min-width: 1024px) 58vw, 94vw"
          priority={false}
          className="sim0-proof-image"
        />

        <span className="sim0-proof-spotlight" aria-hidden />

        <div
          aria-label="Inspect the sim0 artifact"
          className="sim0-proof-hotspots"
          role="radiogroup"
        >
          {sim0ProofPoints.map((hotspot, index) => {
            const isActive = activeId === hotspot.id;
            const style = {
              "--hotspot-x": `${hotspot.x}%`,
              "--hotspot-y": `${hotspot.y}%`,
            } as CSSProperties;

            return (
              <button
                key={hotspot.id}
                ref={(element) => {
                  buttonRefs.current[index] = element;
                }}
                type="button"
                role="radio"
                aria-checked={isActive}
                aria-label={`${hotspot.label}: ${hotspot.title}`}
                data-trace-entry={index === 0 ? "work" : undefined}
                tabIndex={isActive ? 0 : -1}
                className={cn(
                  "sim0-proof-hotspot",
                  isActive && "is-active",
                )}
                style={style}
                onClick={() => setActiveId(hotspot.id)}
                onFocus={() => setActiveId(hotspot.id)}
                onKeyDown={(event) => handleKeyDown(event, index)}
              >
                <span aria-hidden>{hotspot.code}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="sim0-proof-readout" aria-live="polite">
        <span className="sim0-proof-lens" aria-hidden>
          <Image
            src={artifact.media.src}
            alt=""
            width={artifact.media.width}
            height={artifact.media.height}
            sizes="160px"
            className="sim0-proof-lens-image"
            style={
              {
                "--lens-x": `${activeHotspot.zoom.x}%`,
                "--lens-y": `${activeHotspot.zoom.y}%`,
              } as CSSProperties
            }
          />
        </span>
        <div className="grid gap-2">
          <span className="sim0-proof-code">{activeHotspot.code}</span>
          <h3>{activeHotspot.title}</h3>
          <span className="sim0-proof-visible-label">
            {activeHotspot.visibleLabel}
          </span>
          <p>{activeHotspot.detail}</p>
        </div>

        <a
          href={action.href}
          {...actionTargetProps(action)}
          aria-label={action.ariaLabel}
          className="sim0-proof-action"
        >
          {action.label}
          <SiteIcon iconKey="arrowUpRight" aria-hidden />
          {action.external ? (
            <span className="sr-only">opens in a new tab</span>
          ) : null}
        </a>
      </div>
    </div>
  );
}
