import { socialChannels } from "@/lib/site-data";

function ExternalCue({ show }: { show: boolean }) {
  return show ? <span className="sr-only">opens in a new tab</span> : null;
}

export function SiteFooter() {
  return (
    <footer className="site-footer-shell grid gap-5 border-t border-border py-8 text-sm text-muted-foreground lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div className="grid gap-1">
        <a
          href="#joe"
          className="inline-flex min-h-11 w-fit items-center rounded-md font-mono text-[10px] uppercase tracking-[0.2em] text-foreground outline-none transition hover:text-muted-foreground focus-visible:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/35"
        >
          Joe Simo
        </a>
        <p>
          Fort Myers. Devsigner. Support, systems, web consulting,
          Telematics Engineering.
        </p>
        <span className="pt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {"Joe -> Breakage -> Signals -> Surface -> Trail -> Contact"}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-2 gap-y-2 sm:justify-end">
        {socialChannels.map((channel) => (
          <a
            key={channel.label}
            href={channel.href}
            target={channel.href.startsWith("mailto:") ? undefined : "_blank"}
            rel={channel.href.startsWith("mailto:") ? undefined : "noreferrer"}
            className="inline-flex min-h-11 min-w-11 items-center rounded-md px-3 outline-none transition hover:text-foreground focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-ring/35"
          >
            {channel.label}
            <ExternalCue show={!channel.href.startsWith("mailto:")} />
          </a>
        ))}
      </div>
    </footer>
  );
}
