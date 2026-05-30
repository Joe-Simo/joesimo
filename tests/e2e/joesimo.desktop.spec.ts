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

    await expect(firstCommunityImage).toHaveAttribute("loading", "eager");
    await expect(firstCommunityImage).toHaveAttribute("fetchpriority", "high");

    await page.goto("/#credentials", { waitUntil: "domcontentloaded" });

    const credentialsSection = await expectHomeDestinationSection(
      page,
      "credentials",
    );
    await expect(credentialsSection).toBeInViewport();

    await page.goto("/", { waitUntil: "domcontentloaded" });
    const workLink = await expectHomeDestinationLink(page, "work");

    await workLink.click();
    await expect(page).toHaveURL(/#(work|portfolio)$/);

    const workSection = await expectHomeDestinationSection(page, "work");
    await expect(workSection).toBeInViewport();
    await expect(workSection.locator('a[href^="/work/"]')).toHaveCount(0);
    await expect(
      workSection.getByRole("heading", { exact: true, name: "sim0" }),
    ).toBeVisible();
    await expect(
      workSection.getByRole("heading", { name: "Love Presentation" }),
    ).toBeVisible();
    const firstWorkImage = workSection.locator(".joe-work-thumb img").first();

    await expect(firstWorkImage).toHaveAttribute("loading", "eager");
    await expect(firstWorkImage).toHaveAttribute("fetchpriority", "high");

    const thumbMetrics = await workSection
      .locator(".joe-work-thumb img")
      .evaluateAll((images) =>
        images.map((image) => {
          const rect = image.getBoundingClientRect();
          const img = image as HTMLImageElement;

          return {
            height: Math.round(rect.height),
            naturalHeight: img.naturalHeight,
            naturalWidth: img.naturalWidth,
            width: Math.round(rect.width),
          };
        }),
      );

    expect(thumbMetrics).toHaveLength(6);
    expect(new Set(thumbMetrics.map((metric) => metric.width)).size).toBe(1);
    expect(new Set(thumbMetrics.map((metric) => metric.height)).size).toBe(1);

    for (const metric of thumbMetrics) {
      expect(metric.naturalWidth).toBeGreaterThan(0);
      expect(metric.naturalHeight).toBeGreaterThan(0);
      expect(metric.width / metric.height).toBeCloseTo(16 / 9, 1);
    }

    await expectPageHealthy(page, problems);
  });
});
