"use client";

import { LocalizedText } from "@/components/site/localized-text";
import { SiteIcon } from "@/components/site/site-icons";
import type { SocialChannel } from "@/lib/site-data";

export function SiteFooter({
  homeHref = "#joe",
  socialChannels = [],
}: {
  homeHref?: string;
  sectionPrefix?: string;
  socialChannels?: readonly SocialChannel[];
}) {
  return (
    <footer
      id="contact"
      aria-label="Contact links"
      className="site-footer-shell"
    >
      <a
        href={homeHref}
        className="site-footer-home"
      >
        Joe Simo
      </a>
      {socialChannels.length ? (
        <nav
          aria-label="Social links"
          className="site-footer-social"
        >
          {socialChannels.map((channel) => (
            <a
              href={channel.href}
              key={channel.label}
              rel="noopener noreferrer"
              target="_blank"
            >
              <SiteIcon
                aria-hidden
                iconKey={channel.iconKey}
              />
              <span className="sr-only">
                <LocalizedText
                  en={`${channel.label} ${channel.handle}, opens in a new tab`}
                  es={`${channel.label} ${channel.handle}, abre en una pestaña nueva`}
                />
              </span>
            </a>
          ))}
        </nav>
      ) : null}
    </footer>
  );
}
