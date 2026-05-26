import { expect, type Locator, type Page } from "@playwright/test";

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

type HomeDestination =
  | "community"
  | "contact"
  | "credentials"
  | "systems"
  | "work";

const homeDestinationLinkSelectors: Record<HomeDestination, string> = {
  community:
    'header a[href="#community"], a[href="#community"], a[href="/#community"]',
  contact: 'header a[href="#contact"], a[href="#contact"], a[href="/#contact"]',
  credentials:
    'header a[href="#credentials"], a[href="#credentials"], a[href="/#credentials"]',
  systems: 'header a[href="#systems"], a[href="#systems"], a[href="/#systems"]',
  work: 'header a[href="#work"], a[href="#work"], a[href="/#work"]',
};

const homeDestinationSectionSelectors: Record<HomeDestination, string> = {
  community: "#community",
  contact: "#contact",
  credentials: "#credentials",
  systems: "#systems",
  work: "#work",
};

const homeDestinationNamePatterns: Record<HomeDestination, RegExp> = {
  community: /community/i,
  contact: /contact|message|x/i,
  credentials: /credentials/i,
  systems: /systems/i,
  work: /work/i,
};

function visibleSelector(selector: string) {
  return selector
    .split(",")
    .map((part) => `${part.trim()}:visible`)
    .join(", ");
}

export function homeDestinationLink(
  page: Page,
  destination: HomeDestination,
): Locator {
  return page
    .locator(visibleSelector(homeDestinationLinkSelectors[destination]))
    .first();
}

export function homeDestinationSection(
  page: Page,
  destination: HomeDestination,
): Locator {
  return page.locator(homeDestinationSectionSelectors[destination]).first();
}

export async function expectHomeDestinationLink(
  page: Page,
  destination: HomeDestination,
) {
  const link = homeDestinationLink(page, destination);

  await expect(link).toBeVisible();
  await expect(link).toHaveAccessibleName(
    homeDestinationNamePatterns[destination],
  );

  return link;
}

export async function expectHomeDestinationSection(
  page: Page,
  destination: HomeDestination,
) {
  const section = homeDestinationSection(page, destination);

  await expect(section).toBeVisible();

  return section;
}

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
    message.includes("FORCE_COLOR") ||
    message.includes("was preloaded using link preload but not used")
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
    page.locator(
      '[data-nextjs-dialog-overlay], nextjs-portal [role="dialog"], nextjs-portal [data-nextjs-dialog]',
    ),
  ).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  expect(problems).toEqual([]);
}

export async function expectJoeSignalFieldReady(page: Page) {
  const signalField = page.locator(".joe-signal-field").first();
  const canvas = signalField.locator("canvas");

  await expect(signalField).toBeVisible();
  await expect
    .poll(() => signalField.getAttribute("data-webgl-ready"), {
      timeout: 15_000,
    })
    .toBe("true");
  await expect
    .poll(() => signalField.getAttribute("data-webgl-painted"), {
      timeout: 15_000,
    })
    .toBe("true");
  await expect(canvas).toBeVisible();

  const canvasMetrics = await canvas.evaluate((element) => {
    const canvasElement = element as HTMLCanvasElement;
    const rect = canvasElement.getBoundingClientRect();

    return {
      clientHeight: Math.round(rect.height),
      clientWidth: Math.round(rect.width),
      height: canvasElement.height,
      width: canvasElement.width,
    };
  });

  expect(canvasMetrics.clientHeight).toBeGreaterThan(0);
  expect(canvasMetrics.clientWidth).toBeGreaterThan(0);
  expect(canvasMetrics.height).toBeGreaterThan(0);
  expect(canvasMetrics.width).toBeGreaterThan(0);
}

export async function loadLazyImages(page: Page) {
  const scrollHeight = await page.evaluate(
    () => document.documentElement.scrollHeight,
  );
  const scrollStep = 700;
  const previousScrollBehavior = await page.evaluate(() => {
    const currentScrollBehavior =
      document.documentElement.style.scrollBehavior;

    document.documentElement.style.scrollBehavior = "auto";

    return currentScrollBehavior;
  });

  try {
    for (let scrollY = 0; scrollY <= scrollHeight; scrollY += scrollStep) {
      await page.evaluate(
        (nextScrollY) =>
          window.scrollTo({ behavior: "instant", left: 0, top: nextScrollY }),
        scrollY,
      );
      await page.waitForTimeout(20);
    }

    await page.evaluate(() => {
      window.scrollTo({ behavior: "instant", left: 0, top: 0 });
    });
  } finally {
    await page.evaluate((scrollBehavior) => {
      document.documentElement.style.scrollBehavior = scrollBehavior;
    }, previousScrollBehavior);
  }
  await page.waitForTimeout(120);
}

export async function expectRenderedImagesHealthy(page: Page) {
  await loadLazyImages(page);

  const brokenImages = await page.locator("img").evaluateAll((images) =>
    images
      .filter((image) => {
        const img = image as HTMLImageElement;

        return img.complete && img.naturalWidth === 0;
      })
      .map((image) => {
        const img = image as HTMLImageElement;

        return {
          alt: img.alt,
          src: img.currentSrc || img.src,
        };
      }),
  );

  expect(brokenImages).toEqual([]);
}

export async function expectProjectMediaFramesContained(page: Page) {
  const overflowingFrames = await page
    .locator(".simo-work-media, .joe-work-media, .joe-current-media")
    .evaluateAll((frames) =>
      frames
        .map((frame) => {
          const frameElement = frame as HTMLElement;
          const image =
            frameElement.querySelector<HTMLElement>("img");

          if (!image) {
            return null;
          }

          const frameRect = frameElement.getBoundingClientRect();
          const imageRect = image.getBoundingClientRect();
          const overflow =
            imageRect.left < frameRect.left - 1 ||
            imageRect.right > frameRect.right + 1 ||
            imageRect.top < frameRect.top - 1 ||
            imageRect.bottom > frameRect.bottom + 1;

          if (!overflow) {
            return null;
          }

          return {
            fit: frameElement.getAttribute("data-media-fit"),
            frame: {
              height: Math.round(frameRect.height),
              width: Math.round(frameRect.width),
            },
            image: {
              height: Math.round(imageRect.height),
              width: Math.round(imageRect.width),
            },
            scale: frameElement.getAttribute("data-media-scale"),
          };
        })
        .filter((frame) => frame !== null),
    );

  expect(overflowingFrames).toEqual([]);
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
        localStorage.setItem("theme", selectedTheme);
        document.documentElement.classList.toggle(
          "dark",
          selectedTheme === "dark",
        );
        document.documentElement.style.colorScheme = selectedTheme;

        const isDark = document.documentElement.classList.contains("dark");

        return selectedTheme === "dark" ? isDark : !isDark;
      }, theme),
      { timeout: 15000 },
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
