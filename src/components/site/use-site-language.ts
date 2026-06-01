"use client";

import { createElement, useEffect, useSyncExternalStore } from "react";

import type { SiteLanguage } from "@/components/site/localized-text";

const languageKey = "joe-site-language";
const languageChangeEvent = "joe-language-change";
const languageQueryParam = "lang";

export function isSiteLanguage(value: string | null): value is SiteLanguage {
  return value === "en" || value === "es";
}

function readStoredLanguage() {
  try {
    return window.localStorage.getItem(languageKey);
  } catch {
    return null;
  }
}

function writeStoredLanguage(language: SiteLanguage) {
  try {
    window.localStorage.setItem(languageKey, language);
  } catch {
    return;
  }
}

function readLanguageSnapshot(): SiteLanguage {
  if (typeof window === "undefined") {
    return "en";
  }

  const urlLanguage = new URL(window.location.href).searchParams.get(
    languageQueryParam,
  );

  if (isSiteLanguage(urlLanguage)) {
    return urlLanguage;
  }

  const storedLanguage = readStoredLanguage();

  if (isSiteLanguage(storedLanguage)) {
    return storedLanguage;
  }

  return window.navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}

function getServerLanguageSnapshot(): SiteLanguage {
  return "en";
}

export function applySiteLanguage(language: SiteLanguage) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.language = language;
  document.documentElement.lang = language;
}

export function setSiteLanguage(language: SiteLanguage) {
  if (typeof window === "undefined") {
    return;
  }

  writeStoredLanguage(language);
  applySiteLanguage(language);
  const url = new URL(window.location.href);

  if (language === "en") {
    url.searchParams.delete(languageQueryParam);
  } else {
    url.searchParams.set(languageQueryParam, language);
  }

  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (nextUrl !== currentUrl) {
    window.history.pushState(null, "", nextUrl);
  }

  window.dispatchEvent(new Event(languageChangeEvent));
}

function subscribeToLanguage(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener("storage", callback);
  window.addEventListener(languageChangeEvent, callback);

  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener("storage", callback);
    window.removeEventListener(languageChangeEvent, callback);
  };
}

export function useSiteLanguage() {
  const language = useSyncExternalStore(
    subscribeToLanguage,
    readLanguageSnapshot,
    getServerLanguageSnapshot,
  );

  useEffect(() => {
    applySiteLanguage(language);
  }, [language]);

  return language;
}

export function RenderedLocalizedText({
  en,
  es,
}: {
  en: string;
  es: string;
}) {
  const language = useSiteLanguage();

  return createElement(
    "span",
    { className: "i18n-text", lang: language },
    language === "es" ? es : en,
  );
}
