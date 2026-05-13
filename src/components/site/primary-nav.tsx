"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { navItems, type NavHref } from "@/lib/site-data";
import { cn } from "@/lib/utils";

type HashNavHref = Extract<NavHref, `#${string}`>;

function resolveNavHref(href: NavHref, sectionPrefix: string) {
  return href.startsWith("#") ? `${sectionPrefix}${href}` : href;
}

function isHashNavHref(href: NavHref): href is HashNavHref {
  return href.startsWith("#");
}

function isInternalRouteHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

export function PrimaryNav({
  activeHref: initialActiveHref = null,
  sectionPrefix = "",
}: {
  activeHref?: NavHref | null;
  sectionPrefix?: string;
}) {
  const [activeHref, setActiveHref] = useState<NavHref | null>(
    initialActiveHref,
  );
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(desktopQuery.matches);

    update();
    desktopQuery.addEventListener("change", update);

    return () => desktopQuery.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (sectionPrefix || !isDesktop) {
      return;
    }

    const targets = navItems
      .filter((item): item is (typeof navItems)[number] & { href: HashNavHref } =>
        isHashNavHref(item.href),
      )
      .map((item) => ({
        href: item.href,
        target: document.querySelector<HTMLElement>(item.href),
      }))
      .filter(
        (item): item is { href: HashNavHref; target: HTMLElement } =>
          Boolean(item.target),
      );

    if (targets.length === 0) {
      return;
    }

    let frame = 0;

    function resolveActiveHref(preferHash: boolean) {
      const hashTarget = preferHash
        ? targets.find(({ href }) => href === window.location.hash)
        : null;

      if (hashTarget) {
        return hashTarget.href;
      }

      const probeY = Math.min(window.innerHeight * 0.38, 320);
      let active: HashNavHref | null = null;

      for (const { href, target } of targets) {
        const rect = target.getBoundingClientRect();

        if (rect.top <= probeY && rect.bottom > 72) {
          active = href;
        }
      }

      if (active) {
        return active;
      }

      const visibleTarget = targets.find(({ target }) => {
        const rect = target.getBoundingClientRect();

        return rect.bottom > 72 && rect.top < window.innerHeight;
      });

      return visibleTarget?.href ?? null;
    }

    let preferHashOnNextFrame = true;

    function updateActiveHref() {
      const preferHash = preferHashOnNextFrame;

      frame = 0;
      preferHashOnNextFrame = false;
      setActiveHref(resolveActiveHref(preferHash));
    }

    function scheduleUpdate(preferHash = false) {
      preferHashOnNextFrame = preferHashOnNextFrame || preferHash;

      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(updateActiveHref);
    }

    scheduleUpdate(true);

    const scheduleScrollUpdate = () => scheduleUpdate(false);
    const scheduleResizeUpdate = () => scheduleUpdate(false);
    const scheduleHashUpdate = () => scheduleUpdate(true);

    window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
    window.addEventListener("resize", scheduleResizeUpdate);
    window.addEventListener("hashchange", scheduleHashUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleScrollUpdate);
      window.removeEventListener("resize", scheduleResizeUpdate);
      window.removeEventListener("hashchange", scheduleHashUpdate);
    };
  }, [isDesktop, sectionPrefix]);

  return (
    <nav
      aria-label="Primary navigation"
      className="hidden items-center gap-1 lg:flex"
    >
      {navItems.map((item) => {
        const active = item.href === activeHref;

        return (
          isInternalRouteHref(item.href) ? (
            <Link
              key={item.href}
              href={resolveNavHref(item.href, sectionPrefix)}
              aria-current={active ? "location" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center rounded-md px-3 text-sm text-muted-foreground outline-none transition hover:text-foreground focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30",
                active && "text-foreground",
              )}
            >
              {item.label}
            </Link>
          ) : (
            <a
              key={item.href}
              href={resolveNavHref(item.href, sectionPrefix)}
              aria-current={active ? "location" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center rounded-md px-3 text-sm text-muted-foreground outline-none transition hover:text-foreground focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30",
                active && "text-foreground",
              )}
            >
              {item.label}
            </a>
          )
        );
      })}
    </nav>
  );
}
