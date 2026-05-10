"use client";

import dynamic from "next/dynamic";

const SiteCanvasDesktop = dynamic(
  () =>
    import("@/components/site/site-canvas-desktop").then(
      (mod) => mod.SiteCanvasDesktop,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="hidden h-[min(72svh,680px)] min-h-[560px] rounded-[1.5rem] border border-border bg-background md:block"
        aria-hidden
      />
    ),
  },
);

export function SiteCanvasDesktopLoader() {
  return <SiteCanvasDesktop />;
}
