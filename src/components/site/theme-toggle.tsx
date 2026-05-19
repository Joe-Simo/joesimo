"use client";

import { useState, useSyncExternalStore } from "react";
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
import { cn } from "@/lib/utils";

const themeOptions = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
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

function subscribeToHydration() {
  return () => {};
}

function getHydratedSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
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
            aria-label={`Theme: ${currentOption.label}`}
          />
        }
      >
        <CurrentIcon aria-hidden />
        <span className="sr-only">Theme</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="min-w-36 border border-border"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={displayTheme}
            onValueChange={(value) => {
              if (isThemeValue(value)) {
                setTheme(value);
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
