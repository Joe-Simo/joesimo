import { SiteIcon } from "@/components/site/site-icons";
import { socialChannels } from "@/lib/site-data";

export function SocialLinks() {
  return (
    <div className="grid border-y border-border sm:grid-cols-2 lg:grid-cols-3 lg:border-x">
      {socialChannels.map((channel) => (
        <a
          key={channel.label}
          href={channel.href}
          target={channel.href.startsWith("mailto:") ? undefined : "_blank"}
          rel={channel.href.startsWith("mailto:") ? undefined : "noreferrer"}
          className="group grid min-h-32 grid-cols-[auto_1fr_auto] items-start gap-3 border-b border-border p-4 outline-none transition hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/30 last:border-b-0 sm:[&:nth-child(2n)]:border-l lg:border-b-0 lg:border-l lg:[&:nth-child(3n+1)]:border-l-0 lg:[&:nth-child(n+4)]:border-t"
        >
          <span className="grid size-9 place-items-center rounded-md border border-border bg-background text-foreground transition group-hover:border-foreground/35">
            <SiteIcon iconKey={channel.iconKey} aria-hidden />
          </span>

          <span className="min-w-0">
            <span className="block text-sm font-medium">{channel.label}</span>
            <span className="block truncate font-mono text-xs text-muted-foreground">
              {channel.handle}
            </span>
            <span className="mt-3 block text-sm text-muted-foreground">
              {channel.description}
            </span>
          </span>

          <SiteIcon
            iconKey="arrowUpRight"
            className="text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
            aria-hidden
          />
        </a>
      ))}
    </div>
  );
}
