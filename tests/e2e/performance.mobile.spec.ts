import { expect, test } from "@playwright/test";

import {
  collectConsoleProblems,
  expectPageHealthy,
} from "./helpers";
import {
  installPerformanceObservers,
  readPerformanceSnapshot,
} from "./performance-helpers";

test.describe("mobile performance budgets", () => {
  test("mobile path keeps the homepage and media inside local budgets", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);
    const mobileHeroEffectRequests: string[] = [];

    await installPerformanceObservers(page);
    page.on("request", (request) => {
      const url = request.url();

      if (
        url.includes("node_modules_three") ||
        url.includes("/media/joe-simo-headshot.webp") ||
        url.includes("%2Fmedia%2Fjoe-simo-headshot.webp")
      ) {
        mobileHeroEffectRequests.push(url);
      }
    });
    await page.goto("/");
    await expectPageHealthy(page, problems);

    const snapshot = await readPerformanceSnapshot(page);

    await expect(page.locator(".simo-public-trail-canvas")).toHaveCount(0);
    await expect(page.locator(".joe-signal-field")).toHaveCount(0);
    await expect(page.locator(".joe-identity-field")).toHaveCount(0);
    await expect(page.locator(".joe-name-particles")).toHaveAttribute(
      "data-particles-ready",
      "true",
      { timeout: 20_000 },
    );
    await expect(page.locator(".joe-name-particles-canvas")).toBeVisible();
    await expect(page.locator(".joe-name-particles-canvas")).toHaveCSS(
      "opacity",
      "1",
    );
    expect(mobileHeroEffectRequests).toEqual([]);
    expect(snapshot.decodedScriptBytes).toBeLessThan(2_800_000);
    expect(snapshot.decodedImageBytes).toBeLessThan(6_500_000);
    expect(snapshot.cumulativeLayoutShift).toBeLessThan(0.02);
  });
});
