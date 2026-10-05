import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { featuredProjects, profile, site } from "@/data/profile";
import ProjectPreview from "@/components/sections/ProjectPreview";
import Reveal from "@/components/motion/Reveal";
import SplitHeading from "@/components/motion/SplitHeading";
import { ArrowUpRightIcon } from "@/components/ui/Icons";

// Only the featured projects have case studies; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return featuredProjects.map((p) => ({ slug: p.slug }));
}

const findProject = (slug: string) => featuredProjects.find((p) => p.slug === slug);

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const project = findProject((await params).slug);
  if (!project) return {};
  const title = `${project.name}: ${project.tagline}`;
  return {
    title,
    description: project.description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: "article",
      url: `/projects/${project.slug}`,
      title,
      description: project.description,
      images: [{ url: project.image ?? profile.photo, alt: project.name }],
    },
    twitter: { card: "summary_large_image", title, description: project.description, images: [project.image ?? profile.photo] },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) notFound();

  const index = featuredProjects.indexOf(project);
  const next = featuredProjects[(index + 1) % featuredProjects.length];
  const pageUrl = `${site.url}/projects/${project.slug}`;
  const live = project.url && !project.offline;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: project.name,
      headline: project.tagline,
      description: project.description,
      url: pageUrl,
      ...(project.image && { image: `${site.url}${project.image}` }),
      ...(live && { sameAs: project.url }),
      keywords: project.tech.join(", "),
      author: { "@type": "Person", name: profile.name, url: site.url },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        { "@type": "ListItem", position: 2, name: "Projects", item: `${site.url}/#projects` },
        { "@type": "ListItem", position: 3, name: project.name, item: pageUrl },
      ],
    },
  ];

  return (
    <main id="main" className="relative overflow-hidden pt-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* Background glow */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem]">
        <div className="bg-grid absolute inset-0 opacity-50" />
        <div className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />
      </div>

      <article className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        {/* Header */}
        <header className="pb-12 pt-14 sm:pt-20">
          <Reveal>
            <nav aria-label="Breadcrumb" className="mb-8 font-mono text-xs text-faint">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="transition hover:text-accent">
                    Home
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li>
                  <Link href="/#projects" className="transition hover:text-accent">
                    Projects
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li aria-current="page" className="text-muted">
                  {project.name}
                </li>
              </ol>
            </nav>
            <p className="eyebrow mb-4">
              Case study <span className="text-faint">· {project.role}</span>
            </p>
          </Reveal>
          <SplitHeading as="h1" className="font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl">
            {project.name}
          </SplitHeading>
          <Reveal delay={0.15}>
            <p className="mt-4 text-xl text-accent sm:text-2xl">{project.tagline}</p>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{project.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {live && (
                <a href={project.url} target="_blank" rel="noopener" className="btn btn-primary">
                  Visit {new URL(project.url!).hostname} <ArrowUpRightIcon width={16} height={16} />
                </a>
              )}
              <Link href="/#projects" className="btn btn-ghost">
                ← All projects
              </Link>
            </div>
          </Reveal>
        </header>

        {/* Preview + metrics */}
        <Reveal>
          <div className={project.image ? "" : "mx-auto max-w-3xl"}>
            <ProjectPreview project={project} />
          </div>
        </Reveal>
        {project.metrics && (
          <Reveal stagger className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
            {project.metrics.map((m) => (
              <div key={m.label} className="bg-surface p-5 sm:p-6">
                <p className="font-display text-3xl font-semibold text-ink sm:text-4xl">{m.value}</p>
                <p className="mt-1 text-sm text-muted">{m.label}</p>
              </div>
            ))}
          </Reveal>
        )}

        {/* Body */}
        <div className="mt-20 grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Reveal className="card p-6">
              <h2 className="eyebrow mb-5">At a glance</h2>
              <dl className="space-y-5 text-sm">
                <div>
                  <dt className="text-faint">Role</dt>
                  <dd className="mt-1 text-ink">{project.role}</dd>
                </div>
                <div>
                  <dt className="text-faint">Focus</dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {project.tech.map((t) => (
                      <span key={t} className="chip">
                        {t}
                      </span>
                    ))}
                  </dd>
                </div>
                {project.url && (
                  <div>
                    <dt className="text-faint">Website</dt>
                    <dd className="mt-1">
                      {live ? (
                        <a href={project.url} target="_blank" rel="noopener" className="text-primary-soft transition hover:text-accent">
                          {new URL(project.url).hostname} ↗
                        </a>
                      ) : (
                        <span className="text-muted">{new URL(project.url).hostname} (temporarily offline)</span>
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            </Reveal>
          </aside>

          <div className="space-y-16">
            {project.caseStudy && (
              <section>
                <Reveal>
                  <p className="eyebrow mb-3">01 / The challenge</p>
                </Reveal>
                <Reveal delay={0.1}>
                  <p className="font-display text-2xl leading-snug text-ink sm:text-3xl">{project.caseStudy.challenge}</p>
                </Reveal>
              </section>
            )}

            {project.caseStudy && (
              <section>
                <Reveal>
                  <p className="eyebrow mb-3">02 / What I built</p>
                </Reveal>
                <Reveal as="ol" stagger className="space-y-3">
                  {project.caseStudy.approach.map((a, i) => (
                    <li key={a} className="card flex gap-4 p-5">
                      <span className="font-mono text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
                      <span className="leading-relaxed text-muted">{a}</span>
                    </li>
                  ))}
                </Reveal>
              </section>
            )}

            <section>
              <Reveal>
                <p className="eyebrow mb-3">03 / Key features</p>
              </Reveal>
              <Reveal as="ul" stagger className="grid gap-3 sm:grid-cols-2">
                {project.highlights.map((h) => (
                  <li key={h} className="flex gap-3 rounded-xl border border-line bg-surface/60 p-4 text-sm leading-relaxed text-muted">
                    <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
                    {h}
                  </li>
                ))}
              </Reveal>
            </section>

            {project.caseStudy?.outcome && (
              <section>
                <Reveal>
                  <p className="eyebrow mb-3">04 / The outcome</p>
                </Reveal>
                <Reveal delay={0.1} className="card relative overflow-hidden p-6 sm:p-8">
                  <div aria-hidden className="absolute -right-16 -top-16 size-56 rounded-full bg-primary/15 blur-3xl" />
                  <p className="relative text-lg leading-relaxed text-ink">{project.caseStudy.outcome}</p>
                </Reveal>
              </section>
            )}
          </div>
        </div>

        {/* Next project */}
        <Reveal className="mt-24">
          <Link
            href={`/projects/${next.slug}`}
            className="card card-hover group flex flex-col justify-between gap-6 p-8 sm:flex-row sm:items-center sm:p-10"
          >
            <div>
              <p className="eyebrow mb-2">Next case study</p>
              <p className="font-display text-3xl font-semibold text-ink sm:text-4xl">{next.name}</p>
              <p className="mt-1 text-muted">{next.tagline}</p>
            </div>
            <span className="grid size-14 shrink-0 place-items-center rounded-full border border-line-strong text-ink transition group-hover:border-accent group-hover:text-accent">
              <ArrowUpRightIcon width={22} height={22} />
            </span>
          </Link>
        </Reveal>
      </article>
    </main>
  );
}
