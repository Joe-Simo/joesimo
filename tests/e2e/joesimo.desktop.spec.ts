import { expect, test } from "@playwright/test";

import {
  blockHeavyMedia,
  collectConsoleProblems,
  expectHomeDestinationLink,
  expectHomeDestinationSection,
  expectPageHealthy,
} from "./helpers";

test.describe("Joe Simo desktop homepage navigation", () => {
  test("desktop supports keyboard navigation between primary home destinations", async ({
    page,
  }) => {
    test.setTimeout(60_000);

    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { level: 1, name: /Joe Simo/i }),
    ).toBeVisible();
    await expect(page.locator(".simo-trail-hero")).toBeVisible();
    await expect(
      page.locator('.simo-trail-hero a[href^="/work/"]'),
    ).toHaveCount(0);

    await expectHomeDestinationLink(page, "work");
    const photosLink = await expectHomeDestinationLink(page, "photos");

    await photosLink.click();
    await expect(page).toHaveURL(/#photos$/);

    const photosSection = await expectHomeDestinationSection(page, "photos");
    await expect(photosSection).toBeInViewport();
    await expect(page.locator('header a[href="#photos"]').first()).toHaveAttribute(
      "aria-current",
      "location",
    );

    const blogLink = page.locator('header a[href="#blog"]').first();

    await blogLink.click();
    await expect(page).toHaveURL(/#blog$/);

    const blogSection = await expectHomeDestinationSection(page, "blog");
    await expect(blogSection).toBeInViewport();
    await expect(blogLink).toHaveAttribute("aria-current", "location");

    await page.goto("/", { waitUntil: "domcontentloaded" });
    const workLink = await expectHomeDestinationLink(page, "work");

    await workLink.click();
    await expect(page).toHaveURL(/#(work|portfolio)$/);

    const workSection = await expectHomeDestinationSection(page, "work");
    await expect(workSection).toBeInViewport();
    await expect(workSection.locator('a[href^="/work/"]')).toHaveCount(0);
    await expect(
      workSection.getByRole("heading", { name: "sim0" }),
    ).toBeVisible();

    await expectPageHealthy(page, problems);
  });
});
