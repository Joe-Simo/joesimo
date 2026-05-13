"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

const themeColors = {
  dark: "#08090a",
  light: "#fcfcfc",
};

function resolveThemeColor(theme: string | undefined) {
  return theme === "dark" ? themeColors.dark : themeColors.light;
}

export function ThemeMeta() {
  const { resolvedTheme, theme } = useTheme();

  useEffect(() => {
    const selectedTheme = theme === "system" ? resolvedTheme : theme;
    const content = resolveThemeColor(selectedTheme);
    let meta = document.querySelector<HTMLMetaElement>(
      'meta[data-site-theme-color="true"]',
    );

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.dataset.siteThemeColor = "true";
      document.head.appendChild(meta);
    }

    meta.content = content;
  }, [resolvedTheme, theme]);

  return null;
}
