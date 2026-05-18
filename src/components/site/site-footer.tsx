import Link from "next/link";

import { socialChannels } from "@/lib/site-data";

function ExternalCue({ show }: { show: boolean }) {
  return show ? <span className="sr-only">opens in a new tab</span> : null;
}

export function SiteFooter() {
  const footerSocialChannels = socialChannels.filter((channel) =>
    channel.href.startsWith("http"),
  );

  return (
    <footer className="site-footer-shell grid gap-5 border-t border-border py-8 text-sm text-muted-foreground lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div className="grid gap-1">
        <Link
          href="/#joe"
          className="inline-flex min-h-11 w-fit items-center rounded-md font-mono text-[10px] uppercase tracking-[0.2em] text-foreground outline-none transition hover:text-muted-foreground focus-visible:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/35"
        >
          Joe Simo
        </Link>
        <p>
          Fort Myers. Devsigner. Support, systems, web consulting,
          Telematics Engineering.
        </p>
        <span className="pt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {"Joe -> Portfolio -> Blog -> Socials"}
        </span>
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
