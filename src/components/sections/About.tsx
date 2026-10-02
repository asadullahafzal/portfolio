import Image from "next/image";
import { education, profile } from "@/data/profile";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/motion/Reveal";

export default function About() {
  return (
    <section id="about" className="relative scroll-mt-16 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          index="01"
          eyebrow="About"
          title={
            <>
              An engineer who builds products that <span className="text-gradient">both ship and rank.</span>
            </>
          }
        />

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <Reveal className="relative mx-auto w-full max-w-sm lg:max-w-none">
            <div aria-hidden className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/30 via-transparent to-accent/20 blur-2xl" />
            <div className="card overflow-hidden !rounded-[1.75rem] p-2">
              <Image
                src={profile.photo}
                alt={`Portrait of ${profile.name}`}
                width={1086}
                height={1448}
                sizes="(min-width: 1024px) 420px, 90vw"
                className="h-auto w-full rounded-[1.4rem]"
              />
            </div>
          </Reveal>

          <div>
            <Reveal stagger className="space-y-5 text-lg leading-relaxed text-muted">
              <p>
                I&apos;m <span className="text-ink">{profile.name}</span>, a full-stack engineer and SEO expert at{" "}
                <span className="text-ink">Dollar Tech</span>. I build and run live, revenue-generating products, from{" "}
                <span className="text-ink">CPC Point</span>, a real-time bidding ad network serving 40M+ impressions a
                month, to <span className="text-ink">The Dollar Tech</span>, a suite of free tools for creators.
              </p>
              <p>
                I care about the whole journey: architecture, clean code, deployment, and getting found on Google. A
                product nobody can find hasn&apos;t really shipped.
              </p>
              <p>
                I&apos;m also an <span className="text-ink">AI educator</span>. I&apos;ve trained 200+ students and
                business owners to use ChatGPT, Claude and n8n AI agents in their real work.
              </p>
            </Reveal>

            <Reveal className="card mt-10 p-6 sm:p-7">
              <p className="eyebrow mb-3">Education</p>
              <h3 className="font-display text-xl font-semibold text-ink">{education.degree}</h3>
              <p className="mt-1 text-muted">
                {education.school} <span className="text-faint">· {education.schoolFull}</span>
              </p>
              <p className="mt-1 font-mono text-sm text-accent">{education.period}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {education.coursework.map((c) => (
                  <li key={c} className="chip">
                    {c}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
