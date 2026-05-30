"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

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
import { useSiteLanguage } from "@/components/site/use-site-language";
import { cn } from "@/lib/utils";

const themeOptions = [
  { value: "light", label: "Light", labelEs: "Claro", icon: SunIcon },
  { value: "dark", label: "Dark", labelEs: "Oscuro", icon: MoonIcon },
  { value: "system", label: "System", labelEs: "Sistema", icon: MonitorIcon },
] as const;

type ThemeValue = (typeof themeOptions)[number]["value"];

const fallbackTheme: ThemeValue = "system";

function isThemeValue(value: string | undefined): value is ThemeValue {
  return themeOptions.some((option) => option.value === value);
}

function getThemeOption(value: ThemeValue) {
  return (
    themeOptions.find((option) => option.value === value) ??
    themeOptions[2]
  );
}

function subscribeToHydration(callback: () => void) {
  const frame = window.requestAnimationFrame(callback);

  return () => window.cancelAnimationFrame(frame);
}

function getHydratedSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const language = useSiteLanguage();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    getHydratedSnapshot,
    getServerSnapshot,
  );

  const currentTheme = isThemeValue(theme) ? theme : fallbackTheme;
  const displayTheme = mounted ? currentTheme : fallbackTheme;
  const currentOption = getThemeOption(displayTheme);
  const CurrentIcon = currentOption.icon;
  const themeLabel =
    language === "es" ? currentOption.labelEs : currentOption.label;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="size-11"
            disabled={!mounted}
            aria-label={
              language === "es" ? `Tema: ${themeLabel}` : `Theme: ${themeLabel}`
            }
            ref={triggerRef}
          />
        }
      >
        <CurrentIcon aria-hidden />
        <span className="sr-only">
          <LocalizedText en="Theme" es="Tema" />
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="min-w-36 border border-border"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <LocalizedText en="Theme" es="Tema" />
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={displayTheme}
            onValueChange={(value) => {
              if (isThemeValue(value)) {
                if (value !== displayTheme) {
                  setTheme(value);
                }
                setOpen(false);
              }
            }}
          >
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const selected = option.value === displayTheme;

              return (
                <DropdownMenuRadioItem
                  key={option.value}
                  value={option.value}
                  className={cn(
                    "min-h-11 px-2 pr-8",
                    selected && "bg-muted text-foreground",
                  )}
                >
                  <Icon aria-hidden />
                  <LocalizedText en={option.label} es={option.labelEs} />
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
