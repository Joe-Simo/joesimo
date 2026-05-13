import type { MetadataRoute } from "next";

import { siteDescription } from "@/lib/site-data";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Joe Simo",
    short_name: "Joe Simo",
    description: siteDescription,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fcfcfc",
    theme_color: "#08090a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
