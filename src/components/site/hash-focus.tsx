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
    const retryTimers = new Set<number>();

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

    function scheduleHashFocus() {
      for (const timer of retryTimers) {
        window.clearTimeout(timer);
      }

      retryTimers.clear();
      focusHashTarget();

      for (const delay of [120, 600, 1200, 2200]) {
        const timer = window.setTimeout(() => {
          retryTimers.delete(timer);
          focusHashTarget();
        }, delay);

        retryTimers.add(timer);
      }
    }

    window.addEventListener("hashchange", scheduleHashFocus);
    window.addEventListener("load", scheduleHashFocus);
    scheduleHashFocus();

    return () => {
      for (const timer of retryTimers) {
        window.clearTimeout(timer);
      }

      window.removeEventListener("hashchange", scheduleHashFocus);
      window.removeEventListener("load", scheduleHashFocus);
    };
  }, []);

  return null;
}
