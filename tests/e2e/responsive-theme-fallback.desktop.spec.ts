import { expect, type Page, test } from "@playwright/test";

import {
  blockHeavyMedia,
  collectConsoleProblems,
  expectHomeDestinationLink,
  expectHomeDestinationSection,
  expectInteractiveTextFits,
  expectNoHorizontalOverflow,
  expectNoVisibleScrollbar,
  expectPageHealthy,
  workRoutes,
} from "./helpers";

const responsiveViewports = [
  { width: 320, height: 844 },
  { width: 360, height: 844 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
] as const;

async function chooseTheme(page: Page, theme: string) {
  await page.getByRole("button", { name: /theme:/i }).click();

  const menu = page.locator('[data-slot="dropdown-menu-content"]');

  await expect(menu).toBeVisible();
  await menu.getByRole("menuitemradio", { name: theme }).click();
}

test.describe("responsive, theme, and fallback gates", () => {
  for (const viewport of responsiveViewports) {
    test(`home and work have no overflow or clipped controls at ${viewport.width}x${viewport.height}`, async ({
      page,
    }) => {
      const problems = collectConsoleProblems(page);

      await blockHeavyMedia(page);
      await page.setViewportSize(viewport);
      await page.goto("/", { waitUntil: "domcontentloaded" });

      await expect(
        page.getByRole("heading", { level: 1, name: /Joe Simo/i }),
      ).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await expectInteractiveTextFits(page);

      await page.goto("/#work", { waitUntil: "domcontentloaded" });
      await expectHomeDestinationSection(page, "work");
      await expectNoHorizontalOverflow(page);
      await expectInteractiveTextFits(page);
      await expectPageHealthy(page, problems);
    });
  }

  test("theme menu switches light, dark, and system without hydration issues", async ({
    page,
  }) => {
    test.setTimeout(90_000);

    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".joe-signal-field")).toHaveCount(0);
    await expect(page.locator(".joe-identity-field")).toHaveCount(0);
    await expect(page.locator(".joe-name-particles")).toBeVisible();
    await expect(page.locator(".joe-name-particles-canvas")).toHaveCSS(
      "opacity",
      "1",
    );
    await expectPageHealthy(page, problems);

    await chooseTheme(page, "Dark");
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expect(page.locator(".joe-signal-field")).toHaveCount(0);

    await chooseTheme(page, "Light");
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    await expect(page.locator(".joe-signal-field")).toHaveCount(0);

    await chooseTheme(page, "System");
    await expect(page.getByRole("button", { name: /theme: system/i })).toBeVisible();
    await expectPageHealthy(page, problems);
  });

  test("desktop index keeps the centered hero and page content usable", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".simo-public-trail-canvas")).toHaveCount(0);
    await expect(page.locator(".joe-signal-field")).toHaveCount(0);
    await expect(page.locator(".joe-identity-field")).toHaveCount(0);
    await expect(page.locator(".joe-name-particles")).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 1, name: /Joe Simo/i }),
    ).toBeVisible();
    const workLink = await expectHomeDestinationLink(page, "work");

    await workLink.click();
    const workSection = await expectHomeDestinationSection(page, "work");

    await expect(workSection.locator('a[href^="/work/"]')).toHaveCount(
      workRoutes.length,
    );
    await expect(
      workSection.getByRole("heading", { name: "GitHub projects" }),
    ).toBeVisible();
    await expectPageHealthy(page, problems);
  });

  test("community and credentials remain reachable without motion-only content", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.goto("/#community", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#community")).toBeInViewport();
    await expect(page.locator("#community-title")).toHaveCount(0);
    await expect(page.locator("#community .joe-section-head")).toHaveCount(0);
    await expect(page.locator("#community .joe-photo-marquee")).toBeVisible();
    await expectNoVisibleScrollbar(page.locator("#community .joe-photo-marquee"));
    await expect(
      page.locator("#community .joe-photo-marquee-track"),
    ).toHaveCSS("animation-name", "none");
    await page.goto("/#credentials", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#credentials")).toBeInViewport();
    await expect(
      page.getByRole("heading", { exact: true, name: "Certifications" }),
    ).toBeVisible();
    await expect(
      page.locator("#credentials .joe-certification-grid"),
    ).toBeVisible();
    await expect(
      page.locator("#credentials .joe-certification-tile"),
    ).toHaveCount(27);
    await expect(
      page.locator("#credentials .joe-certification-mark-image"),
    ).toHaveCount(27);
    await expect(
      page.locator("#credentials .joe-certification-badge-image"),
    ).toHaveCount(7);
    await expect(
      page.locator("#credentials .joe-certification-name"),
    ).toHaveCount(27);
    await expectPageHealthy(page, problems);
  });

  test("reduced motion preserves the index without motion-only content", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await page.addInitScript(() => {
      const trackedWindow = window as typeof window & {
        __joeCanvasContextRequests?: number;
      };
      const canvasPrototype = HTMLCanvasElement.prototype as unknown as {
        getContext: (
          this: HTMLCanvasElement,
          contextId: string,
          ...args: unknown[]
        ) => RenderingContext | null;
      };
      const originalGetContext = canvasPrototype.getContext;

      trackedWindow.__joeCanvasContextRequests = 0;
      canvasPrototype.getContext = function getContext(
        this: HTMLCanvasElement,
        contextId: string,
        ...args: unknown[]
      ) {
        trackedWindow.__joeCanvasContextRequests =
          (trackedWindow.__joeCanvasContextRequests ?? 0) + 1;

        return originalGetContext.call(this, contextId, ...args);
      };
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await blockHeavyMedia(page);
    await page.goto("/#community", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { level: 1, name: /Joe Simo/i }),
    ).toBeVisible();
    await expect(page.locator("#community")).toBeInViewport();
    await expect(page.locator(".joe-signal-field")).toHaveCount(0);
    await expect(page.locator(".joe-identity-field")).toHaveCount(0);
    await expect(page.locator(".joe-name-particles")).toHaveAttribute(
      "data-particles-ready",
      "false",
    );
    await expect(page.locator(".joe-name-particles-canvas")).toBeHidden();
    await expect(
      page.locator("#community .joe-photo-marquee-track"),
    ).toHaveCSS("animation-name", "none");
    await expect(
      page.locator('#community .joe-photo-marquee-copy[data-photo-copy="visual"]'),
    ).toHaveCount(0);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (
              window as typeof window & {
                __joeCanvasContextRequests?: number;
              }
            ).__joeCanvasContextRequests ?? 0,
        ),
      )
      .toBe(0);
    await expectHomeDestinationLink(page, "work");
    await expectPageHealthy(page, problems);
  });

  test("name particle hero tears down when reduced motion becomes active", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.locator(".joe-name-particles")).toHaveAttribute(
      "data-particles-ready",
      "true",
      { timeout: 20_000 },
    );
    await expect(page.locator(".joe-name-particles-canvas")).toBeVisible();
    await expect(page.locator(".joe-name-particles-canvas")).toHaveCSS(
      "opacity",
      "1",
    );

    await page.emulateMedia({ reducedMotion: "reduce" });

    await expect(page.locator(".joe-name-particles")).toHaveAttribute(
      "data-particles-ready",
      "false",
    );
    await expect(page.locator(".joe-name-particles-canvas")).toBeHidden();
    await expectHomeDestinationLink(page, "work");
    await expectPageHealthy(page, problems);
  });

  test("name particle hero starts when reduced motion becomes inactive", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.locator(".joe-name-particles")).toHaveAttribute(
      "data-particles-ready",
      "false",
    );
    await expect(page.locator(".joe-name-particles-canvas")).toBeHidden();

    await page.emulateMedia({ reducedMotion: "no-preference" });

    await expect(page.locator(".joe-name-particles")).toHaveAttribute(
      "data-particles-ready",
      "true",
      { timeout: 20_000 },
    );
    await expect(page.locator(".joe-name-particles-canvas")).toBeVisible();
    await expect(page.locator(".joe-name-particles-canvas")).toHaveCSS(
      "opacity",
      "1",
    );
    await expectHomeDestinationLink(page, "work");
    await expectPageHealthy(page, problems);
  });

  test("pointer surface polish follows live reduced motion preference", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await blockHeavyMedia(page);
    await page.goto("/#community", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute(
      "data-portfolio-runtime",
      "ready",
    );

    const polishedSurface = page.locator(".joe-github-card").first();

    await expect(polishedSurface).toBeVisible();

    const surfaceBox = await polishedSurface.boundingBox();

    expect(surfaceBox).not.toBeNull();

    if (!surfaceBox) {
      return;
    }

    await polishedSurface.dispatchEvent(
      "pointermove",
      {
        bubbles: true,
        clientX: surfaceBox.x + surfaceBox.width / 2,
        clientY: surfaceBox.y + surfaceBox.height / 2,
        pointerType: "mouse",
      },
    );
    await expect
      .poll(() =>
        polishedSurface.evaluate((element) =>
          (element as HTMLElement).style.getPropertyValue("--surface-x"),
        ),
      )
      .not.toBe("");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect
      .poll(() =>
        polishedSurface.evaluate((element) =>
          (element as HTMLElement).style.getPropertyValue("--surface-x"),
        ),
      )
      .toBe("");

    await polishedSurface.dispatchEvent(
      "pointermove",
      {
        bubbles: true,
        clientX: surfaceBox.x + surfaceBox.width / 2 + 8,
        clientY: surfaceBox.y + surfaceBox.height / 2,
        pointerType: "mouse",
      },
    );
    await page.waitForTimeout(120);
    await expect
      .poll(() =>
        polishedSurface.evaluate((element) =>
          (element as HTMLElement).style.getPropertyValue("--surface-x"),
        ),
      )
      .toBe("");
    await expectPageHealthy(page, problems);
  });

});
