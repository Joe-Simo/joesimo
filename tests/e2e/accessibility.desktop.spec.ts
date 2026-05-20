import { expect, type Locator, type Page, test } from "@playwright/test";

import {
  blockHeavyMedia,
  collectConsoleProblems,
  expectHomeDestinationLink,
  expectPageHealthy,
  homeDestinationLink,
} from "./helpers";

async function tabUntilFocused(
  page: Page,
  target: Locator,
  maxTabs = 8,
) {
  for (let tabIndex = 0; tabIndex < maxTabs; tabIndex += 1) {
    await page.keyboard.press("Tab");

    const isFocused = await target.evaluate(
      (element) => element === document.activeElement,
    );

    if (isFocused) {
      return;
    }
  }

  await expect(target).toBeFocused();
}

test.describe("desktop accessibility quality gates", () => {
  test("keyboard can reach the primary home controls in order", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expectPageHealthy(page, problems);

    await tabUntilFocused(page, page.getByText("Skip to content"), 1);
    await tabUntilFocused(
      page,
      page.getByRole("link", { name: /joe simo|home/i }).first(),
    );
    await tabUntilFocused(page, page.getByRole("button", { name: /theme:/i }));
    await tabUntilFocused(page, homeDestinationLink(page, "work"));
    await tabUntilFocused(page, homeDestinationLink(page, "blog"));
  });

  test("homepage destination controls expose usable accessible names", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expectPageHealthy(page, problems);

    await expectHomeDestinationLink(page, "work");
    await expectHomeDestinationLink(page, "blog");
  });

  test("method route tabs move focus with arrow keys", async ({ page }) => {
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.goto("/#method", { waitUntil: "domcontentloaded" });
    await expectPageHealthy(page, problems);

    const supportTab = page.getByRole("tab", { name: /support/i });
    const signalsTab = page.getByRole("tab", { name: /signals/i });

    await supportTab.focus();
    await page.keyboard.press("ArrowRight");
    await expect(signalsTab).toBeFocused();
    await expect(signalsTab).toHaveAttribute("aria-selected", "true");
  });
});
