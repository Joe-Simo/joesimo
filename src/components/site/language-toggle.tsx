"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LocalizedText,
  type SiteLanguage,
} from "@/components/site/localized-text";
import { cn } from "@/lib/utils";

const languageKey = "joe-site-language";

const languageOptions = [
  { value: "en", label: "English", shortLabel: "EN" },
  { value: "es", label: "Español", shortLabel: "ES" },
] as const;

function isSiteLanguage(value: string | null): value is SiteLanguage {
  return value === "en" || value === "es";
}

function applyLanguage(language: SiteLanguage) {
  document.documentElement.dataset.language = language;
  document.documentElement.lang = language;
}

function readLanguageSnapshot(): SiteLanguage {
  if (typeof window === "undefined") {
    return "en";
  }

  const storedLanguage = window.localStorage.getItem(languageKey);
  const browserLanguage = window.navigator.language.toLowerCase();

  if (isSiteLanguage(storedLanguage)) {
    return storedLanguage;
  }

  return browserLanguage.startsWith("es") ? "es" : "en";
}

function getServerLanguageSnapshot(): SiteLanguage {
  return "en";
}

function subscribeToLanguage(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("joe-language-change", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("joe-language-change", callback);
  };
}

export function LanguageToggle() {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const language = useSyncExternalStore(
    subscribeToLanguage,
    readLanguageSnapshot,
    getServerLanguageSnapshot,
  );
  const currentOption =
    languageOptions.find((option) => option.value === language) ??
    languageOptions[0];
  const ariaLabel =
    language === "es"
      ? `Idioma: ${currentOption.label}`
      : `Language: ${currentOption.label}`;

  useEffect(() => {
    applyLanguage(language);
  }, [language]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label={ariaLabel}
            className="site-language-trigger size-11"
            ref={triggerRef}
            size="icon-lg"
            type="button"
            variant="outline"
          />
        }
      >
        <Languages aria-hidden />
        <span aria-hidden className="site-language-code">
          {currentOption.shortLabel}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="min-w-36 border border-border"
        sideOffset={8}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <LocalizedText en="Language" es="Idioma" />
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            onValueChange={(value) => {
              if (isSiteLanguage(value)) {
                window.localStorage.setItem(languageKey, value);
                applyLanguage(value);
                window.dispatchEvent(new Event("joe-language-change"));
                setOpen(false);
              }
            }}
            value={language}
          >
            {languageOptions.map((option) => {
              const selected = option.value === language;

              return (
                <DropdownMenuRadioItem
                  className={cn(
                    "min-h-11 px-2 pr-8",
                    selected && "bg-muted text-foreground",
                  )}
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
