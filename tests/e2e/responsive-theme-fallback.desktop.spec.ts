import { expect, test } from "@playwright/test";

import {
  blockHeavyMedia,
  collectConsoleProblems,
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
        page.getByRole("heading", { level: 1, name: "Joe Simo" }),
      ).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await expectInteractiveTextFits(page);

      await page.goto("/#work", { waitUntil: "domcontentloaded" });
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

    await page.getByRole("button", { name: /theme:/i }).click();
    await page.getByRole("menuitemradio", { name: "Dark" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.getByRole("button", { name: /theme:/i }).click();
    await page.getByRole("menuitemradio", { name: "Light" }).click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);

    await page.getByRole("button", { name: /theme:/i }).click();
    await page.getByRole("menuitemradio", { name: "System" }).click();
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
    await page.goto("/#work", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { level: 1, name: "Joe Simo" }),
    ).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator(".simo-index-ritual")).toBeVisible();
    await expect(page.getByRole("link", { name: /open case/i }).first()).toBeVisible();
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
      page.getByRole("heading", { level: 1, name: "Joe Simo" }),
    ).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator(".simo-index-ritual")).toBeVisible();
    await expect(page.getByRole("link", { name: "Portfolio" }).first()).toBeVisible();
    await expectPageHealthy(page, problems);
  });
});
