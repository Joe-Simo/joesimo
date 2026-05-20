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

    await tabUntilFocused(page, page.getByText("Skip to content"), 3);
    await tabUntilFocused(page, page.getByRole("button", { name: /jump/i }));
    await tabUntilFocused(page, page.getByRole("button", { name: /theme:/i }));
    await tabUntilFocused(page, homeDestinationLink(page, "method"));
    await tabUntilFocused(page, homeDestinationLink(page, "work"));
  });

  test("homepage destination controls expose usable accessible names", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expectPageHealthy(page, problems);

    await expectHomeDestinationLink(page, "method");
    await expectHomeDestinationLink(page, "work");
  });

  test("method modules are keyboard reachable and update emphasis", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.goto("/#method", { waitUntil: "domcontentloaded" });
    await expectPageHealthy(page, problems);

    const supportButton = page.getByRole("button", { name: /support/i });
    const signalsButton = page.getByRole("button", { name: /signals/i });

    await supportButton.focus();
    await expect(supportButton).toHaveAttribute("aria-pressed", "true");
    await signalsButton.focus();
    await expect(signalsButton).toBeFocused();
    await expect(signalsButton).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#method")).toContainText("Start where it breaks.");
    await expect(page.locator("#method")).toContainText("Trace the state.");
  });
});
