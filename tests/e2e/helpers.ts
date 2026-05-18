import { expect, type Page } from "@playwright/test";

export const completedRoute = "preview,runtime,api,ship,changes";
export const workRoutes = [
  { heading: "sim0", path: "/work/sim0" },
  { heading: "Astrosimo", path: "/work/astrosimo" },
  { heading: "Antoneta's Garden", path: "/work/antonetas-garden" },
  { heading: "Next Flights", path: "/work/next-flights" },
  { heading: "GrimmGreen Channel Watch", path: "/work/grimgreen-channel-watch" },
  { heading: "Royal Shell", path: "/work/royal-shell" },
  { heading: "Signature Copier", path: "/work/signature-copier" },
  { heading: "Printer Scripts", path: "/work/printer-scripts" },
  { heading: "ChessLM", path: "/work/chesslm" },
] as const;

export async function blockHeavyMedia(page: Page) {
  await page.route(/\.(mp4|webm)(\?.*)?$/i, (route) => {
    const extension = new URL(route.request().url()).pathname
      .split(".")
      .pop()
      ?.toLowerCase();

    return route.fulfill({
      body: "",
      contentType: extension === "mp4" ? "video/mp4" : "video/webm",
      status: 200,
    });
  });
}

function isIgnorableBrowserWarning(message: string) {
  return (
    message.includes("GPU stall due to ReadPixels") ||
    message.includes("NO_COLOR") ||
    message.includes("FORCE_COLOR")
  );
}

export function collectConsoleProblems(page: Page) {
  const problems: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      const text = message.text();

      if (!isIgnorableBrowserWarning(text)) {
        problems.push(`[${message.type()}] ${text}`);
      }
    }
  });
  page.on("pageerror", (error) => {
    problems.push(`[pageerror] ${error.message}`);
  });

  return problems;
}

export async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const documentWidth = Math.max(
          document.body.scrollWidth,
          document.documentElement.scrollWidth,
        );

        return documentWidth - document.documentElement.clientWidth;
      }),
    )
    .toBeLessThanOrEqual(1);
}

export async function expectPageHealthy(
  page: Page,
  problems: readonly string[],
) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(300);
  await expect(
    page.locator("[data-nextjs-dialog-overlay], nextjs-portal"),
  ).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  expect(problems).toEqual([]);
}

export async function installStableVisualStyles(page: Page) {
  await page.evaluate((css) => {
    const nonce =
      (
        document.querySelector("script[nonce]") as
          | (HTMLScriptElement & { nonce: string })
          | null
      )?.nonce ??
      (
        document.querySelector("style[nonce]") as
          | (HTMLStyleElement & { nonce: string })
          | null
      )?.nonce ??
      "";
    const style = document.createElement("style");

    if (nonce) {
      style.nonce = nonce;
    }

    style.textContent = css;
    document.head.append(style);
  }, `
      *, *::before, *::after {
        animation-delay: 0s !important;
        animation-duration: 0s !important;
        caret-color: transparent !important;
        scroll-behavior: auto !important;
        transition-delay: 0s !important;
        transition-duration: 0s !important;
      }

      .method-world-webgl canvas {
        opacity: 0 !important;
      }

      video {
        visibility: hidden !important;
      }
    `);
}

export async function setTheme(page: Page, theme: "dark" | "light") {
  await page.addInitScript((selectedTheme) => {
    localStorage.setItem("theme", selectedTheme);

    const applyTheme = () => {
      const root = document.documentElement;

      if (!root) {
        return;
      }

      root.classList.toggle("dark", selectedTheme === "dark");
      root.style.colorScheme = selectedTheme;
    };

    applyTheme();
    document.addEventListener("DOMContentLoaded", applyTheme, { once: true });
  }, theme);

  if (page.url() === "about:blank") {
    return;
  }

  await page.evaluate((selectedTheme) => {
    localStorage.setItem("theme", selectedTheme);
    document.documentElement.classList.toggle("dark", selectedTheme === "dark");
    document.documentElement.style.colorScheme = selectedTheme;
  }, theme);

  await expect
    .poll(async () =>
      page.evaluate((selectedTheme) => {
        const isDark = document.documentElement.classList.contains("dark");

        return selectedTheme === "dark" ? isDark : !isDark;
      }, theme),
    )
    .toBe(true);
}

export async function expectInteractiveTextFits(page: Page) {
  const clippedControls = await page
    .locator("a, button, [role='button'], [role='menuitemradio']")
    .evaluateAll((nodes) =>
      nodes
        .filter((node) => {
          const element = node as HTMLElement;
          const style = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();

          return (
            !element.classList.contains("sr-only") &&
            style.visibility !== "hidden" &&
            style.display !== "none" &&
            rect.width > 0 &&
            rect.height > 0
          );
        })
        .filter((node) => {
          const element = node as HTMLElement;

          return element.scrollWidth - element.clientWidth > 2;
        })
        .map((node) => {
          const element = node as HTMLElement;

          return {
            aria: element.getAttribute("aria-label"),
            className: element.className,
            text: element.innerText.trim(),
          };
        }),
    );

  expect(clippedControls).toEqual([]);
}
