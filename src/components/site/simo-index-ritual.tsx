"use client";

import Link from "next/link";
import {
  type CSSProperties,
  type MouseEvent,
  useState,
} from "react";

type NavigationDestinationId = "portfolio" | "blog";

type NavigationDestination = {
  id: NavigationDestinationId;
  label: string;
  code: string;
  href: "#work" | "#blog";
  body: string;
  previewReceipt: string;
};

const navigationDestinations: NavigationDestination[] = [
  {
    id: "portfolio",
    label: "Portfolio",
    code: "01",
    href: "#work",
    body:
      "Selected projects, product surfaces, utilities, and older web identity marks.",
    previewReceipt: "Click to show Portfolio below.",
  },
  {
    id: "blog",
    label: "Blog",
    code: "02",
    href: "#blog",
    body:
      "Short field notes about interfaces, systems, design taste, and the habits behind the work.",
    previewReceipt: "Click to show Blog below.",
  },
];

type SimoIndexRitualProps = {
  activeDestinationId?: NavigationDestinationId;
  onDestinationCommit?: (destination: NavigationDestinationId) => void;
};

export function SimoIndexRitual({
  activeDestinationId = "portfolio",
  onDestinationCommit,
}: SimoIndexRitualProps) {
  const [previewDestinationId, setPreviewDestinationId] =
    useState<NavigationDestinationId | null>(null);
  const [pointer, setPointer] = useState({ x: 50, y: 50 });
  const [receipt, setReceipt] = useState<string | null>(null);

  const resolvedDestinationId = previewDestinationId ?? activeDestinationId;
  const activeIndex = Math.max(
    0,
    navigationDestinations.findIndex(
      (destination) => destination.id === resolvedDestinationId,
    ),
  );
  const activeDestination =
    navigationDestinations[activeIndex] ?? navigationDestinations[0];
  const progressRatio = activeIndex / (navigationDestinations.length - 1);
  const progress = `${20 + progressRatio * 60}%`;
  const selectedDestination =
    navigationDestinations.find(
      (destination) => destination.id === activeDestinationId,
    ) ?? navigationDestinations[0];
  const visibleReceipt = receipt ?? `${selectedDestination.label} is showing below.`;

  function commitDestination(destination = activeDestination) {
    setPreviewDestinationId(null);
    setReceipt(`${destination.label} is showing below.`);
    onDestinationCommit?.(destination.id);

    if (onDestinationCommit) {
      return;
    }

    window.location.assign(destination.href);
  }

  function previewDestination(destination: NavigationDestination, index: number) {
    setPointer({
      x: index === 0 ? 25 : 75,
      y: 50,
    });
    setPreviewDestinationId(destination.id);
    setReceipt(destination.previewReceipt);
  }

  function handleRouteClick(
    event: MouseEvent<HTMLAnchorElement>,
    destination: NavigationDestination,
  ) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    event.preventDefault();
    commitDestination(destination);
  }

  function routeStatus(destination: NavigationDestination) {
    if (destination.id === activeDestinationId) {
      return "Showing below";
    }

    if (destination.id === previewDestinationId) {
      return destination.previewReceipt;
    }

    return "Opens below";
  }

  return (
    <section
      className="simo-index-ritual"
      data-active-intent={activeDestination.id}
      data-selected-destination={activeDestinationId}
      style={
        {
          "--simo-index-progress": progress,
          "--simo-index-progress-ratio": progressRatio,
          "--simo-index-pointer-x": `${pointer.x}%`,
          "--simo-index-pointer-y": `${pointer.y}%`,
        } as CSSProperties
      }
      aria-label="Joe Simo primary navigation"
    >
      <div
        className="simo-index-console"
        onPointerLeave={() => {
          setPreviewDestinationId(null);
          setReceipt(null);
        }}
        role="group"
        aria-label="Choose Portfolio or Blog content"
        aria-describedby="simo-index-receipt"
      >
        <div className="simo-console-topbar">
          <div className="simo-console-mark" aria-hidden>
            <span />
            <span />
          </div>
          <div>
            <span>Joe Simo</span>
            <strong>Personal Index</strong>
          </div>
          <em>Showing</em>
        </div>

        <svg
          className="simo-console-map"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            className="simo-console-path is-ghost"
            d="M12 58 C34 44 66 44 88 58"
            pathLength={1}
          />
          <path
            className="simo-console-path is-active"
            d="M12 58 C34 44 66 44 88 58"
            pathLength={1}
          />
        </svg>

        <div className="simo-console-head" aria-hidden>
          <span />
        </div>

        <div className="simo-console-readout" aria-hidden>
          <span>Surface</span>
          <strong>{activeDestination.label}</strong>
          <em>{activeDestination.id === "portfolio" ? "Work index" : "Field notes"}</em>
        </div>

        <div className="simo-console-routes" role="group" aria-label="Joe Simo primary routes">
          {navigationDestinations.map((destination, index) => (
            <Link
              key={destination.id}
              href={destination.href}
              className="simo-console-route"
              data-active={destination.id === activeDestination.id ? "true" : "false"}
              data-current={destination.id === activeDestinationId ? "true" : "false"}
              data-route={destination.id}
              aria-current={
                destination.id === activeDestinationId ? "page" : undefined
              }
              onClick={(event) => handleRouteClick(event, destination)}
              onPointerEnter={() => previewDestination(destination, index)}
              onFocus={() => previewDestination(destination, index)}
              onBlur={() => {
                setPreviewDestinationId(null);
                setReceipt(null);
              }}
            >
              <span>{destination.code}</span>
              <strong>{destination.label}</strong>
              <em>{routeStatus(destination)}</em>
            </Link>
          ))}
        </div>

        <div className="simo-console-receipt" id="simo-index-receipt">
          <span>Joe Index</span>
          <strong>{visibleReceipt}</strong>
        </div>

        <div className="sr-only" aria-live="polite">
          {activeDestination.label}: {visibleReceipt}. {activeDestination.body}
        </div>

      </div>
    </section>
  );
}
