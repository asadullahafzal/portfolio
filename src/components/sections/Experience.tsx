import { experience } from "@/data/profile";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/motion/Reveal";

export default function Experience() {
  return (
    <section id="experience" className="relative scroll-mt-16 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          index="03"
          eyebrow="Experience"
          title={
            <>
              Building, ranking <span className="text-gradient">&amp; teaching.</span>
            </>
          }
        />

        <ol className="relative space-y-6 border-l border-line pl-6 sm:pl-10">
          {experience.map((job) => (
            <Reveal as="li" key={job.role} className="relative">
              <span
                aria-hidden
                className="absolute -left-[31px] top-7 size-3 rounded-full border-2 border-accent bg-bg shadow-[0_0_12px_var(--color-accent)] sm:-left-[47px]"
              />
              <article className="card p-6 sm:p-8">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-display text-xl font-semibold text-ink sm:text-2xl">{job.role}</h3>
                  <span className="font-mono text-sm text-accent">{job.period}</span>
                </div>
                <p className="mt-1 text-muted">{job.company}</p>

                <div className={job.video ? "mt-6 grid gap-6 lg:grid-cols-2 lg:items-start" : "mt-6"}>
                  <ul className="space-y-3 text-muted">
                    {job.points.map((p) => (
                      <li key={p} className="flex gap-3 leading-relaxed">
                        <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />
                        {p}
                      </li>
                    ))}
                  </ul>

                  {job.video && (
                    <figure>
                      <video
                        src={job.video}
                        controls
                        playsInline
                        preload="metadata"
                        className="aspect-video w-full rounded-xl border border-line bg-surface object-cover"
                      />
                      <figcaption className="mt-2 text-sm text-faint">Teaching an AI session at Dollar Tech</figcaption>
                    </figure>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
