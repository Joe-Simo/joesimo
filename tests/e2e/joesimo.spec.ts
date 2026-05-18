import { expect, test } from "@playwright/test";

import {
  collectConsoleProblems,
  expectPageHealthy,
  workRoutes,
} from "./helpers";

test.describe("Joe Simo personal site", () => {
  test("renders a Joe-first home page without duplicate portraits", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await page.goto("/");

    await expect(page).toHaveTitle(/Joe Simo/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Joe Simo" }),
    ).toBeVisible();
    await expect(
      page.getByText("I turn stuck workflows into interfaces people can operate."),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /portfolio/i }).first(),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /blog/i }).first()).toBeVisible();
    const portraitImage = page.locator(
      'img[src*="joe-simo-headshot"], img[srcset*="joe-simo-headshot"]',
    );

    await expect(portraitImage).toHaveCount(1);
    await expect
      .poll(async () =>
        portraitImage.evaluateAll((images) =>
          images.filter((image) => image.getClientRects().length > 0).length,
        ),
      )
      .toBeLessThanOrEqual(1);

    const loadedPortrait = await page.evaluate(() => {
      const portrait = document.querySelector(
        'img[src*="joe-simo-headshot"], img[srcset*="joe-simo-headshot"]',
      ) as HTMLImageElement | null;

      return (
        !!portrait &&
        portrait.getClientRects().length > 0 &&
        portrait.complete &&
        portrait.naturalWidth > 0
      );
    });

    expect(loadedPortrait).toBe(true);

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

  test("renders portfolio and blog as the only main homepage destinations", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await page.goto("/");

    await expect(page.getByRole("link", { name: /01 portfolio/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /02 blog/i })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Selected work, ordered by proof." }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Short notes from the way Joe thinks." }),
    ).toBeVisible();
    await expect(
      page.locator("footer").getByRole("link", { name: "GitHub" }),
    ).toBeVisible();
    await expect(
      page.locator("footer").getByRole("link", { name: "Email" }),
    ).toHaveCount(0);

    const pageText = await page.locator("body").innerText();
    expect(pageText).not.toMatch(
      /YC|Y Combinator|equity|fundraising|Response ID|API key|\/Users\/|Downloads\//i,
    );
    expect(pageText).not.toContain("Contact");

    await expectPageHealthy(page, problems);
  });

  test("serves the public route surface", async ({ request }) => {
    const okRoutes = [
      "/",
      ...workRoutes.map((route) => route.path),
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

    const missingResponse = await request.get("/missing-route");
    expect(missingResponse.status()).toBe(404);
  });

  for (const route of workRoutes) {
    test(`work case renders cleanly: ${route.heading}`, async ({ page }) => {
      const problems = collectConsoleProblems(page);

      await page.goto(route.path);

      await expect(
        page.getByRole("heading", { level: 1, name: route.heading }),
      ).toBeVisible();
      await expect(page.locator("footer a").first()).toHaveAttribute(
        "href",
        "/#joe",
      );

      const videos = await page.locator("video").evaluateAll((items) =>
        items.map((item) => {
          const video = item as HTMLVideoElement;

          return {
            autoplay: video.autoplay,
            controls: video.controls,
            loop: video.loop,
          };
        }),
      );

      for (const video of videos) {
        expect(video.autoplay).toBe(false);
        expect(video.loop).toBe(false);
        expect(video.controls).toBe(true);
      }

      await expectPageHealthy(page, problems);
    });
  }
});
