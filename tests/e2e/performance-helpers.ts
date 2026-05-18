import type { Page } from "@playwright/test";

export type PerformanceSnapshot = {
  cumulativeLayoutShift: number;
  decodedImageBytes: number;
  decodedScriptBytes: number;
  domContentLoadedMs: number;
  loadMs: number;
  totalDecodedResourceBytes: number;
};

export async function installPerformanceObservers(page: Page) {
  await page.addInitScript(() => {
    const trackedWindow = window as Window & {
      __joeSimoLayoutShiftScore?: number;
    };

    Object.defineProperty(window, "__joeSimoLayoutShiftScore", {
      configurable: true,
      value: 0,
      writable: true,
    });

    try {
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const layoutShift = entry as PerformanceEntry & {
            hadRecentInput?: boolean;
            value?: number;
          };

          if (!layoutShift.hadRecentInput) {
            trackedWindow.__joeSimoLayoutShiftScore =
              (trackedWindow.__joeSimoLayoutShiftScore ?? 0) +
              (layoutShift.value ?? 0);
          }
        }
      });

      observer.observe({ buffered: true, type: "layout-shift" });
    } catch {
      trackedWindow.__joeSimoLayoutShiftScore = 0;
    }
  });
}

export async function readPerformanceSnapshot(page: Page) {
  await page.waitForLoadState("load");
  await page.waitForTimeout(500);

  return page.evaluate<PerformanceSnapshot>(() => {
    const trackedWindow = window as Window & {
      __joeSimoLayoutShiftScore?: number;
    };
    const navigation = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType(
      "resource",
    ) as PerformanceResourceTiming[];
    const decodedScriptBytes = resources
      .filter((entry) => entry.initiatorType === "script")
      .reduce((total, entry) => total + entry.decodedBodySize, 0);
    const decodedImageBytes = resources
      .filter((entry) => entry.initiatorType === "img")
      .reduce((total, entry) => total + entry.decodedBodySize, 0);
    const totalDecodedResourceBytes = resources.reduce(
      (total, entry) => total + entry.decodedBodySize,
      0,
    );

    return {
      cumulativeLayoutShift: trackedWindow.__joeSimoLayoutShiftScore ?? 0,
      decodedImageBytes,
      decodedScriptBytes,
      domContentLoadedMs: navigation.domContentLoadedEventEnd,
      loadMs: navigation.loadEventEnd,
      totalDecodedResourceBytes,
    };
  });
}
