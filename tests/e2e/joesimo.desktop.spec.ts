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
    await expect(
      page.locator('.joe-hero a[href^="/work/"]'),
    ).toHaveCount(0);

    await expectHomeDestinationLink(page, "work");
    const communityLink = await expectHomeDestinationLink(page, "community");

    await communityLink.click();
    await expect(page).toHaveURL(/#community$/);

    const communitySection = await expectHomeDestinationSection(
      page,
      "community",
    );
    await expect(communitySection).toBeInViewport();
    await expect(
      page.locator('header a[href="#community"]').first(),
    ).toHaveAttribute("aria-current", "location");

    const credentialsLink = page.locator('header a[href="#credentials"]').first();

    await credentialsLink.click();
    await expect(page).toHaveURL(/#credentials$/);

    const credentialsSection = await expectHomeDestinationSection(
      page,
      "credentials",
    );
    await expect(credentialsSection).toBeInViewport();
    await expect(credentialsLink).toHaveAttribute("aria-current", "location");

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
