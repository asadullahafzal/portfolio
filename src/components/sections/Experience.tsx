"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { experience } from "@/data/profile";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/motion/Reveal";
import Spotlight from "@/components/motion/Spotlight";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Experience() {
  const list = useRef<HTMLOListElement>(null);

  // The timeline fills as you scroll, and each dot lights up when its role reaches mid-screen
  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduced) {
        gsap.fromTo(
          "[data-timeline-fill]",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: list.current, start: "top 60%", end: "bottom 60%", scrub: true },
          },
        );
      }
      gsap.utils.toArray<HTMLElement>("[data-timeline-dot]").forEach((dot) => {
        ScrollTrigger.create({
          trigger: dot,
          start: "top 60%",
          toggleClass: { targets: dot, className: "is-active" },
          end: "max",
        });
      });
    },
    { scope: list },
  );

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

        <ol ref={list} className="relative space-y-6 pl-6 sm:pl-10">
          <span aria-hidden className="absolute bottom-0 left-0 top-0 w-px bg-line" />
          <span
            aria-hidden
            data-timeline-fill
            className="absolute bottom-0 left-0 top-0 w-px origin-top bg-gradient-to-b from-primary via-accent to-primary"
          />
          {experience.map((job) => (
            <Reveal as="li" key={job.role} className="relative">
              <span
                aria-hidden
                data-timeline-dot
                className="timeline-dot absolute -left-[30px] top-8 size-3 rounded-full border-2 border-line-strong bg-bg sm:-left-[46px]"
              />
              <Spotlight as="article" className="card p-6 sm:p-8">
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
              </Spotlight>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
