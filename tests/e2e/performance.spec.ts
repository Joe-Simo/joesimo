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

  test("one-page portfolio does not render video playback surfaces", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await page.goto("/#work");
    await expectPageHealthy(page, problems);

    await expect(page.locator("video")).toHaveCount(0);

    await page.goto("/?project=garden0#work", { waitUntil: "domcontentloaded" });

    const dialog = page.getByRole("dialog", { name: "garden0" });

    await expect(dialog).toBeVisible();
    await expect(dialog.locator("video")).toHaveCount(0);
    await expect(dialog.locator(".joe-dialog-media img")).toHaveAttribute(
      "src",
      /garden0.*\.webp/,
    );
  });
});
