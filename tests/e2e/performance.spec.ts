import { expect, test } from "@playwright/test";

import { collectConsoleProblems, expectPageHealthy } from "./helpers";
import {
  installPerformanceObservers,
  readPerformanceSnapshot,
} from "./performance-helpers";

test.describe("performance budgets", () => {
  test("home stays inside local production performance budgets", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await installPerformanceObservers(page);
    await page.goto("/");
    await expectPageHealthy(page, problems);

    const snapshot = await readPerformanceSnapshot(page);

    expect(snapshot.domContentLoadedMs).toBeLessThan(2_500);
    expect(snapshot.loadMs).toBeLessThan(5_000);
    expect(snapshot.cumulativeLayoutShift).toBeLessThan(0.02);
    expect(snapshot.decodedScriptBytes).toBeLessThan(2_500_000);
    expect(snapshot.totalDecodedResourceBytes).toBeLessThan(8_000_000);
  });

  test("one-page portfolio media avoids autoplay", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await page.goto("/#work");
    await expectPageHealthy(page, problems);

    const mediaPolicy = await page.locator("video").evaluateAll((videos) =>
      videos.map((node) => {
        const video = node as HTMLVideoElement;

        return {
          autoplay: video.autoplay,
          controls: video.controls,
          loop: video.loop,
          preload: video.preload,
        };
      }),
    );

    for (const video of mediaPolicy) {
      expect(video.autoplay).toBe(false);
      expect(video.loop).toBe(false);
      expect(video.controls).toBe(true);
    }
  });
});
