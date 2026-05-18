import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import {
  blockHeavyMedia,
  collectConsoleProblems,
  expectPageHealthy,
  workRoutes,
} from "./helpers";

const axeRoutes = [
  { name: "home", path: "/" },
  { name: "sim0 work", path: "/work/sim0" },
  { name: "Astrosimo work", path: "/work/astrosimo" },
  { name: "ChessLM work", path: "/work/chesslm" },
] as const;

test.describe("accessibility quality gates", () => {
  for (const route of axeRoutes) {
    test(`has no critical axe violations: ${route.name}`, async ({ page }) => {
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

  for (const route of workRoutes) {
    test(`work page has one main heading and one main landmark: ${route.heading}`, async ({
      page,
    }) => {
      const problems = collectConsoleProblems(page);

      await blockHeavyMedia(page);
      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      await expectPageHealthy(page, problems);

      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(
        page.getByRole("heading", { level: 1, name: route.heading }),
      ).toHaveCount(1);
    });
  }
});
