import Link from "next/link";

import { navItems, socialChannels } from "@/lib/site-data";

function ExternalCue({ show }: { show: boolean }) {
  return show ? <span className="sr-only">opens in a new tab</span> : null;
}

const footerLinks = [
  { href: "/#joe", label: "Joe" },
  ...navItems.map((item) => ({
    href: `/${item.href}`,
    label: item.label,
  })),
];

export function SiteFooter() {
  const footerSocialChannels = socialChannels.filter((channel) =>
    channel.href.startsWith("http"),
  );

  return (
    <footer className="site-footer-shell grid gap-5 border-t border-border py-8 text-sm text-muted-foreground lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div className="grid gap-1">
        <Link
          href="/#joe"
          className="inline-flex min-h-11 w-fit items-center rounded-md text-sm font-medium text-foreground outline-none transition hover:text-muted-foreground focus-visible:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/35"
        >
          Joe Simo
        </Link>
        <p>
          Fort Myers. Devsigner. Support, systems, web consulting,
          Telematics Engineering.
        </p>
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap gap-x-1.5 gap-y-1 pt-2 text-xs text-muted-foreground"
        >
          {footerLinks.map((link, index) => (
            <span className="inline-flex items-center gap-x-1.5" key={link.href}>
              {index > 0 ? <span aria-hidden>/</span> : null}
              <Link
                href={link.href}
                className="rounded-sm outline-none hover:text-foreground focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-ring/35"
              >
                {link.label}
              </Link>
            </span>
          ))}
        </nav>
      </div>
      <div className="flex flex-wrap gap-x-2 gap-y-2 sm:justify-end">
        {footerSocialChannels.map((channel) => (
          <a
            key={channel.label}
            href={channel.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 min-w-11 items-center rounded-md px-3 outline-none transition hover:text-foreground focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-ring/35"
          >
            {channel.label}
            <ExternalCue show />
          </a>
        ))}
      </div>
    </footer>
  );
}
