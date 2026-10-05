"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { labProjects } from "@/data/profile";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/motion/Reveal";
import { GitHubIcon } from "@/components/ui/Icons";

// Demos are client-only and load when the section approaches the viewport
const loading = () => <div className="h-[28rem] animate-pulse rounded-xl bg-surface/60" />;
const WumpusDemo = dynamic(() => import("@/components/lab/WumpusDemo"), { ssr: false, loading });
const PathfindingDemo = dynamic(() => import("@/components/lab/PathfindingDemo"), { ssr: false, loading });

const DEMOS = [
  {
    slug: "wumpus-logic-agent",
    tab: "Wumpus World",
    title: "Knowledge-based logic agent",
    blurb:
      "The agent keeps a propositional knowledge base in CNF. Before every move it asks whether the next cell is free of pits and the Wumpus, and proves it with resolution refutation. If it can't prove a cell safe, it won't step there.",
    Demo: WumpusDemo,
  },
  {
    slug: "dynamic-pathfinding-agent",
    tab: "Pathfinding",
    title: "Dynamic pathfinding agent",
    blurb:
      "Informed search on a grid with A* and Greedy Best-First, using the Manhattan heuristic. Turn on dynamic obstacles and walls appear while the agent walks, so it re-plans from wherever it stands.",
    Demo: PathfindingDemo,
  },
] as const;

export default function AILab() {
  const [active, setActive] = useState(0);
  const [near, setNear] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const demo = DEMOS[active];
  const project = labProjects.find((p) => p.slug === demo.slug);
  const others = labProjects.filter((p) => !DEMOS.some((d) => d.slug === p.slug));

  return (
    <section ref={sectionRef} id="lab" className="relative scroll-mt-16 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          index="05"
          eyebrow="AI Lab"
          title={
            <>
              Agents that <span className="text-gradient">think for themselves.</span>
            </>
          }
          intro="Don't take my word for it: run them. Both demos run my agents' logic live in your browser."
        />

        <Reveal className="card overflow-hidden">
          {/* Tabs */}
          <div role="tablist" aria-label="AI demos" className="flex border-b border-line">
            {DEMOS.map((d, i) => (
              <button
                key={d.slug}
                role="tab"
                id={`lab-tab-${i}`}
                aria-selected={active === i}
                aria-controls="lab-panel"
                onClick={() => setActive(i)}
                className={`relative flex-1 px-4 py-4 font-display text-sm font-semibold transition sm:flex-none sm:px-8 sm:text-base ${
                  active === i ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {d.tab}
                {active === i && <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-primary to-accent" />}
              </button>
            ))}
          </div>

          <div id="lab-panel" role="tabpanel" aria-labelledby={`lab-tab-${active}`} className="p-5 sm:p-8">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <h3 className="font-display text-xl font-semibold text-ink sm:text-2xl">{demo.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">{demo.blurb}</p>
              </div>
              {project?.repo && (
                <a href={project.repo} target="_blank" rel="noopener" className="btn btn-ghost !px-4 !py-2 text-sm">
                  <GitHubIcon width={16} height={16} /> Source
                </a>
              )}
            </div>
            {near ? <demo.Demo key={demo.slug} /> : loading()}
          </div>
        </Reveal>

        {others.length > 0 && (
          <Reveal stagger className="mt-6 grid gap-4 md:grid-cols-2">
            {others.map((p) => (
              <article key={p.slug} className="card card-hover flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">{p.name}</h3>
                  <p className="mt-1 text-sm text-muted">{p.tagline}</p>
                  <p className="mt-2 font-mono text-xs text-faint">{p.tech.join(" · ")}</p>
                </div>
                {p.repo && (
                  <a href={p.repo} target="_blank" rel="noopener" className="inline-flex shrink-0 items-center gap-2 text-sm text-primary-soft transition hover:text-accent">
                    <GitHubIcon width={16} height={16} /> View source
                  </a>
                )}
              </article>
            ))}
          </Reveal>
        )}
      </div>
    </section>
  );
}
