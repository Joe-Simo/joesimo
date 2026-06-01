import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteIcon } from "@/components/site/site-icons";
import { ButtonLink } from "@/components/ui/button";
import {
  blogPosts,
  getBlogPost,
  socialChannels,
  type BlogPost,
  type BlogPostMedia,
} from "@/lib/site-data";

const siteUrl = "https://joesimo.com";
const fallbackOpenGraphImage = {
  url: new URL("/opengraph-image", siteUrl).toString(),
  width: 1200,
  height: 630,
  alt: "Joe Simo / joesimo.com",
};

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

function postSocialImage(post: BlogPost) {
  return {
    url: new URL(post.heroMedia.src, siteUrl).toString(),
    width: post.heroMedia.width,
    height: post.heroMedia.height,
    alt: post.heroMedia.alt,
  };
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const path = post.href;
  const socialImage = postSocialImage(post);

  return {
    alternates: {
      canonical: path,
    },
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      url: new URL(path, siteUrl).toString(),
      siteName: "joesimo.com",
      images: [socialImage ?? fallbackOpenGraphImage],
      locale: "en_US",
      type: "article",
      publishedTime: post.publishedAt,
      authors: [siteUrl],
      tags: [...post.tags],
    },
    twitter: {
      card: "summary_large_image",
      creator: "@joesimo",
      title: post.title,
      description: post.summary,
      images: [socialImage.url],
    },
  };
}

function BlogEvidenceFigure({ media }: { media: BlogPostMedia }) {
  return (
    <figure className="blog-evidence-figure">
      <div>
        <Image
          alt={media.alt}
          className="joe-cover-image"
          fill
          sizes="(max-width: 900px) calc(100vw - 2rem), 38vw"
          src={media.src}
        />
      </div>
      <figcaption>
        <span>{media.sourceLabel}</span>
        {media.caption}
      </figcaption>
    </figure>
  );
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div id="top" className="min-h-screen bg-background text-foreground">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-3 focus:text-sm focus:shadow-lg focus:ring-3 focus:ring-ring/35"
        href="#main-content"
      >
        Skip to content
      </a>

      <SiteHeader activeHref="/blog" homeHref="/" sectionPrefix="/" />

      <main className="blog-article" id="main-content" tabIndex={-1}>
        <article>
          <header className="blog-article-hero site-page-shell">
            <div className="blog-article-copy">
              <Link className="work-case-back" href="/blog">
                <SiteIcon aria-hidden iconKey="arrowUpRight" />
                Blog
              </Link>
              <p className="work-case-kicker">{post.kicker}</p>
              <h1>{post.title}</h1>
              <p>{post.summary}</p>
              <dl className="blog-article-meta">
                <div>
                  <dt>Published</dt>
                  <dd>
                    <time dateTime={post.publishedAt}>{post.dateLabel}</time>
                  </dd>
                </div>
                <div>
                  <dt>Read</dt>
                  <dd>{post.readingTime}</dd>
                </div>
              </dl>
              <div className="work-case-actions">
                <ButtonLink
                  href={post.videoHref}
                  rel="noreferrer"
                  target="_blank"
                  variant="default"
                >
                  {post.videoLabel}
                  <SiteIcon aria-hidden iconKey="youtube" />
                  <span className="sr-only">opens in a new tab</span>
                </ButtonLink>
              </div>
            </div>
            <BlogEvidenceFigure media={post.heroMedia} />
          </header>

          <section className="blog-article-section site-page-shell">
            <div className="blog-article-section-head">
              <p>Summary</p>
              <h2>What happened</h2>
            </div>
            <dl className="blog-fact-grid">
              {post.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="blog-article-section site-page-shell">
            <div className="blog-article-section-head">
              <p>Timeline</p>
              <h2>From proof to fix confirmation.</h2>
            </div>
            <ol className="blog-timeline">
              {post.timeline.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <p>{item.value}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="blog-article-section blog-article-body site-page-shell">
            {post.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
          </section>

          <section className="blog-article-section site-page-shell">
            <div className="blog-article-section-head">
              <p>Evidence</p>
              <h2>Private proof, public story.</h2>
            </div>
            <div className="blog-gallery">
              {post.gallery.map((media) => (
                <BlogEvidenceFigure media={media} key={media.src} />
              ))}
            </div>
          </section>

          <section className="blog-article-section blog-disclosure-note site-page-shell">
            <div>
              <h2>Disclosure note</h2>
              <p>
                This post intentionally leaves out active credentials and avoids
                turning the report into a step-by-step exploit guide. The public
                point is the responsible disclosure process and the confirmed
                fix path, not the abuse path.
              </p>
            </div>
          </section>
        </article>
      </main>

      <SiteFooter
        homeHref="/"
        sectionPrefix="/"
        socialChannels={socialChannels}
      />
    </div>
  );
}
