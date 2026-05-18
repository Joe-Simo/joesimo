import { expect, test } from "@playwright/test";

import {
  blockHeavyMedia,
  collectConsoleProblems,
  expectPageHealthy,
} from "./helpers";

test.describe("desktop accessibility quality gates", () => {
  test("keyboard can reach the primary home controls in order", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expectPageHealthy(page, problems);

    await page.keyboard.press("Tab");
    await expect(page.getByText("Skip to content")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Joe Simo home")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Portfolio", exact: true }),
    ).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Blog", exact: true }),
    ).toBeFocused();
  });

  test("Simo Index controls expose usable accessible names", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expectPageHealthy(page, problems);

    await expect(
      page.getByRole("link", { name: /01 portfolio/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /02 blog/i }),
    ).toBeVisible();

    await expect(
      page.getByLabel("Tune the route"),
    ).toBeVisible();
  });
});
