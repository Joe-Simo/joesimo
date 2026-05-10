import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, PencilLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing from Joe Simo.",
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
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
          <h1 className="text-5xl font-semibold leading-none tracking-normal sm:text-6xl">
            Blog.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            The route is ready for real posts. I did not add placeholder
            articles, fake dates, or sample reading times.
          </p>
        </section>

        <Card className="rounded-lg border-foreground/10 bg-muted/20 shadow-none">
          <CardHeader>
            <span className="grid size-10 place-items-center rounded-lg border border-border bg-background">
              <PencilLine className="size-4" aria-hidden="true" />
            </span>
            <CardTitle className="text-2xl font-semibold tracking-normal">
              No published posts yet.
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              When real writing exists, this page can render posts from MDX,
              a CMS, or a typed local content collection.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
