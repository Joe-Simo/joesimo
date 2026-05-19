"use client";

import Link from "next/link";
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type NavigationDestinationId = "portfolio" | "blog";

type NavigationDestination = {
  id: NavigationDestinationId;
  label: string;
  code: string;
  href: "#work" | "#blog";
  title: string;
  body: string;
  receipt: string;
  verb: string;
};

const navigationDestinations: NavigationDestination[] = [
  {
    id: "portfolio",
    label: "Portfolio",
    code: "01",
    href: "#work",
    title: "Open the work.",
    body:
      "Selected projects, product surfaces, utilities, and older web identity marks.",
    receipt: "Portfolio route armed",
    verb: "Open",
  },
  {
    id: "blog",
    label: "Blog",
    code: "02",
    href: "#blog",
    title: "Read the notes.",
    body:
      "Short field notes about interfaces, systems, design taste, and the habits behind the work.",
    receipt: "Blog route armed",
    verb: "Read",
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
  const [isTracing, setIsTracing] = useState(false);
  const [pointer, setPointer] = useState({ x: 50, y: 50 });
  const [receipt, setReceipt] = useState("Portfolio route is ready.");
  const tracingRef = useRef(false);

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

  useEffect(() => {
    if (tracingRef.current || previewDestinationId) {
      return;
    }

    const destination =
      navigationDestinations.find(
        (candidate) => candidate.id === activeDestinationId,
      ) ?? navigationDestinations[0];

    setReceipt(`${destination.label} route is ready.`);
  }, [activeDestinationId, previewDestinationId]);

  function setIntentFromPointer(event: PointerEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const nextX = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
    const nextY = Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100));
    const nextIndex = nextX > 55 || nextY < 32 ? 1 : 0;

    setPointer({
      x: nextX,
      y: nextY,
    });
    setPreviewDestinationId(navigationDestinations[nextIndex].id);

    return nextIndex;
  }

  function commitDestination(destination = activeDestination) {
    setReceipt(`${destination.label} route released.`);
    onDestinationCommit?.(destination.id);

    if (onDestinationCommit) {
      return;
    }

    window.location.hash = destination.href;
  }

  function handlePointerDown(event: PointerEvent<HTMLElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    tracingRef.current = true;
    setIsTracing(true);
    const nextIndex = setIntentFromPointer(event);
    setReceipt(`Tracing toward ${navigationDestinations[nextIndex].label}.`);
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    const nextIndex = setIntentFromPointer(event);

    if (tracingRef.current) {
      setReceipt(`Release to open ${navigationDestinations[nextIndex].label}.`);
    }
  }

  function handlePointerUp(event: PointerEvent<HTMLElement>) {
    const nextIndex = setIntentFromPointer(event);

    if (!tracingRef.current) {
      return;
    }

    tracingRef.current = false;
    setIsTracing(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    commitDestination(navigationDestinations[nextIndex]);
  }

  function handlePointerCancel(event: PointerEvent<HTMLElement>) {
    tracingRef.current = false;
    setIsTracing(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setReceipt("Route hold cancelled.");
  }

  function handleKeyboardDestination(index: number) {
    setPreviewDestinationId(navigationDestinations[index].id);
    setPointer({
      x: index === 0 ? 25 : 75,
      y: 50,
    });
    setReceipt(`${navigationDestinations[index].label} route selected.`);
  }

  function handleKeyboard(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      handleKeyboardDestination(0);
      return;
    }

    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      handleKeyboardDestination(1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      handleKeyboardDestination(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      handleKeyboardDestination(navigationDestinations.length - 1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      commitDestination(activeDestination);
    }
  }

  return (
    <section
      className="simo-index-ritual"
      data-active-intent={activeDestination.id}
      data-tracing={isTracing ? "true" : "false"}
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
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={() => {
          if (!tracingRef.current) {
            setPreviewDestinationId(null);
          }
        }}
        onKeyDown={handleKeyboard}
        role="group"
        tabIndex={0}
        aria-label="Hold, trace, and release Joe Simo's primary navigation"
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
          <em>{isTracing ? "Tracing" : "Ready"}</em>
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

        <div className="simo-console-routes" role="group" aria-label="Joe Simo primary routes">
          {navigationDestinations.map((destination, index) => (
            <Link
              key={destination.id}
              href={destination.href}
              className="simo-console-route"
              data-active={destination.id === activeDestination.id ? "true" : "false"}
              data-route={destination.id}
              onPointerEnter={() => setPreviewDestinationId(destination.id)}
              onFocus={() => handleKeyboardDestination(index)}
              onBlur={() => setPreviewDestinationId(null)}
            >
              <span>{destination.code}</span>
              <strong>{destination.label}</strong>
              <em>
                {destination.id === activeDestination.id
                  ? isTracing
                    ? `Release to ${destination.label}`
                    : "Current route"
                  : destination.receipt}
              </em>
            </Link>
          ))}
        </div>

        <div className="simo-console-receipt" id="simo-index-receipt">
          <span>{isTracing ? "Tracing" : "Joe Index"}</span>
          <strong>{receipt}</strong>
        </div>

        <div className="sr-only" aria-live="polite">
          {activeDestination.label}: {receipt}. {activeDestination.body}
        </div>

      </div>
    </section>
  );
}
