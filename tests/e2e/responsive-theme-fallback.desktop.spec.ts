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
      await expectHomeDestinationLink(page, "blog");
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
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expectPageHealthy(page, problems);

    await chooseTheme(page, "Dark");
    await expect(page.locator("html")).toHaveClass(/dark/);

    await chooseTheme(page, "Light");
    await expect(page.locator("html")).not.toHaveClass(/dark/);

    await chooseTheme(page, "System");
    await expect(page.getByRole("button", { name: /theme: system/i })).toBeVisible();
    await expectPageHealthy(page, problems);
  });

  test("no-WebGL desktop fallback keeps the Joe-first index usable", async ({
    page,
  }) => {
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
        if (contextId.includes("webgl")) {
          return null;
        }

        return originalGetContext.call(this, contextId, ...args);
      };
    });

    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { level: 1, name: /Joe Simo/i }),
    ).toBeVisible();
    const workLink = await expectHomeDestinationLink(page, "work");

    await workLink.click();
    const workSection = await expectHomeDestinationSection(page, "work");

    await expect(workSection.locator('a[href^="/work/"]')).toHaveCount(0);
    await expect(
      workSection.getByRole("heading", { name: "sim0" }),
    ).toBeVisible();
    await expectPageHealthy(page, problems);
  });

  test("desktop Signal World mounts WebGL when the method chapter is active", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.goto("/#method", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#method")).toBeInViewport();
    await expect(page.locator(".simo-signal-webgl canvas")).toHaveCount(1);
    await expect(
      page.locator('.simo-signal-webgl[data-webgl-ready="true"] canvas'),
    ).toBeVisible();
    await expectPageHealthy(page, problems);
  });

  test("reduced motion preserves the index without motion-only content", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await page.emulateMedia({ reducedMotion: "reduce" });
    await blockHeavyMedia(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { level: 1, name: /Joe Simo/i }),
    ).toBeVisible();
    await expectHomeDestinationLink(page, "work");
    await expectHomeDestinationLink(page, "blog");
    await expectPageHealthy(page, problems);
  });
});
