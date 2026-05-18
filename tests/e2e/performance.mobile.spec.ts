import { expect, test } from "@playwright/test";

import { collectConsoleProblems, expectPageHealthy } from "./helpers";
import {
  installPerformanceObservers,
  readPerformanceSnapshot,
} from "./performance-helpers";

test.describe("mobile performance budgets", () => {
  test("mobile path avoids WebGL and heavy desktop media on first render", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await installPerformanceObservers(page);
    await page.goto("/");
    await expectPageHealthy(page, problems);

    const snapshot = await readPerformanceSnapshot(page);

    await expect(page.locator("canvas")).toHaveCount(0);
    expect(snapshot.decodedScriptBytes).toBeLessThan(2_200_000);
    expect(snapshot.decodedImageBytes).toBeLessThan(5_000_000);
    expect(snapshot.cumulativeLayoutShift).toBeLessThan(0.02);
  });
});
