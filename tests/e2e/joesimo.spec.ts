import { expect, type Locator, type Page, test } from "@playwright/test";

import {
  collectConsoleProblems,
  expectHomeDestinationLink,
  expectHomeDestinationSection,
  expectNoVisibleScrollbar,
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
  await expect(canvas).toHaveCSS("opacity", "1");

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

async function renderedPageText(page: Page) {
  return page.evaluate(() => {
    const bodyClone = document.body.cloneNode(true);

    if (!(bodyClone instanceof HTMLElement)) {
      return "";
    }

    bodyClone.querySelectorAll("script, style").forEach((element) => {
      element.remove();
    });

    return bodyClone.textContent ?? "";
  });
}

const noAssetWorkRouteMetadata = [
  {
    path: "/work/grimgreen-channel-watch",
    title: "GrimmGreen Channel Watch work specimen",
  },
  {
    path: "/work/printer-scripts",
    title: "Printer Scripts work specimen",
  },
] as const;

test.describe("Joe Simo personal site", () => {
  test("renders a Joe-first home page with reachable primary destinations", async ({
    page,
  }) => {
    const isMobile = test.info().project.name.includes("mobile");
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
    if (isMobile) {
      await expect(page.getByRole("button", { name: /open navigation/i })).toBeVisible();
    } else {
      await expectHomeDestinationLink(page, "work");
      await expectHomeDestinationLink(page, "contact");
    }
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

    const isMobile = test.info().project.name.includes("mobile");
    const problems = collectConsoleProblems(page);

    await page.goto("/");

    if (isMobile) {
      await expect(page.getByRole("button", { name: /open navigation/i })).toBeVisible();
    } else {
      await expectHomeDestinationLink(page, "work");
      await expectHomeDestinationLink(page, "contact");
    }

    const viewport = page.viewportSize();

    if (viewport && viewport.width >= 1024) {
      await expect(page.locator('header a[href="/blog"]')).toBeVisible();
    }

    await page.goto("/#credentials", { waitUntil: "domcontentloaded" });
    await expectHomeDestinationSection(page, "credentials");
    await expect(
      page.getByRole("heading", { exact: true, name: "Certifications" }),
    ).toBeVisible();
    await expect(
      page.getByText("Web / Vercel / SEO", { exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByText("Systems & Networking", { exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByText("Vendor Tools", { exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByText("Drone Operations", { exact: true }),
    ).toHaveCount(0);
    const credentialSection = page.locator("#credentials");
    const certificationTiles = credentialSection.locator(
      ".joe-certification-tile",
    );

    await expect(credentialSection.locator(".joe-education-list")).toHaveCount(
      0,
    );
    await expect(credentialSection.locator(".joe-section-head")).toHaveCount(1);
    await expect(
      credentialSection.locator(".joe-certification-grid"),
    ).toBeVisible();
    await expect(
      credentialSection.locator(
        ".joe-certification-meta, .joe-certification-category",
      ),
    ).toHaveCount(0);
    await expect(certificationTiles).toHaveCount(27);
    const badgeImages = credentialSection.locator(
      ".joe-certification-badge-image",
    );

    await expect(badgeImages).toHaveCount(27);
    await expect(
      credentialSection.locator(".joe-certification-name"),
    ).toHaveCount(27);

    for (let index = 0; index < 27; index += 1) {
      await expect
        .poll(() =>
          badgeImages
            .nth(index)
            .evaluate((image) => getComputedStyle(image).filter),
        )
        .toMatch(/grayscale\((1|100%)\)/);
    }

    if (!isMobile) {
      for (let index = 0; index < 27; index += 1) {
        await certificationTiles.nth(index).scrollIntoViewIfNeeded();
        await certificationTiles.nth(index).hover();
        await expect
          .poll(() =>
            badgeImages
              .nth(index)
              .evaluate((image) => getComputedStyle(image).filter),
          )
          .toMatch(/grayscale\(0\)/);
      }
    }
    await expect(
      credentialSection.locator(".joe-certification-company-logo"),
    ).toHaveCount(20);
    await expect(
      credentialSection.getByText("Next.js App Router Fundamentals"),
    ).toBeVisible();
    await expect(
      credentialSection.getByText("PPC Fundamentals Exam"),
    ).toBeVisible();
    await expect(
      credentialSection.getByText("Role of Content Exam"),
    ).toBeVisible();

    await page.goto("/", { waitUntil: "domcontentloaded" });

    if (isMobile) {
      await page.goto("/#work", { waitUntil: "domcontentloaded" });
    } else {
      const currentWorkLink = await expectHomeDestinationLink(page, "work");

      await currentWorkLink.click();
    }

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
      "sim0",
      "garden0",
      "Astrosimo",
      "ChessLM",
      "Love Presentation",
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
    await expect(page.locator("#community-title")).toHaveCount(0);
    await expect(page.locator("#community .joe-section-head")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /pause photos|play photos/i }),
    ).toHaveCount(0);
    await expect(page.locator("#community .joe-photo-marquee")).toBeVisible();
    await expectNoVisibleScrollbar(page.locator("#community .joe-photo-marquee"));
    await expect(page.locator("#community .joe-photo-card")).toHaveCount(12);
    await expect(
      page.locator('#community .joe-photo-marquee-copy[aria-hidden="true"]'),
    ).toHaveCount(1);
    await expect(
      page.locator("#community .joe-photo-marquee-track"),
    ).toHaveCSS("animation-name", "joe-photo-marquee-right");
    await expect(
      page.locator("#community .joe-photo-card figcaption"),
    ).toHaveCount(0);
    await expect(
      page.locator("#community").getByRole("img", {
        name: "Joe Simo with ThePrimeagen at React Miami 2026",
      }),
    ).toBeVisible();
    await expectRenderedImagesHealthy(page);
    await expectProjectMediaFramesContained(page);

    await page.goto("/blog", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/blog$/);
    await expect(
      page.getByRole("heading", { exact: true, name: "Blog" }),
    ).toBeVisible();
    await expect(page.getByText("No public posts yet")).toBeVisible();

    const footer = page.locator("footer");

    await expect(footer.locator("nav")).toHaveCount(0);
    await expect(footer.getByRole("link", { name: /github/i })).toHaveCount(0);
    await expect(footer.getByRole("link", { name: /contact/i })).toHaveCount(0);
    await page.goto("/#contact", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Contact" }),
    ).toHaveCount(0);
    await expect(page.locator("#contact-title")).toHaveCount(0);
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

    const pageText = await page.locator("body").innerText();
    expect(pageText).not.toMatch(
      /YC|Y Combinator|equity|fundraising|Response ID|API key|\/Users\/|Downloads\//i,
    );

    await expectPageHealthy(page, problems);
  });

  test("keeps the community photo rail focused on photos only", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await page.goto("/#community", { waitUntil: "domcontentloaded" });

    const rail = page.locator("#community .joe-photo-marquee");
    const track = page.locator("#community .joe-photo-marquee-track");

    await expect(rail).toBeVisible();
    await expect(page.locator("#community .joe-section-head")).toHaveCount(0);
    await expect(page.locator("#community-title")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /pause photos|play photos/i }),
    ).toHaveCount(0);
    await expect(page.locator("#community .joe-photo-card figcaption")).toHaveCount(0);
    await expect(rail).not.toHaveAttribute("data-paused", /.+/);
    await expect(track).toHaveCSS("animation-name", "joe-photo-marquee-right");
    await expectNoVisibleScrollbar(rail);
    await expect(track).toHaveCSS("animation-play-state", "running");
    await expectPageHealthy(page, problems);
  });

  test("keeps the home header minimal and preserves anchor navigation", async ({
    page,
  }) => {
    const isMobile = test.info().project.name.includes("mobile");
    const problems = collectConsoleProblems(page);

    await page.goto("/");

    await expect(page.getByRole("button", { name: "Open jump menu" })).toHaveCount(0);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator(".simo-command-nav")).toHaveCount(0);
    await expect(page.locator(".joe-hero a")).toHaveCount(0);

    if (isMobile) {
      await expect(page.getByRole("button", { name: /open navigation/i })).toBeVisible();
      await page.goto("/#work", { waitUntil: "domcontentloaded" });
      await expect(page.locator("#work")).toBeVisible();
      await page.goto("/#contact", { waitUntil: "domcontentloaded" });
      await expect(page.locator("#contact")).toBeVisible();
    } else {
      const workLink = await expectHomeDestinationLink(page, "work");
      const contactLink = await expectHomeDestinationLink(page, "contact");

      await workLink.click();
      await expect(page).toHaveURL(/#work$/);
      await expect(page.locator("#work")).toBeVisible();
      await contactLink.click();
      await expect(page).toHaveURL(/#contact$/);
      await expect(page.locator("#contact")).toBeVisible();
    }

    await expectPageHealthy(page, problems);
  });

  test("404 footer stays minimal and does not duplicate navigation", async ({
    page,
  }) => {
    const response = await page.goto("/missing-route", {
      waitUntil: "domcontentloaded",
    });

    expect(response?.status()).toBe(404);

    const footer = page.locator("footer");

    await expect(
      footer.getByRole("link", { exact: true, name: "Joe Simo" }),
      "footer home link",
    ).toHaveAttribute("href", "/");
    await expect(footer.locator("nav")).toHaveCount(0);
    await expect(footer.getByRole("link", { name: /work/i })).toHaveCount(0);
    await expect(footer.getByRole("link", { name: /systems/i })).toHaveCount(0);
    await expect(footer.getByRole("link", { name: /certifications/i })).toHaveCount(0);
    await expect(footer.getByRole("link", { name: /community/i })).toHaveCount(0);
    await expect(footer.getByRole("link", { name: /blog/i })).toHaveCount(0);
    await expect(footer.getByRole("link", { name: /contact/i })).toHaveCount(0);
    await expect(footer.getByRole("link", { name: /github|linkedin|instagram|x/i })).toHaveCount(0);

    const problems = collectConsoleProblems(page);
    await expectPageHealthy(page, problems);
  });

  test("switches visible homepage copy between English and Spanish", async ({
    page,
  }) => {
    const isMobile = test.info().project.name.includes("mobile");
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
    if (isMobile) {
      await page.getByRole("button", { name: /abrir navegación/i }).click();
      await expect(
        page.getByRole("menuitem", { name: /Trabajo/ }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
    } else {
      await expect(page.getByRole("link", { name: "Trabajo" }).first()).toBeVisible();
    }
    await expect(
      page.getByRole("heading", { name: "Certificaciones" }),
    ).toBeVisible();
    await expect
      .poll(() => renderedPageText(page))
      .not.toContain("Designer/developer, FL.");
    await expect(
      page.getByRole("link", { name: /Work Trabajo/ }),
    ).toHaveCount(0);

    await page.getByRole("button", { name: /language:|idioma:/i }).click();
    await page.getByRole("menuitemradio", { name: "English" }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByText("Designer/developer, FL.")).toBeVisible();
    await expect
      .poll(() => renderedPageText(page))
      .not.toContain("Diseñador/desarrollador, FL.");
    await expect(
      page.getByRole("link", { name: /Work Trabajo/ }),
    ).toHaveCount(0);

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
    const workUrl = page.url();
    const selectedProjectUrl = new URL(workUrl);

    selectedProjectUrl.searchParams.set("project", "love-presentation");
    await expect(page.locator("html")).toHaveAttribute(
      "data-portfolio-runtime",
      "ready",
    );

    const projectRow = page.locator("#work-love-presentation");

    await expect(projectRow.getByRole("heading", { name: "Love Presentation" })).toBeVisible();
    await projectRow
      .getByRole("button", { name: /view case study for Love Presentation/i })
      .click();

    const projectDialog = page.getByRole("dialog", { name: /Love Presentation/i });

    await expect(projectDialog).toBeVisible();
    await expect(page).toHaveURL(selectedProjectUrl.toString());
    await expect(projectDialog.getByText(/Role/i)).toBeVisible();
    await expect(
      projectDialog.getByRole("link", { name: /open case study/i }),
    ).toHaveAttribute("href", "/work/love-presentation");
    await expectFocusTrappedInDialog(page, projectDialog);
    await page.keyboard.press("Escape");
    await expect(projectDialog).toHaveCount(0);
    await expect(page).toHaveURL(workUrl);
    await expect(
      projectRow.getByRole("button", {
        name: /view case study for Love Presentation/i,
      }),
    ).toBeFocused();
    await expect(page.locator("#community [data-project-open]")).toHaveCount(0);
    await expect(
      page.locator("#community").getByRole("button", { name: /pause photos/i }),
    ).toHaveCount(1);

    await page.goto("/?project=love-presentation#work", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator("html")).toHaveAttribute(
      "data-portfolio-runtime",
      "ready",
    );
    await expect(projectDialog).toBeVisible();
    await expect(page).toHaveURL(/\/\?project=love-presentation#work$/);

    await page.keyboard.press("Escape");
    await expect(projectDialog).toHaveCount(0);
    await expect(page).toHaveURL(/\/#work$/);

    await page.goto("/?project=missing-project#work", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator("html")).toHaveAttribute(
      "data-portfolio-runtime",
      "ready",
    );
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(/\/#work$/);

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
      .toMatch(/grayscale\((1|100%)\)/);

    await workRow
      .getByRole("button", { name: /view case study for sim0/i })
      .click();

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
      "View case study for sim0",
      "View case study for Love Presentation",
      "View case study for garden0",
      "View case study for Astrosimo",
      "View case study for ChessLM",
      "View case study for Next Flights",
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
      "/blog",
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
      const workAnchor = `id="work-${slug}"`;

      if (route.visibleOnHome) {
        expect(homeHtml, workAnchor).toContain(workAnchor);
      } else {
        expect(homeHtml, workAnchor).not.toContain(workAnchor);
      }
    }

    const blogResponse = await request.get("/blog", { maxRedirects: 0 });
    expect(blogResponse.status()).toBe(200);
    expect(blogResponse.headers().location).toBeUndefined();
    expect(await blogResponse.text()).toContain("No public posts yet");

    for (const route of workRoutes) {
      const response = await request.get(route.path, { maxRedirects: 0 });
      const html = await response.text();

      expect(response.status(), route.path).toBe(200);
      expect(html, route.path).toContain(route.heading);
    }

    for (const route of noAssetWorkRouteMetadata) {
      const response = await request.get(route.path, { maxRedirects: 0 });
      const html = await response.text();

      expect(response.status(), route.path).toBe(200);
      expect(html, route.path).toContain(`<title>${route.title}`);
      expect(html, route.path).toContain(
        `<meta property="og:title" content="${route.title}"/>`,
      );
      expect(html, route.path).toContain(
        '<meta name="twitter:card" content="summary_large_image"/>',
      );
      expect(html, route.path).toMatch(
        /<meta property="og:image" content="[^"]*\/opengraph-image[^"]*"\/>/,
      );
      expect(html, route.path).toMatch(
        /<meta name="twitter:image" content="[^"]*\/twitter-image[^"]*"\/>/,
      );
      expect(html, route.path).not.toMatch(
        /(?:og:image|twitter:image)[^>]*(?:undefined|null)/i,
      );
    }

    const missingResponse = await request.get("/missing-route");
    expect(missingResponse.status()).toBe(404);
  });
});
