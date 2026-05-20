import { expect, test } from "@playwright/test";

import {
  collectConsoleProblems,
  expectHomeDestinationLink,
  expectHomeDestinationSection,
  expectPageHealthy,
  expectProjectMediaFramesContained,
  expectRenderedImagesHealthy,
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
    await expectHomeDestinationLink(page, "method");
    await expectHomeDestinationLink(page, "work");
    await expect(page.locator("#method")).toBeVisible();
    await expect(page.locator("#people")).toBeVisible();
    await expect(page.locator("#contact")).toBeVisible();

    await expectPageHealthy(page, problems);
  });

  test("keeps public copy clean and free of local paths", async ({ page }) => {
    const problems = collectConsoleProblems(page);

    await page.goto("/");

    const pageText = await page.locator("body").innerText();

    expect(pageText).not.toMatch(
      /Operated sim0 case|Run The Case|placeholder|fake|scraped|awwwards|site of the year/i,
    );
    const privateMessageAction = ["Email", "Joe"].join(" ");
    const privateMessageHandlePrefix = ["hello", "@"].join("");

    expect(pageText).not.toContain(privateMessageAction);
    expect(pageText).not.toContain(privateMessageHandlePrefix);
    expect(pageText).not.toContain("/Users/");
    expect(pageText).not.toContain("Downloads/");
    const privateMessageScheme = ["mail", "to:"].join("");
    const privateMessageLinks = await page.locator("a").evaluateAll(
      (links, scheme) =>
        links.filter((link) =>
          link.getAttribute("href")?.startsWith(scheme),
        ).length,
      privateMessageScheme,
    );

    expect(privateMessageLinks).toBe(0);
    await expectPageHealthy(page, problems);
  });

  test("renders visible one-page chapters and anchor destinations", async ({
    page,
  }) => {
    test.setTimeout(60_000);

    const problems = collectConsoleProblems(page);

    await page.goto("/");

    const methodLink = await expectHomeDestinationLink(page, "method");
    const workLink = await expectHomeDestinationLink(page, "work");

    await methodLink.click();
    await expectHomeDestinationSection(page, "method");
    await expect(page.locator("#method-title")).toContainText("Support");
    await expect(page.locator("#method-title")).toContainText("Signals");
    await expect(page.locator("#method-title")).toContainText("Surface");

    await page.goto("/#blog", { waitUntil: "domcontentloaded" });
    await expectHomeDestinationSection(page, "blog");
    await expect(
      page.getByRole("heading", { name: "Notes from the method." }),
    ).toBeVisible();

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await workLink.click();
    const workSection = await expectHomeDestinationSection(page, "work");
    await expect(workSection.locator('a[href^="/work/"]')).toHaveCount(0);
    await expect(
      workSection.getByRole("heading", { name: "sim0" }),
    ).toBeVisible();
    await expect(
      workSection.getByRole("navigation", { name: "Work case index" }),
    ).toBeVisible();
    await workSection
      .getByRole("link", { name: /Astrosimo/i })
      .click();
    await expect(page).toHaveURL(/#work-astrosimo$/);
    await expect
      .poll(async () =>
        page
          .locator("#work-astrosimo")
          .evaluate((element) => Math.round(element.getBoundingClientRect().top)),
      )
      .toBeLessThanOrEqual(120);
    await expect(
      page.getByRole("heading", {
        name: "Builder rooms, not badges.",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Bring the stuck workflow." }),
    ).toBeVisible();
    await expect(
      page.getByRole("img", {
        name: "Joe Simo with ThePrimeagen at React Miami 2026",
      }),
    ).toBeVisible();
    await expectRenderedImagesHealthy(page);
    await expectProjectMediaFramesContained(page);

    await expect(
      page.locator("footer").getByRole("link", { name: /github/i }),
    ).toBeVisible();
    const footerContactLink = page
      .locator("footer")
      .getByRole("link", { name: "Contact" });

    await expect(footerContactLink).toHaveAttribute("href", "/#contact");
    await footerContactLink.scrollIntoViewIfNeeded();
    await footerContactLink.click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(
      page.getByRole("heading", { name: "Bring the stuck workflow." }),
    ).toBeVisible();
    await expect
      .poll(async () =>
        page
          .locator("#contact")
          .evaluate((element) => Math.round(element.getBoundingClientRect().top)),
      )
      .toBeLessThanOrEqual(120);
    await expect
      .poll(async () =>
        page
          .locator("#contact-title")
          .evaluate((element) => Math.round(element.getBoundingClientRect().top)),
      )
      .toBeLessThanOrEqual(260);

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
