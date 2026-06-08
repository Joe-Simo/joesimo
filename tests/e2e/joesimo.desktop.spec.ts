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
    await expect(page.locator(".joe-hero")).toBeVisible();
    await expect(page.locator(".joe-hero-metadata")).toHaveCount(0);
    await expect(page.locator(".joe-hero-work")).toHaveCount(0);
    await expect(
      page.locator('.joe-hero a[href^="/work/"]'),
    ).toHaveCount(0);

    await expectHomeDestinationLink(page, "work");

    await page.goto("/#community", { waitUntil: "domcontentloaded" });

    const communitySection = await expectHomeDestinationSection(
      page,
      "community",
    );
    await expect(communitySection).toBeInViewport();
    const firstCommunityImage = communitySection
      .locator(".joe-photo-frame img")
      .first();

    await expect(firstCommunityImage).toHaveAttribute("loading", "lazy");
    await expect(firstCommunityImage).not.toHaveAttribute("fetchpriority", "high");
    await expect(
      page.locator(
        'link[rel="preload"][as="image"][imagesrcset*="media%2Fcommunity"]',
      ),
    ).toHaveCount(0);

    await page.goto("/#credentials", { waitUntil: "domcontentloaded" });

    const credentialsSection = await expectHomeDestinationSection(
      page,
      "credentials",
    );
    await expect(credentialsSection).toBeInViewport();
    await expect(
      credentialsSection.locator(".joe-certification-grid"),
    ).toBeVisible();
    await expect(
      credentialsSection.locator(".joe-certification-tile"),
    ).toHaveCount(27);
    await expect(
      credentialsSection.locator(".joe-certification-mark-image"),
    ).toHaveCount(27);
    await expect(
      credentialsSection.locator(".joe-certification-badge-image"),
    ).toHaveCount(7);
    await expect(
      credentialsSection.locator(".joe-certification-name"),
    ).toHaveCount(27);
    await expect(
      credentialsSection.locator(".joe-certification-company-logo"),
    ).toHaveCount(20);
    await expect(
      credentialsSection.getByText("Next.js App Router Fundamentals"),
    ).toBeVisible();

    await page.goto("/", { waitUntil: "domcontentloaded" });
    const workLink = await expectHomeDestinationLink(page, "work");

    await workLink.click();
    await expect(page).toHaveURL(/#(work|portfolio)$/);

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
      workSection.locator('.joe-github-card[data-visibility="public"]'),
    ).toHaveCount(5);
    await expect(
      workSection.locator('article.joe-github-card[data-visibility="private"]'),
    ).toHaveCount(0);
    await expect(workSection.locator(".joe-product-card")).toHaveCount(4);
    await expect(
      workSection.locator('a[href="https://astrosimo.com"]'),
    ).toBeVisible();

    await expectPageHealthy(page, problems);
  });
});
