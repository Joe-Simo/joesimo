import { expect, type Page, test } from "@playwright/test";

import {
  blockHeavyMedia,
  collectConsoleProblems,
  expectHomeDestinationLink,
  expectHomeDestinationSection,
  expectInteractiveTextFits,
  expectNoHorizontalOverflow,
  expectPageHealthy,
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
      await expectHomeDestinationLink(page, "work");
      await expectHomeDestinationLink(page, "community");
      await expectNoHorizontalOverflow(page);
      await expectInteractiveTextFits(page);

      const workLink = await expectHomeDestinationLink(page, "work");

      await workLink.click();
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
    await expect(page.locator(".joe-identity-field")).toBeVisible();
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

  test("desktop index keeps the identity field and page content usable", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".simo-public-trail-canvas")).toHaveCount(0);
    await expect(page.locator(".joe-signal-field")).toHaveCount(0);
    await expect(page.locator(".joe-identity-field")).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 1, name: /Joe Simo/i }),
    ).toBeVisible();
    const workLink = await expectHomeDestinationLink(page, "work");

    await workLink.click();
    const workSection = await expectHomeDestinationSection(page, "work");

    await expect(workSection.locator('a[href^="/work/"]')).toHaveCount(0);
    await expect(
      workSection.getByRole("heading", { name: "Love Presentation" }),
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
    await expect(page.getByRole("heading", { name: "Community" })).toBeVisible();
    await page.goto("/#credentials", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#credentials")).toBeInViewport();
    await expect(
      page.getByRole("heading", { exact: true, name: "Credentials" }),
    ).toBeVisible();
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
    await expect(page.locator(".joe-identity-field")).toHaveAttribute(
      "data-hero-webgl",
      "fallback",
    );
    await expect(page.locator(".joe-identity-field canvas")).toHaveCount(0);
    await expect(
      page.locator(".joe-identity-fallback img"),
    ).toHaveCount(1);
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
    await expectHomeDestinationLink(page, "community");
    await expectPageHealthy(page, problems);
  });

  test("identity field tears down WebGL when reduced motion becomes active", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.locator(".joe-identity-field")).toHaveAttribute(
      "data-hero-webgl",
      "ready",
      { timeout: 20_000 },
    );
    await expect(page.locator(".joe-identity-field canvas")).toHaveCount(1);

    await page.emulateMedia({ reducedMotion: "reduce" });

    await expect(page.locator(".joe-identity-field")).toHaveAttribute(
      "data-hero-webgl",
      "fallback",
    );
    await expect(page.locator(".joe-identity-field canvas")).toHaveCount(0);
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
    await page.goto("/#work", { waitUntil: "domcontentloaded" });

    const firstWorkRow = page.locator(".joe-work-table article").first();

    await expect(firstWorkRow).toBeVisible();

    const rowBox = await firstWorkRow.boundingBox();

    expect(rowBox).not.toBeNull();

    if (!rowBox) {
      return;
    }

    await page.mouse.move(rowBox.x + rowBox.width / 2, rowBox.y + rowBox.height / 2);
    await expect
      .poll(() =>
        firstWorkRow.evaluate((element) =>
          (element as HTMLElement).style.getPropertyValue("--surface-x"),
        ),
      )
      .not.toBe("");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect
      .poll(() =>
        firstWorkRow.evaluate((element) =>
          (element as HTMLElement).style.getPropertyValue("--surface-x"),
        ),
      )
      .toBe("");

    await page.mouse.move(rowBox.x + rowBox.width / 2 + 8, rowBox.y + rowBox.height / 2);
    await page.waitForTimeout(120);
    await expect
      .poll(() =>
        firstWorkRow.evaluate((element) =>
          (element as HTMLElement).style.getPropertyValue("--surface-x"),
        ),
      )
      .toBe("");
    await expectPageHealthy(page, problems);
  });

  test("identity field falls back cleanly when WebGL is unavailable", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await page.addInitScript(() => {
      const canvasPrototype = HTMLCanvasElement.prototype as unknown as {
        getContext: (
          this: HTMLCanvasElement,
          contextId: string,
          ...args: unknown[]
        ) => RenderingContext | null;
      };
      const originalGetContext = canvasPrototype.getContext;

      canvasPrototype.getContext = function getContext(
        this: HTMLCanvasElement,
        contextId: string,
        ...args: unknown[]
      ) {
        if (/^webgl/i.test(contextId)) {
          return null;
        }

        return originalGetContext.call(this, contextId, ...args);
      };
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.locator(".joe-identity-field")).toHaveAttribute(
      "data-hero-webgl",
      "fallback",
      { timeout: 20_000 },
    );
    await expect(page.locator(".joe-identity-field canvas")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { level: 1, name: /Joe Simo/i }),
    ).toBeVisible();
    await expectHomeDestinationLink(page, "work");
    await page.waitForTimeout(300);
    await expect(
      page.locator(
        '[data-nextjs-dialog-overlay], nextjs-portal [role="dialog"], nextjs-portal [data-nextjs-dialog]',
      ),
    ).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
    expect(
      problems.filter(
        (problem) =>
          !problem.includes(
            "THREE.WebGLRenderer: Error creating WebGL context.",
          ),
      ),
    ).toEqual([]);
  });
});
