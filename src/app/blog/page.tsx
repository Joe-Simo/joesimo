import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteIcon } from "@/components/site/site-icons";
import { blogPosts, socialChannels, type BlogPost } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing from Joe Simo on joesimo.com.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog / joesimo.com",
    description: "Writing from Joe Simo on joesimo.com.",
    url: "/blog",
  },
};

export default function BlogPage() {
  const posts: readonly BlogPost[] = blogPosts;
  const [featuredPost, ...supportingPosts] = posts;

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
              Blog
            </p>
            <h1>Writing from the work.</h1>
            <p>
              Notes about product bugs, interface work, systems thinking, and
              the real traces behind shipped projects.
            </p>
          </div>

          {featuredPost ? (
            <Link className="blog-feature-card" href={featuredPost.href}>
              <figure>
                <Image
                  alt={featuredPost.heroMedia.alt}
                  className="joe-cover-image"
                  fill
                  sizes="(max-width: 900px) calc(100vw - 2rem), 42vw"
                  src={featuredPost.heroMedia.src}
                />
              </figure>
              <div>
                <p>{featuredPost.kicker}</p>
                <h2>{featuredPost.title}</h2>
                <p>{featuredPost.excerpt}</p>
                <span>
                  Read post
                  <SiteIcon aria-hidden iconKey="arrowUpRight" />
                </span>
              </div>
            </Link>
          ) : null}

          {supportingPosts.length ? (
            <div className="blog-list" aria-label="All posts">
              {supportingPosts.map((post) => (
                <Link className="blog-list-row" href={post.href} key={post.slug}>
                  <div>
                    <p>{post.dateLabel}</p>
                    <h2>{post.title}</h2>
                  </div>
                  <span>{post.readingTime}</span>
                </Link>
              ))}
            </div>
          ) : null}
        </section>
      </main>

      <SiteFooter homeHref="/" socialChannels={socialChannels} />
    </div>
  );
}
