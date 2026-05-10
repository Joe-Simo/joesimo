"use client";

import { useSyncExternalStore } from "react";
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
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            aria-label={`Theme: ${currentOption.label}`}
          />
        }
      >
        <CurrentIcon aria-hidden />
        <span className="sr-only">Theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={displayTheme}
            onValueChange={(value) => {
              if (isThemeValue(value)) {
                setTheme(value);
              }
            }}
          >
            {themeOptions.map((option) => {
              const Icon = option.icon;

              return (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
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
