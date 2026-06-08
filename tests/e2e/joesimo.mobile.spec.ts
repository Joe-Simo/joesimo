import { expect, test } from "@playwright/test";

import {
  blockHeavyMedia,
  collectConsoleProblems,
  expectHomeDestinationSection,
  expectInteractiveTextFits,
  expectNoHorizontalOverflow,
  expectPageHealthy,
} from "./helpers";

test.describe("Joe Simo mobile homepage navigation", () => {
  test("mobile keeps sections reachable without overflow or scroll trapping", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expectNoHorizontalOverflow(page);
    await expectInteractiveTextFits(page);
    await expect(page.locator(".joe-hero-metadata")).toHaveCount(0);
    await expect(page.locator(".joe-hero-work")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /theme:/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /language:/i })).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, 0));
    const startingScrollY = await page.evaluate(() => window.scrollY);
    await page.evaluate(() => window.scrollBy(0, 120));
    await expect
      .poll(() => page.evaluate((start) => window.scrollY > start, startingScrollY))
      .toBe(true);

    await page.goto("/#community", { waitUntil: "domcontentloaded" });

    const communitySection = await expectHomeDestinationSection(
      page,
      "community",
    );
    await expect(communitySection).toBeInViewport();
    await expectNoHorizontalOverflow(page);

    await page.goto("/#credentials", { waitUntil: "domcontentloaded" });
    const credentialsSection = await expectHomeDestinationSection(
      page,
      "credentials",
    );
    await expect(credentialsSection).toBeInViewport();

    await page.goto("/#work", { waitUntil: "domcontentloaded" });

    const workSection = await expectHomeDestinationSection(page, "work");
    await expect(workSection).toBeInViewport();
    await expect(
      workSection.getByRole("heading", {
        exact: true,
        name: "GitHub projects",
      }),
    ).toBeVisible();
    await expect(workSection.locator(".joe-work-table")).toHaveCount(0);
    await expect(workSection.locator(".joe-github-card")).toHaveCount(5);
    await expect(
      workSection.locator('article.joe-github-card[data-visibility="private"]'),
    ).toHaveCount(0);
    await expect(workSection.locator(".joe-product-card")).toHaveCount(4);
    await expect(workSection.getByText("sim0", { exact: true })).toBeVisible();
    await expect(
      workSection.locator('a[href="https://signature0.com"]'),
    ).toBeVisible();
    await expect(workSection.getByText("love-presentation")).toBeVisible();

    const firstWorkTitleBox = await workSection
      .getByRole("heading", { name: "GitHub projects" })
      .boundingBox();

    expect(firstWorkTitleBox?.width ?? 0).toBeGreaterThan(120);
    await expectNoHorizontalOverflow(page);

    await expectPageHealthy(page, problems);
  });
});
