import { expect, type Locator, type Page, test } from "@playwright/test";

import {
  collectConsoleProblems,
  expectHomeDestinationLink,
  expectHomeDestinationSection,
  expectPageHealthy,
  expectProjectMediaFramesContained,
  expectRenderedImagesHealthy,
  workRoutes,
} from "./helpers";

async function expectHeroNameParticlesReady(page: Page) {
  const field = page.locator(".joe-name-particles");
  const canvas = field.locator("canvas");

  await expect(field).toHaveAttribute("data-particles-ready", "true", {
    timeout: 20_000,
  });
  await expect(canvas).toHaveCount(1);
  await expect(canvas).toBeVisible();

  const canvasBox = await canvas.boundingBox();

  expect(canvasBox?.width ?? 0).toBeGreaterThan(120);
  expect(canvasBox?.height ?? 0).toBeGreaterThan(60);
}

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
    const remotePetAssetRequests: string[] = [];

    page.on("request", (request) => {
      const url = request.url();

      if (/github(?:usercontent)?\.com/i.test(url) && /joe-simo-pet/i.test(url)) {
        remotePetAssetRequests.push(url);
      }
    });

    await page.goto("/");

    await expect(page).toHaveTitle(/Joe Simo/);
    await expect(
      page.getByRole("heading", { level: 1, name: /Joe Simo/i }),
    ).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(
      page.getByText("React / Next.js / TypeScript / JavaScript"),
    ).toBeVisible();
    await expect(page.locator(".joe-identity-field")).toHaveCount(0);
    await expectHeroNameParticlesReady(page);
    expect(remotePetAssetRequests).toEqual([]);
    await expectHomeDestinationLink(page, "work");
    await expectHomeDestinationLink(page, "contact");
    await expect(page.locator(".joe-hero")).toBeVisible();
    await expect(page.locator(".joe-hero a")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Open jump menu" })).toHaveCount(0);
    await expect(page.locator(".joe-signal-field")).toHaveCount(0);
    await expect(page.locator(".simo-public-trail-canvas")).toHaveCount(0);
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
    expect(pageText).not.toMatch(/\bYouTube\b/i);
    expect(pageText).not.toMatch(/\bID (#|\w)/i);
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
    await expectHomeDestinationLink(page, "contact");

    const viewport = page.viewportSize();

    if (viewport && viewport.width >= 1024) {
      await expect(page.locator('header a[href="#blog"]')).toHaveCount(0);
    }

    await page.goto("/#credentials", { waitUntil: "domcontentloaded" });
    await expectHomeDestinationSection(page, "credentials");
    await expect(
      page.getByRole("heading", { exact: true, name: "Credentials" }),
    ).toBeVisible();
    await expect(page.getByText("Web / Vercel / SEO", { exact: true })).toBeVisible();
    const credentialSection = page.locator("#credentials");
    const educationGroup = credentialSection.locator(".joe-education-list");
    const credentialGroups = credentialSection.locator(
      ".joe-credential-list .joe-proof-group",
    );

    await credentialGroups.nth(0).locator("summary").click();
    await expect(page.getByText("Next.js App Router Fundamentals")).toBeVisible();
    await expect(page.getByText("PPC Fundamentals Exam")).toBeVisible();
    await expect(page.getByText("Role of Content Exam")).toBeVisible();
    await expect(page.getByText("Systems & Networking")).toBeVisible();

    await educationGroup.locator("summary").click();
    await expect(page.getByText("CCNA 1, IT")).toBeVisible();
    await expect(page.getByText("CCNA 4, IT")).toBeVisible();
    await expect(page.getByText("IT 1, IT")).toBeVisible();
    await expect(page.getByText("IT 2, IT")).toBeVisible();
    await expect(page.getByText("Vendor Tools", { exact: true })).toBeVisible();
    await expect(page.getByText("Drone Operations", { exact: true })).toBeVisible();

    await credentialGroups.nth(3).locator("summary").click();
    await expect(
      page.getByText("Part 107 Small Unmanned Aircraft Systems Recurrent"),
    ).toBeVisible();
    await expect(
      page.getByText("Commercial Drone Pilot: CFR Part 107 Explained"),
    ).toBeVisible();

    await page.goto("/", { waitUntil: "domcontentloaded" });
    const currentWorkLink = await expectHomeDestinationLink(page, "work");

    await currentWorkLink.click();
    const workSection = await expectHomeDestinationSection(page, "work");
    await expect(workSection.locator('a[href^="/work/"]')).toHaveCount(0);
    await expect(
      workSection.getByRole("heading", { name: "Love Presentation" }),
    ).toBeVisible();
    await expect(
      workSection.getByRole("heading", { exact: true, name: "sim0" }),
    ).toBeVisible();
    const workStartLabels = await workSection
      .locator(".joe-work-meta")
      .evaluateAll((items) =>
        items.map((item) => item.textContent?.replace(/\s+/g, " ").trim()),
      );

    expect(
      workStartLabels.filter((label) => label?.includes("May 2026")),
    ).toHaveLength(2);
    expect(workStartLabels.some((label) => label?.includes("Sep 2025"))).toBe(
      true,
    );

    const workHeadings = await workSection
      .locator(".joe-work-table article h3")
      .evaluateAll((headings) =>
        headings.map((heading) => heading.textContent?.trim()),
      );

    expect(workHeadings).toEqual([
      "Love Presentation",
      "garden0",
      "Astrosimo",
      "ChessLM",
      "sim0",
      "Next Flights",
    ]);
    const workNumbers = await workSection
      .locator(".joe-work-index")
      .evaluateAll((items) => items.map((item) => item.textContent?.trim()));

    expect(workNumbers).toEqual(["01", "02", "03", "04", "05", "06"]);

    const systemsSection = await expectHomeDestinationSection(page, "systems");

    await expect(systemsSection.getByText("Macromedica Dominicana")).toBeVisible();
    await expect(systemsSection.getByText("Never Off Technology")).toBeVisible();
    await expect(systemsSection.getByText("Brox Industries")).toBeVisible();
    await expect(systemsSection.getByText("Disaster Recovery Engineer")).toBeVisible();
    await expect(systemsSection.getByText("IT Systems Administrator")).toBeVisible();

    await page.goto("/#community", { waitUntil: "domcontentloaded" });
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

    await page.goto("/#blog", { waitUntil: "domcontentloaded" });
    await expectHomeDestinationSection(page, "blog");
    await expect(
      page.getByRole("heading", { exact: true, name: "Blog" }),
    ).toBeVisible();
    await expect(page.getByText("Short writing")).toBeVisible();

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
    await expect(
      page.locator("#contact").getByRole("link", { name: /Instagram/i }),
    ).toBeVisible();
    const contactLinks = await page
      .locator("#contact .joe-contact-actions a")
      .evaluateAll((links) =>
        links.map((link) => link.getAttribute("href")),
      );

    expect(contactLinks).toEqual([
      "https://x.com/joesimo",
      "https://github.com/Joe-Simo",
      "https://www.linkedin.com/in/josephsimo/",
      "https://www.instagram.com/joesimo_/",
    ]);
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
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator(".simo-command-nav")).toHaveCount(0);
    await expect(page.locator(".joe-hero a")).toHaveCount(0);

    const workLink = await expectHomeDestinationLink(page, "work");
    const contactLink = await expectHomeDestinationLink(page, "contact");

    await workLink.click();
    await expect(page).toHaveURL(/#work$/);
    await expect(page.locator("#work")).toBeVisible();
    await contactLink.click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.locator("#contact")).toBeVisible();

    await expectPageHealthy(page, problems);
  });

  test("switches visible homepage copy between English and Spanish", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute(
      "data-portfolio-runtime",
      "ready",
    );

    await expect(page.getByText("Designer/developer, FL.")).toBeVisible();
    await page.getByRole("button", { name: /language:/i }).click();
    await page.getByRole("menuitemradio", { name: "Español" }).click();

    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(page.getByText("Diseñador/desarrollador, FL.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Trabajo" }).first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Credenciales" }),
    ).toBeVisible();

    await page.getByRole("button", { name: /language:|idioma:/i }).click();
    await page.getByRole("menuitemradio", { name: "English" }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByText("Designer/developer, FL.")).toBeVisible();

    await expectPageHealthy(page, problems);
  });

  test("ignores malformed hash fragments without runtime errors", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await page.goto("/#foo%5B", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { level: 1, name: /Joe Simo/i })).toBeVisible();
    await expectPageHealthy(page, problems);
  });

  test("opens project artifacts and note panels without leaving the page", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await page.goto("/#work", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute(
      "data-portfolio-runtime",
      "ready",
    );

    const projectRow = page.locator("#work-love-presentation");

    await expect(projectRow.getByRole("heading", { name: "Love Presentation" })).toBeVisible();
    await projectRow.getByRole("button", { name: /view details/i }).click();

    const projectDialog = page.getByRole("dialog", { name: /Love Presentation/i });

    await expect(projectDialog).toBeVisible();
    await expect(projectDialog.getByText(/Role/i)).toBeVisible();
    await expectFocusTrappedInDialog(page, projectDialog);
    await page.keyboard.press("Escape");
    await expect(projectDialog).toHaveCount(0);
    await expect(projectRow.getByRole("button", { name: /view details/i })).toBeFocused();
    await expect(page.locator("#community").getByRole("button")).toHaveCount(0);

    await expectPageHealthy(page, problems);
  });

  test("keeps page media monochrome until interaction", async ({ page }) => {
    test.skip(
      test.info().project.name.includes("mobile"),
      "Hover color reveal is a desktop interaction.",
    );
    const problems = collectConsoleProblems(page);

    await page.goto("/", { waitUntil: "domcontentloaded" });

    const workRow = page.locator("#work-sim0");
    const workImage = workRow.locator(".joe-cover-image").first();

    await workRow.evaluate((row) =>
      row.scrollIntoView({ behavior: "instant", block: "center" }),
    );
    await page.waitForTimeout(120);

    await expect(workImage).toBeVisible();
    await expect
      .poll(() => workImage.evaluate((image) => getComputedStyle(image).filter))
      .toMatch(/grayscale\((1|100%)\)/);

    await workRow.hover();
    await expect
      .poll(() => workImage.evaluate((image) => getComputedStyle(image).filter))
      .not.toMatch(/grayscale\((1|100%)\)/);

    await workRow.getByRole("button", { name: /view details/i }).click();

    const dialog = page.getByRole("dialog", { name: /sim0/i });
    const dialogImage = dialog.locator(".joe-dialog-media .joe-cover-image").first();

    await expect(dialog).toBeVisible();
    await expect(dialogImage).toBeVisible();
    await expect
      .poll(() =>
        dialogImage.evaluate((image) => getComputedStyle(image).filter),
      )
      .not.toMatch(/grayscale\((1|100%)\)/);

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expectPageHealthy(page, problems);
  });

  test("names each project details control with its project context", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await page.goto("/#work", { waitUntil: "domcontentloaded" });

    const detailButtonNames = [
      "View details for Love Presentation",
      "View details for garden0",
      "View details for Astrosimo",
      "View details for ChessLM",
      "View details for sim0",
      "View details for Next Flights",
    ];

    for (const name of detailButtonNames) {
      await expect(page.getByRole("button", { name })).toBeVisible();
    }

    await expect(page.locator("[data-project-open]")).toHaveCount(
      detailButtonNames.length,
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

    const homeResponse = await request.get("/");
    const homeHtml = await homeResponse.text();
    const contentSecurityPolicy =
      homeResponse.headers()["content-security-policy"];

    expect(contentSecurityPolicy).toContain("default-src 'self'");
    expect(contentSecurityPolicy).toContain("frame-ancestors 'none'");
    expect(contentSecurityPolicy).toMatch(/script-src[^;]*'nonce-[^']+'/);

    for (const route of workRoutes) {
      const slug = route.path.replace("/work/", "");
      const workAnchor = `#work-${slug}`;

      if (route.visibleOnHome) {
        expect(homeHtml, workAnchor).toContain(workAnchor);
      } else {
        expect(homeHtml, workAnchor).not.toContain(workAnchor);
      }
    }

    const blogResponse = await request.get("/blog", { maxRedirects: 0 });
    expect([307, 308]).toContain(blogResponse.status());
    expect(blogResponse.headers().location).toContain("/#blog");

    for (const route of workRoutes) {
      const response = await request.get(route.path, { maxRedirects: 0 });
      const slug = route.path.replace("/work/", "");
      const expectedLocation = route.visibleOnHome ? `/#work-${slug}` : "/#work";

      expect(response.status(), route.path).toBe(308);
      expect(response.headers().location).toContain(expectedLocation);
    }

    const missingResponse = await request.get("/missing-route");
    expect(missingResponse.status()).toBe(404);
  });
});
