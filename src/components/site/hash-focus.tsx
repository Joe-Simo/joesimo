"use client";

import { useEffect } from "react";

function targetsForHash(hash: string) {
  if (!hash.startsWith("#") || hash.length === 1) {
    return null;
  }

  const rawId = hash.slice(1);
  let id = rawId;

  try {
    id = decodeURIComponent(rawId);
  } catch {
    id = rawId;
  }

  const target = document.getElementById(id);

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

  return {
    focusTarget: target.querySelector<HTMLElement>("h1, h2, h3") ?? target,
    scrollTarget: containingSection ?? target,
  };
}

export function HashFocus() {
  useEffect(() => {
    const retryTimers = new Set<number>();

    let restoringHistory = false;

    function focusHashTarget(shouldScroll: boolean) {
      window.requestAnimationFrame(() => {
        const targets = targetsForHash(window.location.hash);

        if (!targets) {
          return;
        }

        const { focusTarget, scrollTarget } = targets;

        const scrollTargetRect = scrollTarget.getBoundingClientRect();
        const targetIsVisible =
          scrollTargetRect.bottom > 0 &&
          scrollTargetRect.top < window.innerHeight;

        if (shouldScroll || !targetIsVisible) {
          const rootScrollBehavior = document.documentElement.style.scrollBehavior;
          const bodyScrollBehavior = document.body.style.scrollBehavior;

          document.documentElement.style.scrollBehavior = "auto";
          document.body.style.scrollBehavior = "auto";
          scrollTarget.scrollIntoView({ behavior: "auto", block: "start" });
          window.requestAnimationFrame(() => {
            document.documentElement.style.scrollBehavior = rootScrollBehavior;
            document.body.style.scrollBehavior = bodyScrollBehavior;
          });
        }

        if (!focusTarget.hasAttribute("tabindex")) {
          focusTarget.tabIndex = -1;
        }

        window.requestAnimationFrame(() => {
          const activeElement = document.activeElement;
          const hasInteractiveFocus =
            activeElement instanceof HTMLElement &&
            activeElement !== document.body &&
            activeElement !== document.documentElement &&
            activeElement.matches(
              "a, button, input, textarea, select, [tabindex]:not([tabindex='-1'])",
            );

          if (hasInteractiveFocus) {
            return;
          }

          focusTarget.focus({ preventScroll: true });
        });
      });
    }

    function scheduleHashFocus() {
      const shouldScroll = !restoringHistory;

      for (const timer of retryTimers) {
        window.clearTimeout(timer);
      }

      retryTimers.clear();
      focusHashTarget(shouldScroll);

      for (const delay of [120, 600, 1200, 2200]) {
        const timer = window.setTimeout(() => {
          retryTimers.delete(timer);
          focusHashTarget(shouldScroll);
        }, delay);

        retryTimers.add(timer);
      }

      restoringHistory = false;
    }

    function handlePopState() {
      restoringHistory = true;
    }

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", scheduleHashFocus);
    window.addEventListener("load", scheduleHashFocus);
    scheduleHashFocus();

    return () => {
      for (const timer of retryTimers) {
        window.clearTimeout(timer);
      }

      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", scheduleHashFocus);
      window.removeEventListener("load", scheduleHashFocus);
    };
  }, []);

  return null;
}
