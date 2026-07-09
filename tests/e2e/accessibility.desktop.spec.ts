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
    await tabUntilFocused(page, page.locator('header a[href="#work"]'), 10);
    await tabUntilFocused(
      page,
      page.getByRole("button", { name: /language:/i }),
      10,
    );
    await tabUntilFocused(page, page.getByRole("button", { name: /theme:/i }), 4);
  });

  test("homepage destination controls expose usable accessible names", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expectPageHealthy(page, problems);

    await expectHomeDestinationLink(page, "work");
    await expectHomeDestinationLink(page, "contact");
  });

  test("contact profile links are keyboard reachable", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.goto("/#contact", { waitUntil: "domcontentloaded" });
    await expectPageHealthy(page, problems);

    const xLink = page.locator("#contact").getByRole("link", { name: /X @joesimo/i });
    const githubLink = page.locator("#contact").getByRole("link", { name: /GitHub/i });
    const linkedinLink = page
      .locator("#contact")
      .getByRole("link", { name: /LinkedIn/i });

    await expect(xLink).toBeVisible();
    await expect(githubLink).toBeVisible();
    await expect(linkedinLink).toBeVisible();
    await xLink.focus();
    await expect(xLink).toBeFocused();
    await githubLink.focus();
    await expect(githubLink).toBeFocused();
    await linkedinLink.focus();
    await expect(linkedinLink).toBeFocused();
  });
});
