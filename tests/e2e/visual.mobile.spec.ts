import { expect, type Page, test } from "@playwright/test";

import {
  blockHeavyMedia,
  collectConsoleProblems,
  expectPageHealthy,
  installStableVisualStyles,
  loadImagesInLocator,
  setTheme,
} from "./helpers";

async function prepareVisualPage(
  page: Page,
  theme: "dark" | "light",
) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await setTheme(page, theme);
  await installStableVisualStyles(page);
}

test.describe("mobile visual regression", () => {
  test("mobile home first viewport stays composed", async ({ page }) => {
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await setTheme(page, "light");
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await prepareVisualPage(page, "light");
    await expectPageHealthy(page, problems);

    await expect(page).toHaveScreenshot("home-mobile-light.png", {
      maxDiffPixelRatio: 0.02,
    });
  });

  test("mobile work index stays composed", async ({ page }) => {
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await setTheme(page, "dark");
    await page.goto("/#work", { waitUntil: "domcontentloaded" });
    await prepareVisualPage(page, "dark");
    await page.locator("#work").scrollIntoViewIfNeeded();
    await expectPageHealthy(page, problems);
    await expect(
      page.locator("#work").getByRole("heading", { name: "love-presentation" }),
    ).toBeVisible();
    await loadImagesInLocator(page, "#work");

    await expect(page).toHaveScreenshot("work-mobile-dark.png", {
      maxDiffPixelRatio: 0.02,
    });
  });
});
