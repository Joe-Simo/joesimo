import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Writing status",
  description: "Current writing status from Joe Simo.",
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-12">
        <Button
          variant="ghost"
          render={<Link href="/" />}
          nativeButton={false}
          className="w-fit"
        >
          <ArrowLeft data-icon="inline-start" />
          Back home
        </Button>

        <section className="flex flex-col gap-5">
          <p className="font-pixel text-xs uppercase text-muted-foreground">
            joesimo.com
          </p>
          <h1 className="text-5xl font-semibold leading-none tracking-normal sm:text-6xl">
            Writing status
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            I have not published any writing here yet.
          </p>
        </section>

        <section className="grid gap-4 border-t border-border pt-6 text-sm leading-6 text-muted-foreground sm:grid-cols-[9rem_1fr]">
          <h2 className="font-pixel text-xs uppercase text-foreground">
            Status
          </h2>
          <p>No published writing yet.</p>

          <h2 className="font-pixel text-xs uppercase text-foreground">
            Next
          </h2>
          <p>I will add work here only when it is ready to stand on its own.</p>
        </section>
      </div>
    </main>
  );
}
