"use client";

import { useEffect, useRef } from "react";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { LocalizedText as T } from "@/components/site/localized-text";
import { useSiteLanguage } from "@/components/site/use-site-language";
import { Button, ButtonLink } from "@/components/ui/button";
import "./globals.css";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const language = useSiteLanguage();
  const retryButtonRef = useRef<HTMLButtonElement>(null);
  const digest = error.digest;

  useEffect(() => {
    retryButtonRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <html
      lang={language}
      data-language={language}
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <title>Joe Simo / Error</title>
      </head>
      <body>
        <main className="grid min-h-screen place-items-center bg-background px-5 text-foreground">
          <section className="grid max-w-xl gap-6">
            <p className="text-label-12-mono uppercase text-muted-foreground">
              <T en="500 / Error" es="500 / Error" />
            </p>
            <h1 className="text-heading-48">
              <T en="Could Not Load Page" es="No se pudo cargar la página" />
            </h1>
            <p className="text-copy-14 text-muted-foreground">
              <T
                en="Try the request again. If it keeps failing, return home and use the direct sections."
                es="Intenta la solicitud otra vez. Si sigue fallando, vuelve al inicio y usa las secciones directas."
              />
            </p>
            {digest ? (
              <details className="material-base p-3 text-copy-13 text-muted-foreground">
                <summary className="cursor-pointer text-label-13 text-foreground">
                  <T en="Error reference" es="Referencia del error" />
                </summary>
                <code className="mt-2 block break-all text-copy-13-mono">
                  {digest}
                </code>
              </details>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => unstable_retry()}
                ref={retryButtonRef}
                type="button"
              >
                <T en="Try Again" es="Intentar de nuevo" />
              </Button>
              <ButtonLink href="/" variant="outline">
                <T en="Home" es="Inicio" />
              </ButtonLink>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
