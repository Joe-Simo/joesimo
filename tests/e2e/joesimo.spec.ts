import { expect, type Locator, type Page, test } from "@playwright/test";

import {
  collectConsoleProblems,
  expectHomeDestinationLink,
  expectHomeDestinationSection,
  expectJoeSignalFieldReady,
  expectPageHealthy,
  expectProjectMediaFramesContained,
  expectRenderedImagesHealthy,
  workRoutes,
} from "./helpers";

async function expectFocusTrappedInDialog(page: Page, dialog: Locator) {
  const backgroundFocus = page.locator("header :focus, main :focus, footer :focus");

  for (const key of ["Tab", "Tab", "Shift+Tab"]) {
    await page.keyboard.press(key);
    await expect(dialog).toBeVisible();
    await expect
      .poll(() =>
        dialog.evaluate((dialogElement) => {
          const activeElement = document.activeElement;

          if (!(activeElement instanceof HTMLElement)) {
            return "contained";
          }

          if (dialogElement.contains(activeElement)) {
            return "contained";
          }

          return activeElement.closest("header, main, footer")
            ? "escaped"
            : "contained";
        }),
      )
      .toBe("contained");
    await expect(backgroundFocus).toHaveCount(0);
  }

  await expect(dialog.locator(":focus")).toHaveCount(1);
}

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
    await expectHomeDestinationLink(page, "systems");
    await expectHomeDestinationLink(page, "credentials");
    await expectHomeDestinationLink(page, "community");
    await expect(page.locator(".joe-hero")).toBeVisible();
    await expect(page.locator(".simo-public-trail-canvas")).toHaveCount(0);
    await expectJoeSignalFieldReady(page);
    await expect(page.locator("#work")).toBeVisible();
    await expect(page.locator("#systems")).toBeVisible();
    await expect(page.locator("#credentials")).toBeVisible();
    await expect(page.locator("#community")).toBeVisible();
    await expect(page.locator("#contact")).toBeVisible();

    await expectPageHealthy(page, problems);
  });

  test("keeps public copy clean and free of local paths", async ({ page }) => {
    const problems = collectConsoleProblems(page);

    await page.goto("/");

    const pageText = await page.locator("body").innerText();

    expect(pageText).not.toMatch(
      /Operated sim0 case|Run The Case|placeholder|fake|scraped|awwwards|site of the year|AI-native|public trail|famous developers|Three\.js|GSAP|WebGL|proof route|owned frames|readable product surface/i,
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
    test.setTimeout(180_000);

    const problems = collectConsoleProblems(page);

    await page.goto("/");

    await expectHomeDestinationLink(page, "work");
    await expectHomeDestinationLink(page, "community");

    await page.goto("/#credentials", { waitUntil: "domcontentloaded" });
    await expectHomeDestinationSection(page, "credentials");
    await expect(
      page.getByRole("heading", { exact: true, name: "Credentials" }),
    ).toBeVisible();
    await expect(page.getByText("Web", { exact: true })).toBeVisible();
    await expect(page.getByText("Systems & Networking")).toBeVisible();
    await expect(page.getByText("Vendor Tools", { exact: true })).toBeVisible();
    await expect(page.getByText("Drone Operations", { exact: true })).toBeVisible();

    await page.goto("/", { waitUntil: "domcontentloaded" });
    const currentWorkLink = await expectHomeDestinationLink(page, "work");

    await currentWorkLink.click();
    const workSection = await expectHomeDestinationSection(page, "work");
    await expect(workSection.locator('a[href^="/work/"]')).toHaveCount(0);
    await expect(
      workSection.getByRole("heading", { name: "sim0" }),
    ).toBeVisible();

    const systemsSection = await expectHomeDestinationSection(page, "systems");

    await expect(systemsSection.getByText("Macromedica")).toBeVisible();
    await expect(systemsSection.getByText("Neveroff Technology")).toBeVisible();
    await expect(systemsSection.getByText("Brox Industries")).toBeVisible();
    await expect(systemsSection.getByText("Disaster Recovery Engineer")).toBeVisible();

    const currentCommunityLink = await expectHomeDestinationLink(
      page,
      "community",
    );

    await currentCommunityLink.click();
    await expect(page).toHaveURL(/#community$/);
    await expectHomeDestinationSection(page, "community");
    await expect(
      page.getByRole("heading", {
        name: "Community",
      }),
    ).toBeVisible();
    await expect(page.getByText("With ThePrimeagen at React Miami 2026.")).toBeVisible();
    await expect(
      page.locator("#community").getByRole("img", {
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

    await expect(footerContactLink).toHaveAttribute("href", "#contact");
    await footerContactLink.scrollIntoViewIfNeeded();
    await footerContactLink.click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(
      page.getByRole("heading", { name: "Contact" }),
    ).toBeVisible();
    await expect(page.locator("#contact")).toBeInViewport();
    await expect(page.locator("#contact-title")).toBeInViewport();

    const pageText = await page.locator("body").innerText();
    expect(pageText).not.toMatch(
      /YC|Y Combinator|equity|fundraising|Response ID|API key|\/Users\/|Downloads\//i,
    );

    await expectPageHealthy(page, problems);
  });

  test("keeps the home header minimal and preserves anchor navigation", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await page.goto("/");

    await expect(page.getByRole("button", { name: "Open jump menu" })).toHaveCount(0);
    const communityLink = await expectHomeDestinationLink(page, "community");

    await communityLink.click();
    await expect(page).toHaveURL(/#community$/);
    await expect(page.locator("#community")).toBeVisible();

    await expectPageHealthy(page, problems);
  });

  test("opens project artifacts and note panels without leaving the page", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await page.goto("/#work", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute(
      "data-trail-runtime",
      "ready",
    );

    const sim0Card = page.locator("#work-sim0");

    await expect(sim0Card.getByRole("heading", { name: "sim0" })).toBeVisible();
    await sim0Card.getByRole("button", { name: /view details/i }).click();

    const projectDialog = page.getByRole("dialog", { name: /sim0/i });

    await expect(projectDialog).toBeVisible();
    await expect(projectDialog.getByText(/Role/i)).toBeVisible();
    await expectFocusTrappedInDialog(page, projectDialog);
    await page.keyboard.press("Escape");
    await expect(projectDialog).toHaveCount(0);
    await expect(sim0Card.getByRole("button", { name: /view details/i })).toBeFocused();
    await expect(page.locator("#community").getByRole("button")).toHaveCount(0);

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
    expect(blogResponse.headers().location).toContain("/#community");

    for (const route of workRoutes) {
      const response = await request.get(route.path, { maxRedirects: 0 });

      expect(response.status(), route.path).toBe(308);
      expect(response.headers().location).toContain("/#work");
    }

    const missingResponse = await request.get("/missing-route");
    expect(missingResponse.status()).toBe(404);
  });
});
