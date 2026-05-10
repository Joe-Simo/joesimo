"use client";

import type { ComponentPropsWithoutRef } from "react";
import { Menu } from "lucide-react";

import { SiteIcon } from "@/components/site/site-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  contactLink,
  navItems,
  socialChannels,
  type IconKey,
  type SocialChannel,
} from "@/lib/site-data";
import { cn } from "@/lib/utils";

function isEmailExit(channel: SocialChannel) {
  return channel.href.startsWith("mailto:");
}

function iconForNavItem(href: string): IconKey {
  if (href === "#contact") {
    return contactLink.iconKey;
  }

  if (href === "#links") {
    return "arrowUpRight";
  }

  if (href === "#apps") {
    return "appWindow";
  }

  if (href === "#writing") {
    return "bookOpen";
  }

  return "briefcase";
}

export function MobileNav({
  className,
  ...props
}: ComponentPropsWithoutRef<"nav">) {
  return (
    <nav
      aria-label="Mobile navigation"
      className={cn("md:hidden", className)}
      {...props}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              aria-label="Open navigation menu"
            />
          }
        >
          <Menu aria-hidden />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" sideOffset={8} className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Navigate</DropdownMenuLabel>
            {navItems.map((item) => (
              <DropdownMenuItem
                key={item.href}
                render={<a href={item.href} />}
                className="py-2"
              >
                <SiteIcon iconKey={iconForNavItem(item.href)} aria-hidden />
                <span>{item.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuLabel>Profiles</DropdownMenuLabel>
            {socialChannels.map((channel) => (
              <DropdownMenuItem
                key={channel.label}
                render={
                  <a
                    href={channel.href}
                    target={isEmailExit(channel) ? undefined : "_blank"}
                    rel={isEmailExit(channel) ? undefined : "noreferrer"}
                  />
                }
                className="py-2"
              >
                <SiteIcon iconKey={channel.iconKey} aria-hidden />
                <span>{channel.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
