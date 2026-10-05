import Link from "next/link";
import { featuredProjects, moreBuilds } from "@/data/profile";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/motion/Reveal";
import Spotlight from "@/components/motion/Spotlight";
import { ArrowUpRightIcon, GitHubIcon } from "@/components/ui/Icons";
import ProjectPreview from "./ProjectPreview";

const hostname = (url: string) => new URL(url).hostname;

export default function Projects() {
  return (
    <section id="projects" className="relative scroll-mt-16 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          index="04"
          eyebrow="Projects"
          title={
            <>
              Live products, <span className="text-gradient">real users.</span>
            </>
          }
          intro="These aren't class assignments. They're live products built for publishers, creators and readers worldwide."
        />

        <div className="space-y-8">
          {featuredProjects.map((p, i) => (
            <Reveal key={p.slug}>
              <Spotlight as="article" className="card overflow-hidden p-6 sm:p-10">
                <div aria-hidden className="absolute -right-24 -top-24 -z-10 size-72 rounded-full bg-primary/10 blur-3xl" />
                <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
                  {/* Alternate the preview left/right on desktop */}
                  <div className={i % 2 ? "lg:order-2" : ""}>
                    <ProjectPreview project={p} />
                    {p.metrics && (
                      <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
                        {p.metrics.map((m) => (
                          <div key={m.label} className="bg-surface px-4 py-3.5">
                            <dt className="sr-only">{m.label}</dt>
                            <dd className="font-display text-xl font-semibold text-ink">{m.value}</dd>
                            <dd className="mt-0.5 text-xs text-muted">{m.label}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>

                  <div>
                    <p className="font-mono text-xs text-faint">
                      {String(i + 1).padStart(2, "0")} · {p.role}
                    </p>
                    <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{p.name}</h3>
                    <p className="mt-2 text-accent">{p.tagline}</p>
                    <p className="mt-5 leading-relaxed text-muted">{p.description}</p>
                    <ul className="mt-6 space-y-2.5 text-[0.95rem] text-muted">
                      {p.highlights.map((h) => (
                        <li key={h} className="flex gap-3">
                          <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                          {h}
                        </li>
                      ))}
                    </ul>
                    <ul className="mt-7 flex flex-wrap gap-2">
                      {p.tech.map((t) => (
                        <li key={t} className="chip">
                          {t}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <Link href={`/projects/${p.slug}`} className="btn btn-primary">
                        Read case study <span aria-hidden>→</span>
                      </Link>
                      {p.url && !p.offline && (
                        <a href={p.url} target="_blank" rel="noopener" className="btn btn-ghost">
                          Visit {hostname(p.url)} <ArrowUpRightIcon width={16} height={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Spotlight>
            </Reveal>
          ))}
        </div>

        <Reveal className="mb-6 mt-20 flex items-end justify-between gap-4">
          <h3 className="font-display text-2xl font-semibold text-ink">More builds</h3>
          <p className="hidden text-sm text-muted sm:block">C++, systems, data structures and more</p>
        </Reveal>
        <Reveal stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {moreBuilds.map((p) => (
            <a
              key={p.slug}
              href={p.repo}
              target="_blank"
              rel="noopener"
              className="card card-hover group flex flex-col p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <h4 className="font-display text-lg font-semibold text-ink">{p.name}</h4>
                <GitHubIcon className="shrink-0 text-faint transition group-hover:text-accent" />
              </div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{p.tagline}</p>
              <p className="mt-4 font-mono text-xs text-faint">{p.tech.join(" · ")}</p>
            </a>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
