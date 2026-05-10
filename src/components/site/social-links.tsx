import { ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { channels } from "@/lib/site-data";

export function SocialLinks() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {channels.map((channel) => {
        const Icon = channel.icon;

        return (
          <a
            key={channel.label}
            href={channel.href}
            target="_blank"
            rel="noreferrer"
            className="group outline-none"
          >
            <Card className="h-full rounded-lg border-foreground/10 bg-background shadow-none transition duration-300 group-hover:-translate-y-0.5 group-hover:border-foreground/30 group-focus-visible:ring-3 group-focus-visible:ring-ring/50">
              <CardHeader className="grid grid-cols-[auto_1fr_auto] items-start gap-3">
                <span className="grid size-9 place-items-center rounded-lg border border-border text-foreground">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <CardTitle className="text-base">{channel.label}</CardTitle>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {channel.handle}
                  </p>
                </div>
                <ArrowUpRight
                  className="size-4 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                  aria-hidden="true"
                />
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  {channel.description}
                </p>
              </CardContent>
            </Card>
          </a>
        );
      })}
    </div>
  );
}
