"use client";

import { type ComponentPropsWithoutRef, useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { SiteIcon } from "@/components/site/site-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { navItems, type NavHref } from "@/lib/site-data";
import { cn } from "@/lib/utils";

function resolveNavHref(href: NavHref, sectionPrefix: string) {
  return href.startsWith("#") ? `${sectionPrefix}${href}` : href;
}

function isInternalRouteHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

type MobileNavProps = ComponentPropsWithoutRef<"nav"> & {
  sectionPrefix?: string;
};

export function MobileNav({
  className,
  sectionPrefix = "",
  ...props
}: MobileNavProps) {
  const [activeHref, setActiveHref] = useState<NavHref | null>(null);

  useEffect(() => {
    if (sectionPrefix) {
      return;
    }

    const targets = navItems
      .map((item) => ({
        href: item.href,
        target: document.querySelector<HTMLElement>(item.href),
      }))
      .filter(
        (item): item is { href: NavHref; target: HTMLElement } =>
          Boolean(item.target),
      );

    function updateActiveHref() {
      const nextHref = navItems.find((item) => item.href === window.location.hash)
        ?.href;

      if (nextHref) {
        setActiveHref(nextHref);
        return;
      }

      const probeY = Math.min(window.innerHeight * 0.32, 240);
      const active = targets.find(({ target }) => {
        const rect = target.getBoundingClientRect();

        return rect.top <= probeY && rect.bottom > 72;
      });

      setActiveHref(active?.href ?? null);
    }

    let frame = 0;
    const scheduleUpdate = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateActiveHref();
      });
    };

    updateActiveHref();
    window.addEventListener("hashchange", scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [sectionPrefix]);

  return (
    <nav
      aria-label="Mobile navigation"
      className={cn("relative lg:hidden", className)}
      {...props}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              className="size-11"
              aria-label="Open navigation menu"
            />
          }
        >
          <Menu aria-hidden />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-56 border border-border"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>Navigate</DropdownMenuLabel>
            {navItems.map((item) => {
              const href = resolveNavHref(item.href, sectionPrefix);
              const active = item.href === activeHref;
              const content = (
                <>
                  <SiteIcon iconKey={item.iconKey} aria-hidden />
                  <span>{item.label}</span>
                </>
              );
              const itemClassName = "min-h-11 px-2";

              return isInternalRouteHref(href) ? (
                <DropdownMenuItem
                  key={item.href}
                  render={
                    <Link
                      href={href}
                      aria-current={active ? "location" : undefined}
                    />
                  }
                  className={itemClassName}
                >
                  {content}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  key={item.href}
                  render={
                    <a
                      href={href}
                      aria-current={active ? "location" : undefined}
                    />
                  }
                  className={itemClassName}
                >
                  {content}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
