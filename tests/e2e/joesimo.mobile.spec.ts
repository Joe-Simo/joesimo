import { expect, test } from "@playwright/test";

import {
  blockHeavyMedia,
  collectConsoleProblems,
  expectPageHealthy,
} from "./helpers";

test.describe("Joe Simo mobile Simo Index", () => {
  test("mobile uses the thumb rail without canvas or scroll trapping", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator(".simo-index-ritual")).toBeVisible();
    await expect(page.locator(".simo-index-portrait img")).toHaveCount(1);

    await page.evaluate(() => window.scrollTo(0, 0));
    const startingScrollY = await page.evaluate(() => window.scrollY);
    await page.evaluate(() => window.scrollBy(0, 120));
    await expect
      .poll(() => page.evaluate((start) => window.scrollY > start, startingScrollY))
      .toBe(true);

    await page.getByRole("link", { name: /02 blog/i }).click();
    await expect(page.locator(".simo-index-ritual")).toHaveAttribute(
      "data-active-intent",
      "blog",
    );
    await expect(
      page.getByRole("heading", { name: "Short notes from the way Joe thinks." }),
    ).toBeVisible();

    await page.goto("/#work", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "sim0" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "ChessLM" })).toBeVisible();

    await expectPageHealthy(page, problems);
  });
});
