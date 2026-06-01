import type { Metadata } from "next";

import { LocalizedText as T } from "@/components/site/localized-text";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Blog",
  description: "Short writing from Joe Simo on joesimo.com.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog / joesimo.com",
    description: "Short writing from Joe Simo on joesimo.com.",
    url: "/blog",
  },
};

export default function BlogPage() {
  return (
    <div id="top" className="min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:border focus:border-border focus:bg-background focus:px-4 focus:py-3 focus:font-mono focus:text-xs focus:uppercase focus:tracking-[0.16em] focus:text-foreground focus:shadow-lg"
      >
        Skip to content
      </a>

      <SiteHeader homeHref="/" sectionPrefix="/" activeHref="/blog" />

      <main
        id="main-content"
        tabIndex={-1}
        className="blog-page outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
      >
        <section className="site-page-shell blog-page-shell">
          <div className="blog-page-heading">
            <p className="text-label-12-mono uppercase text-muted-foreground">
              <T en="Blog" es="Blog" />
            </p>
            <h1>
              <T en="Blog" es="Blog" />
            </h1>
            <p>
              <T
                en="Writing belongs here on joesimo.com. External channels can point back here, but the canonical home for posts is this route."
                es="La escritura pertenece aquí, en joesimo.com. Los canales externos pueden apuntar aquí, pero la casa canónica de los posts es esta ruta."
              />
            </p>
          </div>

          <div className="blog-empty-state" role="status">
            <div>
              <h2>
                <T en="No public posts yet" es="Todavía no hay posts públicos" />
              </h2>
              <p>
                <T
                  en="The next real note will appear here before it is linked elsewhere."
                  es="La próxima nota real aparecerá aquí antes de enlazarse en otro lugar."
                />
              </p>
            </div>
            <ButtonLink href="/#work" variant="outline">
              <T en="View work" es="Ver trabajo" />
            </ButtonLink>
          </div>
        </section>
      </main>

      <SiteFooter homeHref="/" />
    </div>
  );
}
