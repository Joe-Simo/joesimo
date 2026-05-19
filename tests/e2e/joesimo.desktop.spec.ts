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
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { level: 1, name: /Joe Simo/i }),
    ).toBeVisible();
    await expect(page.locator(".simo-index-hero")).not.toContainText("sim0");
    await expect(
      page.locator('.simo-index-hero a[href^="/work/"]'),
    ).toHaveCount(0);

    await expectHomeDestinationLink(page, "work");
    const blogLink = await expectHomeDestinationLink(page, "blog");

    await blogLink.click();
    await expect(page).toHaveURL(/(#blog|\/blog)$/);

    const blogSection = await expectHomeDestinationSection(page, "blog");
    await expect(blogSection).toBeInViewport();

    await page.goto("/", { waitUntil: "domcontentloaded" });
    const workLink = await expectHomeDestinationLink(page, "work");

    await workLink.click();
    await expect(page).toHaveURL(/#(work|portfolio)$/);

    const workSection = await expectHomeDestinationSection(page, "work");
    await expect(workSection).toBeInViewport();
    await expect(workSection.locator('a[href^="/work/"]').first()).toBeVisible();

    await expectPageHealthy(page, problems);
  });
});
