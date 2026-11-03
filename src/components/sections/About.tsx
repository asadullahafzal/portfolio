import Image from "next/image";
import { education, profile, stats } from "@/data/profile";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/motion/Reveal";
import Tilt from "@/components/motion/Tilt";
import Counter from "@/components/motion/Counter";

export default function About() {
  return (
    <section id="about" className="relative scroll-mt-16 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-16">
        <SectionHeading eyebrow="Introduction" title="Overview." />

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          <div>
            <Reveal stagger className="space-y-5 text-[17px] leading-[30px] text-muted">
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
              <p className="eyebrow mb-3 !text-sm">Education</p>
              <h3 className="text-xl font-bold text-ink">{education.degree}</h3>
              <p className="mt-1 text-muted">
                {education.school} <span className="text-faint">· {education.schoolFull}</span>
              </p>
              <p className="mt-1 text-sm font-medium text-accent">{education.period}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {education.coursework.map((c) => (
                  <li key={c} className="chip">
                    {c}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal className="relative mx-auto w-full max-w-sm lg:max-w-none">
            <div className="card-gradient overflow-hidden p-2">
              <Image
                src={profile.photo}
                alt={`Portrait of ${profile.name}`}
                width={1086}
                height={1448}
                sizes="(min-width: 1024px) 420px, 90vw"
                className="h-auto w-full rounded-[14px]"
              />
            </div>
          </Reveal>
        </div>

        {/* Numbers as tilting gradient cards (the reference's service cards) */}
        <Reveal stagger className="mt-16 grid grid-cols-2 gap-5 sm:gap-8 lg:grid-cols-4">
          {stats.map((s) => (
            <Tilt key={s.label}>
              <div className="card-gradient flex min-h-[180px] flex-col items-center justify-center px-4 py-8 text-center sm:min-h-[220px]">
                <p className="text-4xl font-black text-ink sm:text-5xl">
                  <Counter value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-3 text-sm font-medium text-muted sm:text-base">{s.label}</p>
              </div>
            </Tilt>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
