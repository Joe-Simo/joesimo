import { expect, type Locator, type Page, test } from "@playwright/test";

import {
  blockHeavyMedia,
  collectConsoleProblems,
  expectHomeDestinationLink,
  expectPageHealthy,
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
    await expect(page.getByRole("button", { name: /jump/i })).toHaveCount(0);
    await tabUntilFocused(page, page.getByRole("button", { name: /theme:/i }), 10);
    await tabUntilFocused(
      page,
      page.locator('.joe-hero a[href="#work"]').first(),
    );
  });

  test("homepage destination controls expose usable accessible names", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expectPageHealthy(page, problems);

    await expectHomeDestinationLink(page, "work");
    await expectHomeDestinationLink(page, "community");
  });

  test("contact profile links are keyboard reachable", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.goto("/#contact", { waitUntil: "domcontentloaded" });
    await expectPageHealthy(page, problems);

    const githubLink = page.locator("#contact").getByRole("link", { name: /GitHub/i });
    const linkedinLink = page
      .locator("#contact")
      .getByRole("link", { name: /LinkedIn/i });

    await expect(githubLink).toBeVisible();
    await expect(linkedinLink).toBeVisible();
    await githubLink.focus();
    await expect(githubLink).toBeFocused();
    await linkedinLink.focus();
    await expect(linkedinLink).toBeFocused();
  });
});
