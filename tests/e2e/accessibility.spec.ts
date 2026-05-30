import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import {
  blockHeavyMedia,
  collectConsoleProblems,
  expectPageHealthy,
} from "./helpers";

const axeRoutes = [
  { name: "home", path: "/" },
] as const;

test.describe("accessibility quality gates", () => {
  for (const route of axeRoutes) {
    test(`has no critical axe violations: ${route.name}`, async ({ page }) => {
      test.setTimeout(60_000);

      const problems = collectConsoleProblems(page);

      await blockHeavyMedia(page);
      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      await expectPageHealthy(page, problems);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      const blockingViolations = results.violations.filter((violation) =>
        ["critical", "serious"].includes(violation.impact ?? ""),
      );

      expect(blockingViolations).toEqual([]);
    });
  }

  test("has no serious axe violations on mobile home", async ({ page }) => {
    test.setTimeout(60_000);

    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expectPageHealthy(page, problems);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const blockingViolations = results.violations.filter((violation) =>
      ["critical", "serious"].includes(violation.impact ?? ""),
    );

    expect(blockingViolations).toEqual([]);
  });
});
