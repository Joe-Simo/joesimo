import { expect, test } from "@playwright/test";

import {
  blockHeavyMedia,
  collectConsoleProblems,
  expectPageHealthy,
} from "./helpers";

test.describe("Joe Simo desktop Simo Index", () => {
  test("desktop tunes the Joe-first personal index", async ({ page }) => {
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const ritual = page.locator(".simo-index-ritual");

    await expect(
      page.getByRole("heading", { level: 1, name: "Joe Simo" }),
    ).toBeVisible();
    await expect(page.locator(".simo-index-hero")).not.toContainText("sim0");
    await expect(ritual).toBeVisible();
    await expect(ritual).toHaveAttribute("data-active-intent", "portfolio");

    await page.getByRole("link", { name: /02 blog/i }).focus();
    await expect(ritual).toHaveAttribute("data-active-intent", "blog");
    await expect(
      page.getByRole("heading", { name: "Short notes from the way Joe thinks." }),
    ).toBeVisible();

    await page
      .getByLabel("Hold, trace, and release Joe Simo's primary navigation")
      .focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await expect(ritual).toHaveAttribute("data-active-intent", "blog");
    await expect(page.getByText("Blog route armed")).toBeVisible();

    await page.goto("/#work", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("link", { name: /open case/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "sim0" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Astrosimo" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Antoneta's Garden" })).toBeVisible();

    await expectPageHealthy(page, problems);
  });
});
