"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { profile, stats } from "@/data/profile";
import Counter from "@/components/motion/Counter";
import { ArrowUpRightIcon } from "@/components/ui/Icons";

gsap.registerPlugin(useGSAP);

export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  // Intro sequence on first load
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap
        .timeline({ defaults: { ease: "power3.out", duration: 1 } })
        .from("[data-intro='eyebrow']", { y: 16, autoAlpha: 0, duration: 0.7 })
        .from("[data-intro='name'] > span", { yPercent: 110, stagger: 0.08 }, "-=0.4")
        .from("[data-intro='roles'] > *", { y: 14, autoAlpha: 0, stagger: 0.06, duration: 0.6 }, "-=0.6")
        .from("[data-intro='tagline']", { y: 16, autoAlpha: 0 }, "-=0.5")
        .from("[data-intro='cta'] > *", { y: 16, autoAlpha: 0, stagger: 0.08 }, "-=0.7")
        .from("[data-intro='stats'] > *", { y: 20, autoAlpha: 0, stagger: 0.08 }, "-=0.6");
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="top" className="relative isolate flex min-h-svh flex-col overflow-hidden pt-16">
      {/* Background — Phase 2 mounts the 3D neural network into #hero-scene */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0 opacity-60" />
        <div className="absolute -top-40 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[140px]" />
        <div className="absolute -right-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-accent/15 blur-[120px]" />
        <div className="absolute -left-40 bottom-0 h-[24rem] w-[24rem] rounded-full bg-violet/15 blur-[120px]" />
        <div id="hero-scene" className="absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-16 sm:px-6">
        <p data-intro="eyebrow" className="chip mb-8 w-fit">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-accent" />
          </span>
          {profile.availability}
        </p>

        <h1 data-intro="name" className="font-display text-[clamp(2.75rem,9vw,7.5rem)] font-bold leading-[0.95] tracking-tight">
          <span className="block overflow-hidden pb-2">
            <span className="block">Asadullah</span>
          </span>
          <span className="block overflow-hidden pb-2">
            <span className="text-gradient block">Afzal</span>
          </span>
        </h1>

        <p data-intro="roles" className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-sm text-muted sm:text-base">
          {profile.roles.map((role, i) => (
            <span key={role} className="flex items-center gap-3">
              {i > 0 && <span className="text-primary">◆</span>}
              <span className="text-ink">{role}</span>
            </span>
          ))}
        </p>

        <p data-intro="tagline" className="mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
          {profile.tagline} Currently building at <span className="text-ink">Dollar Tech</span> and studying CS at{" "}
          <span className="text-ink">FAST-NUCES</span>.
        </p>

        <div data-intro="cta" className="mt-10 flex flex-wrap gap-3">
          <a href="#projects" className="btn btn-primary">
            View my work <ArrowUpRightIcon width={16} height={16} />
          </a>
          <a href="#contact" className="btn btn-ghost">
            Get in touch
          </a>
        </div>

        <dl data-intro="stats" className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-bg/80 p-5 backdrop-blur sm:p-6">
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-3xl font-semibold text-ink sm:text-4xl">
                <Counter value={s.value} suffix={s.suffix} />
              </dd>
              <dd className="mt-1.5 text-xs leading-snug text-muted sm:text-sm">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
