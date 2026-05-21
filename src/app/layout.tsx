import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { ThemeMeta } from "@/components/site/theme-meta";
import { ThemeProvider } from "@/components/site/theme-provider";
import {
  joeProfile,
  projectCaseStudies,
  siteDescription,
  socialChannels,
} from "@/lib/site-data";
import "./globals.css";

const geistPixelSquare = localFont({
  src: "./fonts/GeistPixel-Square.woff2",
  variable: "--font-geist-pixel-square",
  weight: "500",
  fallback: [
    "Geist Mono",
    "ui-monospace",
    "SFMono-Regular",
    "Menlo",
    "Monaco",
    "monospace",
  ],
  adjustFontFallback: false,
});

const siteUrl = "https://joesimo.com";
const siteName = "joesimo.com";
const personName = joeProfile.name;
const siteTitle = `${personName} / ${siteName}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  applicationName: siteName,
  authors: [{ name: personName, url: siteUrl }],
  creator: personName,
  publisher: personName,
  title: {
    default: siteTitle,
    template: `%s / ${siteName}`,
  },
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: siteTitle,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@joesimo",
    title: siteTitle,
    description: siteDescription,
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${siteUrl}/#person`,
  name: personName,
  url: siteUrl,
  description: siteDescription,
  jobTitle: "Devsigner",
  mainEntityOfPage: siteUrl,
  knowsLanguage: ["English", "Spanish"],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Fort Myers",
    addressRegion: "FL",
    addressCountry: "US",
  },
  sameAs: socialChannels
    .filter((channel) => channel.href.startsWith("http"))
    .map((channel) => channel.href),
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  name: siteName,
  url: siteUrl,
  inLanguage: "en",
  author: {
    "@id": `${siteUrl}/#person`,
  },
  publisher: {
    "@id": `${siteUrl}/#person`,
  },
  description: siteDescription,
};

const creativeWorkJsonLd = projectCaseStudies.map((project) => ({
  "@context": "https://schema.org",
  "@type": project.schemaType,
  "@id": `${siteUrl}/#work-${project.slug}`,
  name: project.title,
  url: `${siteUrl}/#work-${project.slug}`,
  description: project.summary,
  applicationCategory: project.applicationCategory,
  image: project.assets[0]?.media.src
    ? `${siteUrl}${project.assets[0].media.src}`
    : undefined,
  author: {
    "@id": `${siteUrl}/#person`,
  },
  creator: {
    "@id": `${siteUrl}/#person`,
  },
}));

const jsonLd = [personJsonLd, websiteJsonLd, ...creativeWorkJsonLd];

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfb" },
    { media: "(prefers-color-scheme: dark)", color: "#08090a" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} ${geistPixelSquare.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          nonce={nonce}
        >
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
            }}
          />
          <ThemeMeta />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
