import { expect, test } from "@playwright/test";

import {
  collectConsoleProblems,
  expectHomeDestinationLink,
  expectHomeDestinationSection,
  expectPageHealthy,
  workRoutes,
} from "./helpers";

test.describe("Joe Simo personal site", () => {
  test("renders a Joe-first home page with reachable primary destinations", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await page.goto("/");

    await expect(page).toHaveTitle(/Joe Simo/);
    await expect(
      page.getByRole("heading", { level: 1, name: /Joe Simo/i }),
    ).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expectHomeDestinationLink(page, "work");
    await expectHomeDestinationLink(page, "blog");

    await expectPageHealthy(page, problems);
  });

  test("keeps public copy clean and free of local paths", async ({ page }) => {
    const problems = collectConsoleProblems(page);

    await page.goto("/");

    const pageText = await page.locator("body").innerText();

    expect(pageText).not.toMatch(
      /Operated sim0 case|Run The Case|placeholder|fake|scraped|awwwards|site of the year/i,
    );
    expect(pageText).not.toContain("/Users/");
    expect(pageText).not.toContain("Downloads/");
    await expectPageHealthy(page, problems);
  });

  test("renders work and blog as the primary homepage destinations", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await page.goto("/");

    const workLink = await expectHomeDestinationLink(page, "work");
    const blogLink = await expectHomeDestinationLink(page, "blog");

    await blogLink.click();
    await expectHomeDestinationSection(page, "blog");

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await workLink.click();
    const workSection = await expectHomeDestinationSection(page, "work");
    await expect(workSection.locator('a[href^="/work/"]')).toHaveCount(0);
    await expect(
      workSection.getByRole("heading", { name: "sim0" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "People Joe met in the builder room.",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("img", {
        name: "Joe Simo with ThePrimeagen at React Miami 2026",
      }),
    ).toBeVisible();

    await expect(
      page.locator("footer").getByRole("link", { name: /github/i }),
    ).toBeVisible();

    const pageText = await page.locator("body").innerText();
    expect(pageText).not.toMatch(
      /YC|Y Combinator|equity|fundraising|Response ID|API key|\/Users\/|Downloads\//i,
    );

    await expectPageHealthy(page, problems);
  });

  test("serves the public route surface", async ({ request }) => {
    const okRoutes = [
      "/",
      "/robots.txt",
      "/sitemap.xml",
      "/manifest.webmanifest",
      "/opengraph-image",
      "/twitter-image",
    ];

    for (const route of okRoutes) {
      const response = await request.get(route);
      expect(response.status(), route).toBe(200);
    }

    const blogResponse = await request.get("/blog", { maxRedirects: 0 });
    expect([307, 308]).toContain(blogResponse.status());

    for (const route of workRoutes) {
      const response = await request.get(route.path, { maxRedirects: 0 });

      expect(response.status(), route.path).toBe(308);
      expect(response.headers().location).toContain("/#work");
    }

    const missingResponse = await request.get("/missing-route");
    expect(missingResponse.status()).toBe(404);
  });
});
