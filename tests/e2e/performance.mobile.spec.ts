import { expect, test } from "@playwright/test";

import {
  collectConsoleProblems,
  expectJoeSignalFieldReady,
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

    await installPerformanceObservers(page);
    await page.goto("/");
    await expectPageHealthy(page, problems);

    const snapshot = await readPerformanceSnapshot(page);

    await expect(page.locator(".simo-public-trail-canvas")).toHaveCount(0);
    await expectJoeSignalFieldReady(page);
    expect(snapshot.decodedScriptBytes).toBeLessThan(2_800_000);
    expect(snapshot.decodedImageBytes).toBeLessThan(6_500_000);
    expect(snapshot.cumulativeLayoutShift).toBeLessThan(0.02);
  });
});
