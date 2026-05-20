"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import type {
  WebGLSignalFieldProps,
  WebGLSignalNode,
} from "@/components/site/webgl-signal-field";

type MethodStep = {
  body: string;
  code: string;
  id: "support" | "signals" | "surface";
  label: string;
  node: WebGLSignalNode;
  title: string;
};

const methodSteps = [
  {
    id: "support",
    code: "01",
    label: "Support",
    title: "Start where it breaks.",
    body:
      "The brief starts with the path a person can describe when the workflow fails.",
    node: { id: "support", x: 18, y: 58, tension: 0.2, depth: 0.42 },
  },
  {
    id: "signals",
    code: "02",
    label: "Signals",
    title: "Trace the state.",
    body:
      "Routes, timing, handoff, and system state become visible before the interface asks for confidence.",
    node: { id: "signals", x: 50, y: 34, tension: 0.7, depth: 0.68 },
  },
  {
    id: "surface",
    code: "03",
    label: "Surface",
    title: "Make the next action obvious.",
    body:
      "The final surface removes guesswork and keeps consequence close to the control.",
    node: { id: "surface", x: 82, y: 58, tension: 0.55, depth: 0.5 },
  },
] as const satisfies readonly MethodStep[];

const methodNodes = methodSteps.map((step) => step.node);
const methodHashes = {
  support: "#method-support",
  signals: "#method-signals",
  surface: "#method-surface",
} as const satisfies Record<MethodStep["id"], `#method-${string}`>;

const DynamicWebGLSignalField = dynamic<WebGLSignalFieldProps>(
  () =>
    import("@/components/site/webgl-signal-field").then(
      (module) => module.WebGLSignalField,
    ),
  {
    loading: () => null,
    ssr: false,
  },
);

function stepFromHash(hash: string) {
  return methodSteps.find((step) => methodHashes[step.id] === hash)?.id;
}

function StaticSignalRoute({
  activeStepId,
}: {
  activeStepId: MethodStep["id"];
}) {
  return (
    <div className="simo-signal-static-route" aria-hidden>
      <svg viewBox="0 0 100 44" focusable="false">
        <path
          d="M8 32 C 28 32, 30 12, 50 12 S 72 32, 92 32"
          vectorEffect="non-scaling-stroke"
        />
        {methodSteps.map((step) => (
          <g
            data-active={step.id === activeStepId}
            key={step.id}
            transform={`translate(${step.node.x} ${step.node.y * 0.48})`}
          >
            <circle r="3.2" />
            <text y="-7">{step.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function MethodWorld() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stepButtonRefs = useRef<
    Partial<Record<(typeof methodSteps)[number]["id"], HTMLButtonElement>>
  >({});
  const [sectionActive, setSectionActive] = useState(false);
  const [activeStepId, setActiveStepId] =
    useState<(typeof methodSteps)[number]["id"]>("support");
  const [webglEnabled, setWebglEnabled] = useState(false);

  const activeIndex = methodSteps.findIndex((step) => step.id === activeStepId);
  const activeStep = methodSteps[activeIndex] ?? methodSteps[0];
  const inspectedNodeIds = methodSteps
    .slice(0, activeIndex + 1)
    .map((step) => step.id);

  useEffect(() => {
    function syncStepFromHash() {
      const hashStepId = stepFromHash(window.location.hash);

      if (hashStepId) {
        setActiveStepId(hashStepId);
      }
    }

    syncStepFromHash();
    window.addEventListener("hashchange", syncStepFromHash);

    return () => window.removeEventListener("hashchange", syncStepFromHash);
  }, []);

  useEffect(() => {
    const viewportQuery = window.matchMedia("(min-width: 768px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateWebglState = () => {
      setWebglEnabled(viewportQuery.matches && !motionQuery.matches);
    };

    updateWebglState();
    viewportQuery.addEventListener("change", updateWebglState);
    motionQuery.addEventListener("change", updateWebglState);

    return () => {
      viewportQuery.removeEventListener("change", updateWebglState);
      motionQuery.removeEventListener("change", updateWebglState);
    };
  }, []);

  useEffect(() => {
    const sectionElement = sectionRef.current;

    if (!sectionElement) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setSectionActive(entry.isIntersecting && entry.intersectionRatio > 0.12);
      },
      {
        rootMargin: "0px",
        threshold: [0, 0.12, 0.28],
      },
    );

    observer.observe(sectionElement);

    return () => observer.disconnect();
  }, []);

  const shouldRenderWebgl = webglEnabled && sectionActive;

  function selectStep(stepId: MethodStep["id"], moveFocus = false) {
    setActiveStepId(stepId);

    if (window.location.hash !== methodHashes[stepId]) {
      window.history.pushState(null, "", methodHashes[stepId]);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }

    if (moveFocus) {
      window.requestAnimationFrame(() => {
        stepButtonRefs.current[stepId]?.focus();
      });
    }
  }

  function focusStep(index: number, moveFocus = false) {
    const nextStep = methodSteps[index];

    if (nextStep) {
      selectStep(nextStep.id, moveFocus);
    }
  }

  function handleStepKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      focusStep((index + 1) % methodSteps.length, true);
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      focusStep((index - 1 + methodSteps.length) % methodSteps.length, true);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusStep(0, true);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      focusStep(methodSteps.length - 1, true);
    }
  }

  return (
    <section
      id="method"
      ref={sectionRef}
      className="simo-signal-world"
      data-step={activeStep.id}
      aria-labelledby="method-title"
    >
      <StaticSignalRoute activeStepId={activeStep.id} />

      {shouldRenderWebgl ? (
        <DynamicWebGLSignalField
          activeNodeId={activeStep.id}
          activeRouteProgress={1}
          caseComplete={activeStep.id === "surface"}
          className="simo-signal-webgl"
          inspectedNodeIds={inspectedNodeIds}
          interactionMode={activeStep.id === "surface" ? "receipt" : "proof"}
          investigationStatus={
            activeStep.id === "support"
              ? "briefing"
              : activeStep.id === "signals"
                ? "tracing"
                : "synthesizing"
          }
          isTracing={activeStep.id === "signals"}
          nodes={methodNodes}
          originNodeId="support"
          sceneMode="method"
        />
      ) : null}

      <div className="site-shell simo-signal-shell">
        <div className="simo-signal-copy">
          <p className="simo-index-kicker">Method</p>
          <h2 id="method-title" tabIndex={-1}>
            Support <span aria-hidden>→</span> Signals <span aria-hidden>→</span>{" "}
            Surface
          </h2>
          <p>
            A compact route through the way Joe turns ambiguous support pressure
            into an interface a person can operate.
          </p>
        </div>

        <div
          className="simo-method-route"
          role="tablist"
          aria-label="Support Signals Surface route"
        >
          {methodSteps.map((step, index) => {
            const active = step.id === activeStep.id;

            return (
              <button
                aria-controls="method-step-panel"
                aria-selected={active}
                className="simo-method-step"
                data-active={active}
                id={`method-${step.id}`}
                key={step.id}
                onClick={() => selectStep(step.id)}
                onKeyDown={(event) => handleStepKeyDown(event, index)}
                ref={(element) => {
                  if (element) {
                    stepButtonRefs.current[step.id] = element;
                  } else {
                    delete stepButtonRefs.current[step.id];
                  }
                }}
                role="tab"
                tabIndex={active ? 0 : -1}
                type="button"
              >
                <span>{step.code}</span>
                <strong>{step.label}</strong>
                <em>{step.title}</em>
              </button>
            );
          })}
        </div>

        <article
          aria-labelledby={`method-${activeStep.id}`}
          className="simo-method-active"
          id="method-step-panel"
          role="tabpanel"
        >
          <span>{activeStep.code}</span>
          <h3>{activeStep.title}</h3>
          <p>{activeStep.body}</p>
        </article>
      </div>
    </section>
  );
}
