import { labProjects } from "@/data/profile";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/motion/Reveal";
import { GitHubIcon } from "@/components/ui/Icons";

// Phase 6 turns these cards into live, in-browser agent demos.
export default function AILab() {
  return (
    <section id="lab" className="relative scroll-mt-16 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          index="05"
          eyebrow="AI Lab"
          title={
            <>
              Agents that <span className="text-gradient">think for themselves.</span>
            </>
          }
          intro="AI projects covering logical reasoning, search and machine-learning pipelines. Interactive demos are coming soon, so you'll be able to watch them work in your browser."
        />

        <Reveal stagger className="grid gap-4 md:grid-cols-3">
          {labProjects.map((p) => (
            <article key={p.slug} className="card card-hover flex flex-col p-6 sm:p-7">
              <div className="relative mb-6 grid h-36 place-items-center overflow-hidden rounded-xl border border-line">
                <div aria-hidden className="bg-grid absolute inset-0" />
                <span className="relative chip !border-accent/40 !bg-accent/10 font-mono !text-xs text-accent">Live demo · soon</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-ink">{p.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{p.tagline}</p>
              <p className="mt-4 font-mono text-xs text-faint">{p.tech.join(" · ")}</p>
              {p.repo && (
                <a
                  href={p.repo}
                  target="_blank"
                  rel="noopener"
                  className="mt-5 inline-flex w-fit items-center gap-2 text-sm text-primary-soft transition hover:text-accent"
                >
                  <GitHubIcon width={16} height={16} /> View source
                </a>
              )}
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
