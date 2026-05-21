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
    await tabUntilFocused(page, homeDestinationLink(page, "work"));
    await tabUntilFocused(page, homeDestinationLink(page, "photos"));
  });

  test("homepage destination controls expose usable accessible names", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expectPageHealthy(page, problems);

    await expectHomeDestinationLink(page, "work");
    await expectHomeDestinationLink(page, "photos");
  });

  test("social profile cards are keyboard reachable", async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await blockHeavyMedia(page);
    await page.goto("/#social", { waitUntil: "domcontentloaded" });
    await expectPageHealthy(page, problems);

    const githubLink = page.locator("#social").getByRole("link", { name: /GitHub/i });
    const linkedinLink = page
      .locator("#social")
      .getByRole("link", { name: /LinkedIn/i });

    await githubLink.evaluate((element) => element.focus());
    await expect(githubLink).toBeFocused();
    await linkedinLink.evaluate((element) => element.focus());
    await expect(linkedinLink).toBeFocused();
  });
});
