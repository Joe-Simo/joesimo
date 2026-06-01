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
  await expect(canvas).toHaveAttribute("aria-hidden", "true");
  await expect(canvas).toHaveCSS("opacity", "1");
  await expect(canvas).toHaveCSS("pointer-events", "none");

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
      page.getByText("React / Next.js / TypeScript / JavaScript / Tailwind CSS / shadcn/ui / Three.js / Motion"),
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
    await expect(page.locator(".joe-hero a")).toHaveCount(1);
    await expect(
      page.locator(".joe-hero").getByRole("link", { name: /latest blog/i }),
    ).toHaveAttribute("href", "/blog/vercel-v0-api-billing-bug-report");
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
      /Operated sim0 case|Run The Case|placeholder|fake|scraped|awwwards|site of the year|AI-native|public trail|famous developers|GSAP|WebGL|proof route|owned frames|readable product surface/i,
    );
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
    const markImages = credentialSection.locator(".joe-certification-mark-image");

    await expect(markImages).toHaveCount(27);
    await expect(
      credentialSection.locator(".joe-certification-badge-image"),
    ).toHaveCount(7);
    await expect(
      credentialSection.locator(".joe-certification-name"),
    ).toHaveCount(27);

    for (let index = 0; index < 27; index += 1) {
      await expect
        .poll(() =>
          markImages
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
            markImages
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
    await expect(
      workSection.getByRole("heading", {
        exact: true,
        name: "GitHub projects",
      }),
    ).toBeVisible();
    await expect(workSection.locator(".joe-work-table")).toHaveCount(0);
    await expect(workSection.locator(".joe-github-card")).toHaveCount(11);
    await expect(
      workSection.locator('.joe-github-card[data-visibility="public"]'),
    ).toHaveCount(5);
    await expect(
      workSection.getByRole("link", {
        exact: true,
        name: "joesimo GitHub repository, opens in a new tab",
      }),
    ).toBeVisible();
    await expect(
      workSection.locator('article.joe-github-card[data-visibility="private"]'),
    ).toHaveCount(6);
    await expect(workSection.getByText("sim0", { exact: true })).toBeVisible();
    await expect(workSection.getByText("garden0", { exact: true })).toBeVisible();
    await expect(
      workSection.locator('a[href="https://github.com/Joe-Simo/sim0"]'),
    ).toHaveCount(0);

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
    await expect(page.locator("#community .joe-photo-card")).toHaveCount(11);
    await expect(
      page.locator('#community .joe-photo-marquee-copy[data-photo-copy="visual"]'),
    ).toHaveCount(0);
    await expect(
      page.locator('#community .joe-photo-marquee-copy[aria-hidden="true"]'),
    ).toHaveCount(0);
    await expect(
      page.locator('#community .joe-photo-card[data-photo-copy="accessible"]'),
    ).toHaveCount(11);
    await expect(
      page.locator('#community .joe-photo-card[data-photo-copy="visual"]'),
    ).toHaveCount(0);
    await expect(
      page.locator("#community .joe-photo-marquee-track"),
    ).toHaveCSS("animation-name", "none");
    await expect(
      page.locator("#community .joe-photo-card figcaption"),
    ).toHaveCount(0);
    await expect(page.locator("#community .joe-cover-image").first()).toBeAttached();
    await expectRenderedImagesHealthy(page);
    await expectProjectMediaFramesContained(page);

    await page.goto("/blog", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/blog$/);
    await expect(
      page.getByRole("heading", { exact: true, name: "Blog" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: /Writing from the work/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: /The time I found a v0 API billing bug/i,
      }),
    ).toBeVisible();

    await page.goto("/blog/vercel-v0-api-billing-bug-report", {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByRole("heading", {
        name: "The time I found a v0 API billing bug",
      }),
    ).toBeVisible();
    await expect(page.getByText("Private proof, public story.")).toBeVisible();

    const footer = page.locator("footer");

    await expect(footer.locator('nav[aria-label="Social links"]')).toHaveCount(1);
    await expect(footer.getByRole("link", { name: /github/i })).toBeVisible();
    await expect(footer.getByRole("link", { name: /youtube/i })).toBeVisible();
    await expect(footer.getByRole("link", { name: /v0/i })).toBeVisible();
    await expect(footer.getByRole("link", { name: /contact/i })).toHaveCount(0);
    await page.goto("/#contact", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Contact" }),
    ).toHaveCount(0);
    await expect(page.locator("#contact-title")).toHaveCount(0);
    await expect(
      page.locator("#contact").getByRole("link", { name: /Instagram/i }),
    ).toBeVisible();
    await expect(
      page.locator("#contact .joe-contact-actions"),
    ).toHaveCount(0);
    const contactLinks = await page
      .locator('#contact nav[aria-label="Social links"] a')
      .evaluateAll((links) =>
        links.map((link) => link.getAttribute("href")),
      );

    expect(contactLinks).toEqual([
      "https://x.com/joesimo",
      "https://github.com/Joe-Simo",
      "https://v0.app/@joesimo",
      "https://www.linkedin.com/in/josephsimo/",
      "https://www.instagram.com/joesimo_/",
      "https://www.youtube.com/@JoeSimo",
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
    const isMobile = test.info().project.name.includes("mobile");
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
    await expect(page.locator("#community .joe-photo-card")).toHaveCount(11);
    await expect(
      page.locator('#community .joe-photo-marquee-copy[data-photo-copy="visual"]'),
    ).toHaveCount(0);
    await expect(track).toHaveCSS("animation-name", "none");
    await expectNoVisibleScrollbar(rail);
    await expect
      .poll(() =>
        rail.evaluate((element) => element.scrollWidth > element.clientWidth),
      )
      .toBe(true);

    const railBox = await rail.boundingBox();

    expect(railBox).toBeTruthy();
    if (railBox) {
      const wheelPoint = {
        x: railBox.x + railBox.width / 2,
        y: railBox.y + railBox.height / 2,
      };
      const center = {
        x: railBox.x + railBox.width / 2,
        y: railBox.y + railBox.height / 2,
      };

      if (!isMobile) {
        const wheelStartScrollLeft = await rail.evaluate((element) => {
          element.scrollLeft = 0;
          return element.scrollLeft;
        });

        await page.mouse.move(wheelPoint.x, wheelPoint.y);
        await page.mouse.wheel(180, 0);
        await expect
          .poll(() => rail.evaluate((element) => element.scrollLeft))
          .toBeGreaterThan(wheelStartScrollLeft);
      }

      if (!isMobile) {
        const startScrollLeft = await rail.evaluate((element) => {
          element.scrollLeft = 0;
          return element.scrollLeft;
        });

        await page.mouse.move(center.x, center.y);
        await page.mouse.down();
        await page.mouse.move(center.x - 220, center.y, {
          steps: 4,
        });
        await page.mouse.up();
        await expect
          .poll(() => rail.evaluate((element) => element.scrollLeft))
          .toBeGreaterThan(startScrollLeft);
      }

      if (isMobile) {
        await rail.evaluate((element) => {
          element.scrollLeft = 0;
        });

        const mobileSwipeStart = await rail.evaluate(
          (element) => element.scrollLeft,
        );
        const touch = await page.context().newCDPSession(page);

        await touch.send("Input.dispatchTouchEvent", {
          touchPoints: [{ x: center.x, y: center.y }],
          type: "touchStart",
        });
        await touch.send("Input.dispatchTouchEvent", {
          touchPoints: [{ x: center.x - 160, y: center.y }],
          type: "touchMove",
        });
        await touch.send("Input.dispatchTouchEvent", {
          touchPoints: [],
          type: "touchEnd",
        });
        await expect
          .poll(() => rail.evaluate((element) => element.scrollLeft))
          .toBeGreaterThan(mobileSwipeStart);
      }
    }

    await rail.evaluate((element) => {
      element.scrollLeft = 0;
    });
    await page.waitForTimeout(260);

    const firstPhotoButton = page.locator("#community [data-photo-open]").first();

    await expect(firstPhotoButton).toBeVisible();
    if (isMobile) {
      await firstPhotoButton.tap();
    } else {
      await firstPhotoButton.click();
    }

    const photoDialog = page.getByRole("dialog").first();

    await expect(photoDialog).toBeVisible();
    await expect(photoDialog.locator(".joe-photo-dialog-image")).toBeVisible();
    if (railBox) {
      const dialogImageBox = await photoDialog
        .locator(".joe-photo-dialog-image")
        .boundingBox();

      expect(dialogImageBox?.width ?? 0).toBeGreaterThan(railBox.width);
    }
    await page.keyboard.press("Escape");
    await expect(photoDialog).toHaveCount(0);
    await expect(rail).not.toHaveAttribute("data-photo-dialog-open", /.+/);
    await expectPageHealthy(page, problems);
  });

  test("keeps photo zoom dialog inside small browser windows", async ({
    page,
  }) => {
    const isMobile = test.info().project.name.includes("mobile");
    const problems = collectConsoleProblems(page);

    await page.setViewportSize({ width: 360, height: 480 });
    await page.goto("/#community", { waitUntil: "domcontentloaded" });
    await expect(page.locator('html[data-portfolio-runtime="ready"]')).toHaveCount(
      1,
    );

    const rail = page.locator("#community .joe-photo-marquee");

    await expect(rail).toBeVisible();
    await rail.evaluate((element) => {
      element.scrollLeft = 0;
    });

    const firstPhotoButton = page.locator("#community [data-photo-open]").first();

    await expect(firstPhotoButton).toBeVisible();
    if (isMobile) {
      await firstPhotoButton.tap();
    } else {
      await firstPhotoButton.click();
    }

    const photoDialog = page.getByRole("dialog").first();

    await expect(photoDialog).toBeVisible();
    await expect(photoDialog.locator(".joe-photo-dialog-scroll")).toBeVisible();
    const metrics = await photoDialog.evaluate((dialog) => {
      const rect = dialog.getBoundingClientRect();
      const scroll = dialog.querySelector<HTMLElement>(
        ".joe-photo-dialog-scroll",
      );

      return {
        bottom: rect.bottom,
        documentOverflow:
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
        height: rect.height,
        left: rect.left,
        right: rect.right,
        scrollClientWidth: scroll?.clientWidth ?? 0,
        scrollWidth: scroll?.scrollWidth ?? 0,
        top: rect.top,
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
        width: rect.width,
      };
    });

    expect(metrics.left).toBeGreaterThanOrEqual(0);
    expect(metrics.top).toBeGreaterThanOrEqual(0);
    expect(metrics.right).toBeLessThanOrEqual(metrics.viewportWidth);
    expect(metrics.bottom).toBeLessThanOrEqual(metrics.viewportHeight);
    expect(metrics.width).toBeLessThanOrEqual(metrics.viewportWidth - 24);
    expect(metrics.height).toBeLessThanOrEqual(metrics.viewportHeight - 24);
    expect(metrics.documentOverflow).toBe(0);
    expect(metrics.scrollWidth).toBeGreaterThan(metrics.scrollClientWidth);

    await page.keyboard.press("Escape");
    await expect(photoDialog).toHaveCount(0);
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
    await expect(page.locator(".joe-hero a")).toHaveCount(1);

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
    const socialNav = footer.locator('nav[aria-label="Social links"]');

    await expect(socialNav).toHaveCount(1);
    await expect(socialNav.locator("a")).toHaveCount(6);
    await expect(footer.getByRole("link", { name: /work/i })).toHaveCount(0);
    await expect(footer.getByRole("link", { name: /systems/i })).toHaveCount(0);
    await expect(
      footer.getByRole("link", { name: /certifications/i }),
    ).toHaveCount(0);
    await expect(footer.getByRole("link", { name: /community/i })).toHaveCount(0);
    await expect(footer.getByRole("link", { name: /blog/i })).toHaveCount(0);
    await expect(footer.getByRole("link", { name: /contact/i })).toHaveCount(0);
    await expect(
      footer.getByRole("link", {
        name: /github|linkedin|instagram|youtube|v0|x/i,
      }),
    ).toHaveCount(6);

    const problems = collectConsoleProblems(page);
    await expectPageHealthy(page, problems);
  });

  test("uses browser language until the user selects a preference", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await page.addInitScript(() => {
      Object.defineProperty(window.navigator, "languages", {
        configurable: true,
        get: () => ["es-DO", "en-US"],
      });
      Object.defineProperty(window.navigator, "language", {
        configurable: true,
        get: () => "es-DO",
      });
    });

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(page.getByText("Diseñador/desarrollador, FL.")).toBeVisible();

    await page.getByRole("button", { name: /idioma:/i }).click();
    await page.getByRole("menuitemradio", { name: "English" }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByText("Designer/developer, FL.")).toBeVisible();

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByText("Designer/developer, FL.")).toBeVisible();

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

    await page.goto(selectedProjectUrl.toString(), { waitUntil: "domcontentloaded" });

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
    await expect(page.locator("#community [data-project-open]")).toHaveCount(0);
    await expect(
      page.locator("#community").getByRole("button", { name: /pause photos/i }),
    ).toHaveCount(0);

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

    await page.goto("/#community", { waitUntil: "domcontentloaded" });

    const rail = page.locator("#community .joe-photo-marquee");

    await rail.evaluate((element) =>
      element.scrollIntoView({ behavior: "instant", block: "center" }),
    );
    await page.waitForTimeout(120);

    const railBox = await rail.boundingBox();

    expect(railBox).toBeTruthy();
    const hoverPoint = railBox
      ? {
          x: railBox.x + railBox.width / 2,
          y: railBox.y + railBox.height / 2,
        }
      : { x: 0, y: 0 };
    const visiblePhotoFilter = () =>
      page.evaluate(({ x, y }) => {
        const target = document.elementFromPoint(x, y);
        const image = target
          ?.closest(".joe-photo-card")
          ?.querySelector<HTMLElement>(".joe-cover-image");

        return image ? getComputedStyle(image).filter : "";
      }, hoverPoint);

    await expect
      .poll(visiblePhotoFilter)
      .toMatch(/grayscale\((1|100%)\)/);

    await page.mouse.move(hoverPoint.x, hoverPoint.y);
    await expect
      .poll(visiblePhotoFilter)
      .not.toMatch(/grayscale\((1|100%)\)/);

    await page.goto("/?project=sim0#work", { waitUntil: "domcontentloaded" });

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

  test("keeps GitHub project cards public-safe on the work surface", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await page.goto("/#work", { waitUntil: "domcontentloaded" });

    await expect(page.locator("#work .joe-github-card")).toHaveCount(11);
    await expect(page.locator("#work [data-project-open]")).toHaveCount(0);
    await expect(
      page.locator('#work article.joe-github-card[data-visibility="private"]'),
    ).toHaveCount(6);
    await expect(
      page.locator('#work a[href="https://github.com/Joe-Simo/sim0"]'),
    ).toHaveCount(0);
    await expect(
      page.locator('#work a[href="https://github.com/Joe-Simo/garden0"]'),
    ).toHaveCount(0);
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
    expect(homeHtml).toContain('id="work"');
    expect(homeHtml).toContain("GitHub projects");

    for (const route of workRoutes) {
      const slug = route.path.replace("/work/", "");
      const workAnchor = `id="work-${slug}"`;

      expect(homeHtml, workAnchor).not.toContain(workAnchor);
    }

    const blogResponse = await request.get("/blog", { maxRedirects: 0 });
    expect(blogResponse.status()).toBe(200);
    expect(blogResponse.headers().location).toBeUndefined();
    const blogHtml = await blogResponse.text();

    expect(blogHtml).toContain("The time I found a v0 API billing bug");
    expect(blogHtml).not.toContain('name="robots" content="noindex, follow"');

    const blogPostResponse = await request.get(
      "/blog/vercel-v0-api-billing-bug-report",
      { maxRedirects: 0 },
    );
    expect(blogPostResponse.status()).toBe(200);
    const blogPostHtml = await blogPostResponse.text();

    expect(blogPostHtml).toContain("Responsible disclosure");
    expect(blogPostHtml).not.toContain("REDACTEDAPIKEYHERE");
    expect(blogPostHtml).not.toContain("YOUR_API_KEY");
    expect(blogPostHtml).not.toContain("Bearer ");

    const sitemapResponse = await request.get("/sitemap.xml");
    const sitemapXml = await sitemapResponse.text();

    expect(sitemapXml).toContain("https://joesimo.com/blog");
    expect(sitemapXml).toContain(
      "https://joesimo.com/blog/vercel-v0-api-billing-bug-report",
    );

    for (const route of workRoutes) {
      const response = await request.get(route.path, { maxRedirects: 0 });
      const html = await response.text();

      expect(response.status(), route.path).toBe(200);
      expect(html, route.path).toContain(route.heading);
      expect(html, route.path).toContain('href="/#work"');
      expect(html, route.path).toContain("Back to GitHub projects");
      expect(html, route.path).not.toContain(
        `href="/#work-${route.path.replace("/work/", "")}"`,
      );
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
