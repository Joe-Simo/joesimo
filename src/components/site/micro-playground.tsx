"use client";

import { useMemo, useState } from "react";
import { Shuffle, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const modes = [
  {
    label: "Focus",
    tone: "Tight scope",
    message: "Trim the interface until the next move is obvious.",
  },
  {
    label: "Build",
    tone: "Useful first",
    message: "Make the real workflow work before polishing the edges.",
  },
  {
    label: "Ship",
    tone: "Public enough",
    message: "Cut the vague parts, keep the useful parts, publish.",
  },
  {
    label: "Write",
    tone: "Clear notes",
    message: "Explain the decision so future Joe does not file a complaint.",
  },
];

const excuses = [
  "The pixel was one off, emotionally.",
  "Localhost had a different personality after lunch.",
  "The deploy button blinked first.",
  "I named a file final-final-actual and needed a minute.",
  "The todo list became sentient as a spreadsheet.",
];

export function MicroPlayground() {
  const [activeMode, setActiveMode] = useState(0);
  const [excuseIndex, setExcuseIndex] = useState(0);

  const mode = modes[activeMode];
  const rotation = useMemo(() => activeMode * 90 - 35, [activeMode]);

  return (
    <section
      id="play"
      className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-10 sm:px-8 lg:px-10"
      aria-labelledby="play-heading"
    >
      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-lg border-foreground/10 bg-background shadow-none transition-transform duration-300 hover:-translate-y-0.5">
          <CardHeader className="gap-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle
                id="play-heading"
                className="max-w-md text-2xl font-semibold tracking-normal sm:text-3xl"
              >
                Interactive little workbench.
              </CardTitle>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      aria-label="Micro interaction note"
                      className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition hover:-translate-y-0.5 hover:text-foreground"
                    />
                  }
                >
                  <Sparkles />
                </TooltipTrigger>
                <TooltipContent>Small, useful motion only.</TooltipContent>
              </Tooltip>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Toggle the dial to change the page&apos;s working mood. It is
              intentionally small: enough feedback to feel alive, not enough to
              get in the way.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 md:grid-cols-[220px_1fr]">
              <div className="relative mx-auto aspect-square w-full max-w-52 rounded-full border border-border bg-muted/30 p-4">
                <div className="absolute inset-5 rounded-full border border-dashed border-foreground/20" />
                <div
                  className="absolute left-1/2 top-1/2 h-1/2 w-px origin-top bg-foreground transition-transform duration-500 ease-out"
                  style={{ transform: `rotate(${rotation}deg)` }}
                />
                <div className="absolute inset-0 grid place-items-center">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveMode((current) => (current + 1) % modes.length)
                    }
                    className="group grid size-24 place-items-center rounded-full border border-border bg-background text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-px"
                  >
                    <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Mode
                    </span>
                    <span className="text-lg font-semibold">{mode.label}</span>
                  </button>
                </div>
              </div>

              <div className="flex min-h-52 flex-col justify-between gap-5 rounded-lg border border-border bg-background p-5">
                <div className="flex flex-col gap-2">
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {mode.tone}
                  </p>
                  <p className="max-w-xl text-2xl font-semibold leading-tight tracking-normal">
                    {mode.message}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {modes.map((item, index) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setActiveMode(index)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-sm font-medium transition hover:-translate-y-0.5",
                        activeMode === index
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-foreground/10 bg-background shadow-none transition-transform duration-300 hover:-translate-y-0.5">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold tracking-normal">
              Tiny excuse generator.
            </CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              A harmless bit of portfolio nonsense for anyone reading too
              seriously.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="rounded-lg bg-foreground p-5 font-mono text-sm leading-7 text-background">
              <p>&gt; excuse loaded</p>
              <p>&gt; checking vibe...</p>
              <p className="mt-3 text-[var(--accent-blue)]">
                {excuses[excuseIndex]}
              </p>
            </div>
            <Button
              type="button"
              onClick={() =>
                setExcuseIndex((current) => (current + 1) % excuses.length)
              }
              className="h-10 w-full"
            >
              <Shuffle data-icon="inline-start" />
              Generate excuse
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="work" className="rounded-lg border border-border p-2">
        <TabsList className="w-full justify-start overflow-x-auto" variant="line">
          <TabsTrigger value="work">Work</TabsTrigger>
          <TabsTrigger value="apps">Apps</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
        </TabsList>
        <TabsContent value="work" className="p-3 text-sm text-muted-foreground">
          Case studies can live here once the real public work is selected.
        </TabsContent>
        <TabsContent value="apps" className="p-3 text-sm text-muted-foreground">
          The apps index is ready for real app names, links, and launch notes.
        </TabsContent>
        <TabsContent value="design" className="p-3 text-sm text-muted-foreground">
          Design snapshots should use actual interface screenshots, not filler.
        </TabsContent>
        <TabsContent value="blog" className="p-3 text-sm text-muted-foreground">
          Blog posts will render here after real posts are added.
        </TabsContent>
      </Tabs>
    </section>
  );
}
