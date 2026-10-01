import { skillGroups } from "@/data/profile";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/motion/Reveal";

export default function Skills() {
  return (
    <section id="skills" className="relative scroll-mt-16 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          index="02"
          eyebrow="Skills"
          title={
            <>
              One network, <span className="text-gradient">six specialties.</span>
            </>
          }
          intro="Full-stack engineering sits at the center, connected to SEO, AI, data and ad-tech. That's what lets me take a product from idea to revenue."
        />

        <Reveal stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((g, i) => (
            <article key={g.id} className="card card-hover group p-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-ink">{g.label}</h3>
                <span className="font-mono text-xs text-faint">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <ul className="flex flex-wrap gap-2">
                {g.skills.map((s) => (
                  <li key={s} className="chip transition group-hover:border-line-strong">
                    <span className="size-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
                    {s}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
