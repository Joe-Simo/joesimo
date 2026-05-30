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

    const communityLink = await expectHomeDestinationLink(page, "community");
    const workLink = await expectHomeDestinationLink(page, "work");

    await expectNoHorizontalOverflow(page);
    await expectInteractiveTextFits(page);
    await expect(page.locator(".joe-hero-metadata")).toHaveCount(0);
    await expect(page.locator(".joe-hero-work")).toHaveCount(0);

    await page.evaluate(() => window.scrollTo(0, 0));
    const startingScrollY = await page.evaluate(() => window.scrollY);
    await page.evaluate(() => window.scrollBy(0, 120));
    await expect
      .poll(() => page.evaluate((start) => window.scrollY > start, startingScrollY))
      .toBe(true);

    await communityLink.click();
    await expect(page).toHaveURL(/#community$/);

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

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await workLink.click();
    await expect(page).toHaveURL(/#(work|portfolio)$/);

    const workSection = await expectHomeDestinationSection(page, "work");
    await expect(workSection).toBeInViewport();
    await expect(workSection.locator('a[href^="/work/"]')).toHaveCount(0);
    await expect(workSection.locator(".joe-work-thumb").first()).toBeVisible();
    await expect(
      workSection.getByRole("heading", { exact: true, name: "sim0" }),
    ).toBeVisible();
    await expect(
      workSection.getByRole("heading", { name: "Love Presentation" }),
    ).toBeVisible();

    const firstWorkTitleBox = await workSection
      .getByRole("heading", { name: "Love Presentation" })
      .boundingBox();

    expect(firstWorkTitleBox?.width ?? 0).toBeGreaterThan(120);
    await expectNoHorizontalOverflow(page);

    await expectPageHealthy(page, problems);
  });
});
