import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getPost, getPosts } from "@/lib/blog";
import { profile, site } from "@/data/profile";
import Reveal from "@/components/motion/Reveal";
import AskAIButton from "@/components/chat/AskAIButton";
import { LinkedInIcon } from "@/components/ui/Icons";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  const url = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: profile.name, url: site.url }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [site.url],
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
  };
}

export default async function BlogPost({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const posts = await getPosts();
  const others = posts.filter((p) => p.slug !== post.slug).slice(0, 2);
  const url = `${site.url}/blog/${post.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      url,
      mainEntityOfPage: url,
      image: `${url}/opengraph-image`,
      datePublished: post.date,
      dateModified: post.updated ?? post.date,
      keywords: post.tags.join(", "),
      author: { "@type": "Person", "@id": `${site.url}/#person`, name: profile.name, url: site.url },
      publisher: { "@id": `${site.url}/#person` },
      isPartOf: { "@id": `${site.url}/blog#blog` },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${site.url}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];

  return (
    <main id="main" className="relative overflow-hidden pt-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem]">
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="absolute -top-48 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />
      </div>

      <article className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <header className="mx-auto max-w-3xl pb-10 pt-14 sm:pt-20">
          <nav aria-label="Breadcrumb" className="mb-8 font-mono text-xs text-faint">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="transition hover:text-accent">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/blog" className="transition hover:text-accent">
                  Blog
                </Link>
              </li>
            </ol>
          </nav>
          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl">{post.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">{post.description}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4 border-y border-line py-4">
            <Image src={profile.photo} alt="" width={44} height={44} className="size-11 rounded-full object-cover object-top" />
            <div className="text-sm">
              <p className="text-ink">{profile.name}</p>
              <p className="text-faint">
                <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readingMinutes} min read
              </p>
            </div>
            <div className="ml-auto flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <span key={t} className="chip !text-xs">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* Article centred under the header (48rem = max-w-3xl); contents list in the right gutter */}
        <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,48rem)_minmax(0,1fr)]">
          <div
            className="article prose prose-lg mx-auto w-full max-w-3xl xl:col-start-2"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

          {post.headings.length > 2 && (
            <aside className="hidden max-w-56 xl:block">
              <nav aria-label="On this page" className="sticky top-24">
                <p className="eyebrow mb-3 !text-[10px]">On this page</p>
                <ul className="space-y-2 border-l border-line text-sm">
                  {post.headings.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`} className="-ml-px block border-l border-transparent pl-4 text-muted transition hover:border-accent hover:text-ink">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          )}
        </div>

        {/* Author + share */}
        <Reveal className="card mx-auto mt-16 flex max-w-3xl flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
          <Image src={profile.photo} alt={profile.name} width={72} height={72} className="size-16 shrink-0 rounded-2xl object-cover object-top" />
          <div className="flex-1">
            <p className="font-display text-lg font-semibold text-ink">Written by {profile.name}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {profile.roles.join(" · ")}. {profile.tagline}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener"
              className="btn btn-ghost !px-4 !py-2 text-sm"
            >
              <LinkedInIcon width={15} height={15} /> Share
            </a>
            <AskAIButton className="btn btn-ghost !px-4 !py-2 text-sm" />
          </div>
        </Reveal>

        {others.length > 0 && (
          <section className="mx-auto mt-16 max-w-3xl">
            <h2 className="eyebrow mb-5">Keep reading</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {others.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="card card-hover group p-6">
                  <p className="font-mono text-xs text-faint">{p.readingMinutes} min read</p>
                  <p className="mt-2 font-display text-lg font-semibold leading-snug text-ink transition group-hover:text-accent">{p.title}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
