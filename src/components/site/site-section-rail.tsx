"use client";

import { useEffect, useState } from "react";

import { navItems, type NavHref } from "@/lib/site-data";

type RailItem = {
  href: NavHref | "#joe";
  label: string;
};

const railItems = [
  { href: "#joe", label: "Joe" },
  ...navItems.map((item) => ({
    href: item.href,
    label: item.label,
  })),
] as const satisfies readonly RailItem[];

export function SiteSectionRail() {
  const [activeHref, setActiveHref] = useState<RailItem["href"]>("#joe");

  useEffect(() => {
    const targets = railItems
      .map((item) => ({
        href: item.href,
        target: document.querySelector<HTMLElement>(item.href),
      }))
      .filter(
        (item): item is { href: RailItem["href"]; target: HTMLElement } =>
          Boolean(item.target),
      );

    if (targets.length === 0) {
      return;
    }

    let frame = 0;

    function updateActiveHref() {
      frame = 0;
      const probeY = Math.min(window.innerHeight * 0.42, 340);
      const hashTarget = targets.find(({ href }) => href === window.location.hash);

      if (hashTarget) {
        const rect = hashTarget.target.getBoundingClientRect();

        if (rect.top < window.innerHeight - 72 && rect.bottom > 72) {
          setActiveHref(hashTarget.href);
          return;
        }
      }

      let nextHref: RailItem["href"] = "#joe";

      for (const { href, target } of targets) {
        const rect = target.getBoundingClientRect();

        if (rect.top <= probeY && rect.bottom > 80) {
          nextHref = href;
        }
      }

      setActiveHref(nextHref);
    }

    function scheduleUpdate() {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(updateActiveHref);
    }

    scheduleUpdate();
    window.addEventListener("hashchange", scheduleUpdate);
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate);
    };
  }, []);

  return (
    <aside className="simo-section-rail" aria-label="Page sections">
      {railItems.map((item, index) => {
        const active = item.href === activeHref;

        return (
          <a
            aria-current={active ? "location" : undefined}
            href={item.href}
            key={item.href}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{item.label}</strong>
          </a>
        );
      })}
    </aside>
  );
}
