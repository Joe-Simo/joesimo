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

async function freezeAnimationFrameTime(page: Page) {
  await page.addInitScript(() => {
    const requestAnimationFrame = window.requestAnimationFrame.bind(window);

    window.requestAnimationFrame = (callback) =>
      requestAnimationFrame(() => callback(1200));
  });
}

test.describe("desktop visual regression", () => {
  test("desktop light home first viewport stays composed", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await setTheme(page, "light");
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await prepareVisualPage(page, "light");
    await expectPageHealthy(page, problems);

    await expect(page).toHaveScreenshot("home-desktop-light.png", {
      maxDiffPixelRatio: 0.02,
    });
  });

  test("desktop dark home first viewport stays composed", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await setTheme(page, "dark");
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await prepareVisualPage(page, "dark");
    await expectPageHealthy(page, problems);

    await expect(page).toHaveScreenshot("home-desktop-dark.png", {
      maxDiffPixelRatio: 0.02,
    });
  });

  test("desktop work index stays composed", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await setTheme(page, "light");
    await page.goto("/#work", { waitUntil: "domcontentloaded" });
    await prepareVisualPage(page, "light");
    await page.locator("#work").scrollIntoViewIfNeeded();
    await expectPageHealthy(page, problems);
    await expect(
      page.locator("#work").getByRole("heading", { name: "Love Presentation" }),
    ).toBeVisible();
    await loadImagesInLocator(page, "#work");

    await expect(page).toHaveScreenshot("work-complete-desktop-light.png", {
      maxDiffPixelRatio: 0.02,
    });
  });

  test("desktop normal-motion identity WebGL field stays composed", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await freezeAnimationFrameTime(page);
    await blockHeavyMedia(page);
    await setTheme(page, "dark");
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await installStableVisualStyles(page);
    await expect(page.locator(".joe-identity-field")).toHaveAttribute(
      "data-hero-webgl",
      "ready",
      { timeout: 20_000 },
    );
    await expect(page.locator(".joe-identity-field canvas")).toBeVisible();
    await expectPageHealthy(page, problems);

    await expect(page.locator(".joe-identity-field")).toHaveScreenshot(
      "identity-webgl-normal-desktop.png",
      {
        maxDiffPixelRatio: 0.03,
      },
    );
  });
});
