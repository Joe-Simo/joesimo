"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="grid min-h-screen place-items-center bg-background px-5 text-foreground">
          <section className="grid max-w-xl gap-6">
            <p className="font-pixel text-[10px] uppercase text-muted-foreground">
              500 / Broken route
            </p>
            <h1 className="text-5xl font-medium leading-none tracking-normal">
              The signal dropped.
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Reload the route or go back to Joe Simo directly.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={reset}
                className="inline-flex min-h-11 items-center rounded-md border border-foreground bg-foreground px-4 text-sm font-medium text-background outline-none transition focus-visible:ring-3 focus-visible:ring-ring/35"
              >
                Try again
              </button>
              <Link
                href="/"
                className="inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm font-medium outline-none transition focus-visible:ring-3 focus-visible:ring-ring/35"
              >
                Home
              </Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
