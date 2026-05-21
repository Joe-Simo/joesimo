import { expect, test } from "@playwright/test";

import {
  blockHeavyMedia,
  collectConsoleProblems,
  expectHomeDestinationLink,
  expectHomeDestinationSection,
  expectInteractiveTextFits,
  expectNoHorizontalOverflow,
  expectPageHealthy,
} from "./helpers";

test.describe("Joe Simo mobile homepage navigation", () => {
  test("mobile keeps primary destinations tappable without overflow or scroll trapping", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const photosLink = await expectHomeDestinationLink(page, "photos");
    const workLink = await expectHomeDestinationLink(page, "work");

    await expectNoHorizontalOverflow(page);
    await expectInteractiveTextFits(page);

    await page.evaluate(() => window.scrollTo(0, 0));
    const startingScrollY = await page.evaluate(() => window.scrollY);
    await page.evaluate(() => window.scrollBy(0, 120));
    await expect
      .poll(() => page.evaluate((start) => window.scrollY > start, startingScrollY))
      .toBe(true);

    await photosLink.click();
    await expect(page).toHaveURL(/#photos$/);

    const photosSection = await expectHomeDestinationSection(page, "photos");
    await expect(photosSection).toBeInViewport();
    await expectNoHorizontalOverflow(page);

    await page.goto("/#blog", { waitUntil: "domcontentloaded" });
    const blogSection = await expectHomeDestinationSection(page, "blog");
    await expect(blogSection).toBeInViewport();

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await workLink.click();
    await expect(page).toHaveURL(/#(work|portfolio)$/);

    const workSection = await expectHomeDestinationSection(page, "work");
    await expect(workSection).toBeInViewport();
    await expect(workSection.locator('a[href^="/work/"]')).toHaveCount(0);
    await expect(
      workSection.getByRole("heading", { name: "sim0" }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await expectPageHealthy(page, problems);
  });
});
