import Link from "next/link";
import { formatDate, getPosts } from "@/lib/blog";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/motion/Reveal";

// Latest blog posts on the home page (also strengthens internal links for SEO)
export default async function LatestPosts() {
  const posts = (await getPosts()).slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <section id="writing" className="relative scroll-mt-16 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            index="06"
            eyebrow="Writing"
            title={
              <>
                Notes from <span className="text-gradient">the build.</span>
              </>
            }
            intro="How things actually got built: the bugs, the trade-offs and the numbers."
          />
          <Reveal className="mb-12 sm:mb-16">
            <Link href="/blog" className="btn btn-ghost">
              All posts →
            </Link>
          </Reveal>
        </div>

        <Reveal stagger className="grid gap-4 md:grid-cols-3">
          {posts.map((p) => (
            <article key={p.slug} className="card card-hover group relative flex flex-col p-6">
              <p className="font-mono text-xs text-faint">
                <time dateTime={p.date}>{formatDate(p.date)}</time> · {p.readingMinutes} min
              </p>
              <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-ink transition group-hover:text-accent">
                <Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0 after:content-['']">
                  {p.title}
                </Link>
              </h3>
              <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">{p.description}</p>
              <p className="mt-4 font-mono text-xs text-faint">{p.tags.slice(0, 3).join(" · ")}</p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
