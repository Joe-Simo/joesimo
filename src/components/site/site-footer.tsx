"use client";

import { LocalizedText } from "@/components/site/localized-text";

export function SiteFooter({
  homeHref = "#joe",
}: {
  homeHref?: string;
  sectionPrefix?: string;
}) {
  return (
    <footer className="site-footer-shell">
      <a
        href={homeHref}
        className="site-footer-home"
      >
        Joe Simo
      </a>
      <p>
        <LocalizedText
          en="Built and maintained on joesimo.com."
          es="Creado y mantenido en joesimo.com."
        />
      </p>
    </footer>
  );
}
