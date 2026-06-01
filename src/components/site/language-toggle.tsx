"use client";

import { useRef, useState } from "react";
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
import { LocalizedText } from "@/components/site/localized-text";
import {
  isSiteLanguage,
  setSiteLanguage,
  useSiteLanguage,
} from "@/components/site/use-site-language";
import { cn } from "@/lib/utils";

const languageOptions = [
  { value: "en", label: "English", shortLabel: "EN" },
  { value: "es", label: "Español", shortLabel: "ES" },
] as const;

export function LanguageToggle() {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const language = useSiteLanguage();
  const currentOption =
    languageOptions.find((option) => option.value === language) ??
    languageOptions[0];
  const ariaLabel =
    language === "es"
      ? `Idioma: ${currentOption.label}`
      : `Language: ${currentOption.label}`;

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
                setSiteLanguage(value);
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
