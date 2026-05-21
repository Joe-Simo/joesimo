import { expect, test } from "@playwright/test";

import {
  collectConsoleProblems,
  expectPageHealthy,
  expectTrailCanvasNonBlank,
} from "./helpers";
import {
  installPerformanceObservers,
  readPerformanceSnapshot,
} from "./performance-helpers";

test.describe("mobile performance budgets", () => {
  test("mobile path keeps the trail canvas and media inside local budgets", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await installPerformanceObservers(page);
    await page.goto("/");
    await expectPageHealthy(page, problems);

    const snapshot = await readPerformanceSnapshot(page);

    await expectTrailCanvasNonBlank(page);
    expect(snapshot.decodedScriptBytes).toBeLessThan(2_800_000);
    expect(snapshot.decodedImageBytes).toBeLessThan(6_500_000);
    expect(snapshot.cumulativeLayoutShift).toBeLessThan(0.02);
  });
});
