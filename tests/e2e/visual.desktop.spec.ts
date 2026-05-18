import { expect, type Page, test } from "@playwright/test";

import {
  blockHeavyMedia,
  collectConsoleProblems,
  expectPageHealthy,
  installStableVisualStyles,
  setTheme,
} from "./helpers";

async function prepareVisualPage(
  page: Page,
  theme: "dark" | "light",
) {
  await setTheme(page, theme);
  await installStableVisualStyles(page);
}

test.describe("desktop visual regression", () => {
  test("desktop light home first viewport stays composed", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
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
    await setTheme(page, "light");
    await page.goto("/#work", { waitUntil: "domcontentloaded" });
    await prepareVisualPage(page, "light");
    await expectPageHealthy(page, problems);
    await expect(page.getByRole("heading", { name: "sim0" })).toBeVisible();

    await expect(page).toHaveScreenshot("work-complete-desktop-light.png", {
      maxDiffPixelRatio: 0.02,
    });
  });
});
