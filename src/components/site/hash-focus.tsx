"use client";

import { useEffect } from "react";

function targetsForHash(hash: string) {
  if (!hash) {
    return null;
  }

  const target = document.querySelector<HTMLElement>(hash);

  if (!target) {
    return null;
  }

  if (target.matches("section")) {
    return {
      focusTarget: target.querySelector<HTMLElement>("h1, h2") ?? target,
      scrollTarget: target,
    };
  }

  const containingSection = target.closest<HTMLElement>("section");
  const isMethodStepTarget = Boolean(target.closest(".simo-method-route"));

  return {
    focusTarget: target.querySelector<HTMLElement>("h1, h2, h3") ?? target,
    scrollTarget: isMethodStepTarget
      ? containingSection ?? target
      : target,
  };
}

export function HashFocus() {
  useEffect(() => {
    function focusHashTarget() {
      window.requestAnimationFrame(() => {
        const targets = targetsForHash(window.location.hash);

        if (!targets) {
          return;
        }

        const { focusTarget, scrollTarget } = targets;

        scrollTarget.scrollIntoView({ block: "start" });

        if (!focusTarget.hasAttribute("tabindex")) {
          focusTarget.tabIndex = -1;
        }

        window.requestAnimationFrame(() => {
          focusTarget.focus({ preventScroll: true });
        });
      });
    }

    const retryTimers = [
      window.setTimeout(focusHashTarget, 120),
      window.setTimeout(focusHashTarget, 600),
    ];

    window.addEventListener("hashchange", focusHashTarget);
    window.addEventListener("load", focusHashTarget);
    focusHashTarget();

    return () => {
      for (const timer of retryTimers) {
        window.clearTimeout(timer);
      }

      window.removeEventListener("hashchange", focusHashTarget);
      window.removeEventListener("load", focusHashTarget);
    };
  }, []);

  return null;
}
