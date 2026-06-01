"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

const themeColors = {
  dark: "#000000",
  light: "#ffffff",
};

function resolveThemeColor(theme: string | undefined) {
  return theme === "dark" ? themeColors.dark : themeColors.light;
}

export function ThemeMeta() {
  const { resolvedTheme, theme } = useTheme();

  useEffect(() => {
    const selectedTheme = theme === "system" ? resolvedTheme : theme;
    const content = resolveThemeColor(selectedTheme);
    const metas = Array.from(
      document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
    );
    const meta =
      metas.find((candidate) => candidate.dataset.siteThemeColor === "true") ??
      metas.find((candidate) => !candidate.media) ??
      metas[0] ??
      document.createElement("meta");

    meta.name = "theme-color";
    meta.dataset.siteThemeColor = "true";
    meta.content = content;

    for (const staleMeta of metas) {
      if (staleMeta !== meta) {
        staleMeta.remove();
      }
    }

    if (!meta.isConnected) {
      document.head.appendChild(meta);
    }
  }, [resolvedTheme, theme]);

  return null;
}
