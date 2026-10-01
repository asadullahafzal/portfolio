import { featuredProjects, moreBuilds } from "@/data/profile";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/motion/Reveal";
import { ArrowUpRightIcon, GitHubIcon } from "@/components/ui/Icons";

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
          intro="These aren't class assignments. They're in production right now, serving publishers, creators and readers worldwide."
        />

        <div className="space-y-6">
          {featuredProjects.map((p, i) => (
            <Reveal as="article" key={p.slug} className="card card-hover relative overflow-hidden p-6 sm:p-10">
              <div aria-hidden className="absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
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
                </div>

                <div className="flex flex-col justify-between gap-6">
                  {p.metrics ? (
                    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
                      {p.metrics.map((m) => (
                        <div key={m.label} className="bg-surface p-5">
                          <dt className="sr-only">{m.label}</dt>
                          <dd className="font-display text-2xl font-semibold text-ink sm:text-3xl">{m.value}</dd>
                          <dd className="mt-1 text-sm text-muted">{m.label}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <div
                      aria-hidden
                      className="bg-grid relative hidden min-h-48 flex-1 rounded-2xl border border-line lg:block"
                    >
                      <span className="absolute inset-0 grid place-items-center font-display text-6xl font-bold text-white/5">
                        {p.name.split(" ").map((w) => w[0]).join("")}
                      </span>
                    </div>
                  )}
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noopener" className="btn btn-ghost w-fit">
                      Visit {hostname(p.url)} <ArrowUpRightIcon width={16} height={16} />
                    </a>
                  )}
                </div>
              </div>
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
