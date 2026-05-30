"use client";

import { useSyncExternalStore } from "react";

import type { SiteLanguage } from "@/components/site/localized-text";

function readLanguageSnapshot(): SiteLanguage {
  if (typeof document === "undefined") {
    return "en";
  }

  return document.documentElement.dataset.language === "es" ? "es" : "en";
}

function subscribeToLanguage(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("joe-language-change", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("joe-language-change", callback);
  };
}

export function useSiteLanguage() {
  return useSyncExternalStore(subscribeToLanguage, readLanguageSnapshot, () => "en");
}
