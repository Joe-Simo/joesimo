"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { LocalizedText, navLabelEs } from "@/components/site/localized-text";
import type { NavHref, NavItem } from "@/lib/site-data";
import { cn } from "@/lib/utils";

type HashNavHref = Extract<NavHref, `#${string}`>;
type PrimaryNavItem = NavItem;
type PrimaryHashNavHref = Extract<PrimaryNavItem["href"], `#${string}`>;

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
  items,
  sectionPrefix = "",
}: {
  activeHref?: NavHref | null;
  items: readonly NavItem[];
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

    const targets = items
      .filter((item): item is PrimaryNavItem & { href: PrimaryHashNavHref } =>
        isHashNavHref(item.href),
      )
      .map((item) => ({
        href: item.href,
        target: document.querySelector<HTMLElement>(item.href),
      }))
      .filter(
        (item): item is { href: PrimaryHashNavHref; target: HTMLElement } =>
          isHashNavHref(item.href) &&
          Boolean(item.target),
      );

    if (targets.length === 0) {
      return;
    }

    let frame = 0;

    function resolveActiveHref(preferHash: boolean) {
      const hashTarget = targets.find(({ href }) => href === window.location.hash);

      if (hashTarget) {
        const rect = hashTarget.target.getBoundingClientRect();
        const hashTargetVisible =
          rect.top < window.innerHeight - 72 && rect.bottom > 72;

        if (preferHash || hashTargetVisible) {
          return hashTarget.href;
        }
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

      return null;
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
  }, [isDesktop, items, sectionPrefix]);

  return (
    <nav
      aria-label="Primary navigation"
      className="hidden items-center gap-1 lg:flex"
    >
      {items.map((item) => {
        const active = item.href === activeHref;

        return (
          isInternalRouteHref(item.href) ? (
            <Link
              key={item.href}
              href={resolveNavHref(item.href, sectionPrefix)}
              aria-current={active ? "location" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center rounded-md px-3 font-mono text-xs text-muted-foreground outline-none transition hover:text-foreground focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30",
                active && "text-foreground",
              )}
            >
              <LocalizedText en={item.label} es={navLabelEs(item.label)} />
            </Link>
          ) : (
            <a
              key={item.href}
              href={resolveNavHref(item.href, sectionPrefix)}
              aria-current={active ? "location" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center rounded-md px-3 font-mono text-xs text-muted-foreground outline-none transition hover:text-foreground focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30",
                active && "text-foreground",
              )}
            >
              <LocalizedText en={item.label} es={navLabelEs(item.label)} />
            </a>
          )
        );
      })}
    </nav>
  );
}
