"use client";

import {
  type CSSProperties,
  type KeyboardEvent,
  useMemo,
  useRef,
  useState,
} from "react";

import { SiteIcon } from "@/components/site/site-icons";
import type { SiteAction } from "@/lib/site-data";

type TraceStepId = "breakage" | "signal" | "surface";

type TraceStep = {
  id: TraceStepId;
  code: string;
  label: string;
  shortLabel: string;
  title: string;
  detail: string;
  proof: string;
};

const traceSteps: TraceStep[] = [
  {
    id: "breakage",
    code: "01",
    label: "Breakage",
    shortLabel: "Breaks",
    title: "Start with the break.",
    detail:
      "Listen to what failed, isolate the path, and remove ambiguity from the next action.",
    proof: "support / failure point",
  },
  {
    id: "signal",
    code: "02",
    label: "Telematics Engineering",
    shortLabel: "Signals",
    title: "Read the signal.",
    detail:
      "Systems, networks, signals, and communication shape how I think about state, routing, timing, and handoff.",
    proof: "telematics / system shape",
  },
  {
    id: "surface",
    code: "03",
    label: "Interface",
    shortLabel: "Surface",
    title: "Make the state usable.",
    detail:
      "The interface should show the right state at the right moment, with controls close to the consequence.",
    proof: "interface / sim0",
  },
];

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

export function MethodTraceInstrument({
  emailAction,
  workAction,
}: {
  emailAction: SiteAction;
  workAction: SiteAction;
}) {
  const [activeStepId, setActiveStepId] = useState<TraceStepId>("breakage");
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = Math.max(
    0,
    traceSteps.findIndex((step) => step.id === activeStepId),
  );
  const activeStep = traceSteps[activeIndex] ?? traceSteps[0];
  const progress = activeIndex / (traceSteps.length - 1);
  const style = {
    "--trace-progress": progress,
  } as CSSProperties;

  const liveText = useMemo(
    () => `${activeStep.label}. ${activeStep.title} ${activeStep.detail}`,
    [activeStep],
  );

  function focusStep(nextIndex: number) {
    const boundedIndex =
      (nextIndex + traceSteps.length) % traceSteps.length;
    const nextStep = traceSteps[boundedIndex];

    if (!nextStep) {
      return;
    }

    setActiveStepId(nextStep.id);
    window.requestAnimationFrame(() => {
      buttonRefs.current[boundedIndex]?.focus();
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      focusStep(index + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      focusStep(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusStep(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusStep(traceSteps.length - 1);
    }
  }

  return (
    <div className="method-trace-instrument" style={style}>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {liveText}
      </p>

      <div className="method-trace-track" aria-hidden>
        <span className="method-trace-track-line" />
        <span className="method-trace-track-fill" />
      </div>

      <div
        className="method-trace-steps"
        role="radiogroup"
        aria-label="Joe Simo method trace"
      >
        {traceSteps.map((step, index) => {
          const active = step.id === activeStep.id;

          return (
            <button
              key={step.id}
              ref={(node) => {
                buttonRefs.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={active}
              aria-controls="method-trace-readout"
              data-trace-entry={index === 0 ? "method" : undefined}
              tabIndex={active ? 0 : -1}
              className="method-trace-step"
              onClick={() => setActiveStepId(step.id)}
              onFocus={() => setActiveStepId(step.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <span className="method-trace-step-code">{step.code}</span>
              <span className="method-trace-step-node" aria-hidden />
              <span className="method-trace-step-label">
                {step.shortLabel}
              </span>
            </button>
          );
        })}
      </div>

      <div id="method-trace-readout" className="method-trace-readout">
        <span className="method-trace-readout-code">
          {activeStep.code} / {activeStep.proof}
        </span>
        <strong>{activeStep.title}</strong>
        <span>{activeStep.detail}</span>
        <div className="method-trace-actions" role="group" aria-label="Trace exits">
          <a
            href={workAction.href}
            {...actionTargetProps(workAction)}
            aria-label={workAction.ariaLabel}
          >
            {workAction.label}
            <SiteIcon iconKey="arrowUpRight" aria-hidden />
            <ExternalCue show={Boolean(workAction.external)} />
          </a>
          <a
            href={emailAction.href}
            {...actionTargetProps(emailAction)}
            aria-label={emailAction.ariaLabel}
          >
            {emailAction.label}
            <SiteIcon iconKey="arrowUpRight" aria-hidden />
            <ExternalCue show={Boolean(emailAction.external)} />
          </a>
        </div>
      </div>
    </div>
  );
}
