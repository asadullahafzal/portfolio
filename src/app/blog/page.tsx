import type { Metadata } from "next";
import Link from "next/link";
import { formatDate, getPosts } from "@/lib/blog";
import { profile, site } from "@/data/profile";
import Reveal from "@/components/motion/Reveal";
import SplitHeading from "@/components/motion/SplitHeading";

const description =
  "Engineering notes from building and shipping real products: full-stack development, SEO, AI agents, 3D on the web and self-hosting.";

export const metadata: Metadata = {
  title: "Blog",
  description,
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/blog/rss.xml" } },
  openGraph: { type: "website", url: "/blog", title: `Blog · ${site.name}`, description },
};

export default async function BlogIndex() {
  const posts = await getPosts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${site.url}/blog#blog`,
    url: `${site.url}/blog`,
    name: `${profile.name}'s blog`,
    description,
    author: { "@id": `${site.url}/#person` },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${site.url}/blog/${p.slug}`,
      datePublished: p.date,
    })),
  };

  return (
    <main id="main" className="relative overflow-hidden pt-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem]">
        <div className="bg-grid absolute inset-0 opacity-50" />
        <div className="absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-24 pt-16 sm:px-6 sm:pt-24">
        <Reveal>
          <p className="eyebrow mb-4">Blog</p>
        </Reveal>
        <SplitHeading as="h1" className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
          Notes from <span className="text-gradient">shipping real products.</span>
        </SplitHeading>
        <Reveal delay={0.15}>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{description}</p>
          <a href="/blog/rss.xml" className="mt-5 inline-flex items-center gap-2 font-mono text-xs text-faint transition hover:text-accent">
            <span className="size-1.5 rounded-full bg-amber-400" /> RSS feed
          </a>
        </Reveal>

        <div className="mt-14 space-y-5">
          {posts.length === 0 && <p className="text-muted">The first posts are on their way.</p>}
          {posts.map((post) => (
            <Reveal key={post.slug}>
              <article className="card card-hover group relative p-6 sm:p-8">
                <p className="font-mono text-xs text-faint">
                  <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readingMinutes} min read
                </p>
                <h2 className="mt-3 font-display text-2xl font-semibold leading-snug text-ink transition group-hover:text-accent sm:text-[1.7rem]">
                  {/* The whole card is clickable via this link's stretched hit area */}
                  <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:content-['']">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-3 leading-relaxed text-muted">{post.description}</p>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {post.tags.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                  <span className="ml-auto text-sm text-primary-soft transition group-hover:text-accent">Read →</span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  );
}
