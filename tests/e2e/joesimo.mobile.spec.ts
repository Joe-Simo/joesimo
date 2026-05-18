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
    await expect(page.locator(".simo-aperture img")).toHaveCount(1);

    await page.evaluate(() => window.scrollTo(0, 0));
    const startingScrollY = await page.evaluate(() => window.scrollY);
    await page.evaluate(() => window.scrollBy(0, 120));
    await expect
      .poll(() => page.evaluate((start) => window.scrollY > start, startingScrollY))
      .toBe(true);

    await page.locator("#simo-index-range").evaluate((node) => {
      const input = node as HTMLInputElement;

      input.value = "1";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await expect(page.locator(".simo-index-ritual")).toHaveAttribute(
      "data-active-intent",
      "blog",
    );
    await expect(page.getByText("Read the notes.")).toBeVisible();

    await page.goto("/#work", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "sim0" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "ChessLM" })).toBeVisible();

    await expectPageHealthy(page, problems);
  });
});
