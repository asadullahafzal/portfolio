"use client";

import { useEffect, useRef, useState } from "react";
import type { SkillGroup } from "@/data/profile";
import Spotlight from "@/components/motion/Spotlight";

const CORE_ID = "fullstack";

// Desktop layout: the full-stack core in the middle, specialties around it.
const PLACEMENT: Record<string, string> = {
  fullstack: "lg:col-start-2 lg:row-start-1 lg:row-span-2",
  ai: "lg:col-start-1 lg:row-start-1",
  adtech: "lg:col-start-1 lg:row-start-2",
  seo: "lg:col-start-3 lg:row-start-1",
  data: "lg:col-start-3 lg:row-start-2",
  languages: "lg:col-start-2 lg:row-start-3",
};

type Connector = { id: string; d: string };

// Curved path from the core card's edge to the edge of a specialty card facing it.
function connectorPath(core: DOMRect, card: DOMRect, origin: DOMRect) {
  const ox = origin.left;
  const oy = origin.top;
  const cy = card.top + card.height / 2;
  if (card.top >= core.bottom - 1) {
    const x = card.left + card.width / 2 - ox;
    return `M ${x} ${core.bottom - oy} L ${x} ${card.top - oy}`;
  }
  const y = Math.min(Math.max(cy, core.top + 28), core.bottom - 28);
  const leftSide = card.right <= core.left;
  const sx = (leftSide ? core.left : core.right) - ox;
  const ex = (leftSide ? card.right : card.left) - ox;
  const mx = (sx + ex) / 2;
  return `M ${sx} ${y - oy} C ${mx} ${y - oy}, ${mx} ${cy - oy}, ${ex} ${cy - oy}`;
}

export default function SkillsNetwork({ groups }: { groups: SkillGroup[] }) {
  const container = useRef<HTMLDivElement>(null);
  const cards = useRef<Record<string, HTMLElement | null>>({});
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [drawn, setDrawn] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [animate, setAnimate] = useState(true);

  // Measure card positions and rebuild the connectors whenever the layout changes
  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const measure = () => {
      const core = cards.current[CORE_ID];
      if (!desktop.matches || !core) return setConnectors([]);
      const origin = el.getBoundingClientRect();
      const coreRect = core.getBoundingClientRect();
      setConnectors(
        groups
          .filter((g) => g.id !== CORE_ID && cards.current[g.id])
          .map((g) => ({ id: g.id, d: connectorPath(coreRect, cards.current[g.id]!.getBoundingClientRect(), origin) })),
      );
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    desktop.addEventListener("change", measure);
    return () => {
      ro.disconnect();
      desktop.removeEventListener("change", measure);
    };
  }, [groups]);

  // Draw the connectors the first time the diagram scrolls into view
  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setAnimate(!reduced);
        setDrawn(true);
        io.disconnect();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={container} className="relative">
      <svg aria-hidden className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible lg:block">
        <defs>
          {/* userSpaceOnUse: a bounding-box gradient can't paint perfectly straight (zero-height/width) lines */}
          <linearGradient id="connector-gradient" gradientUnits="userSpaceOnUse" x1="0" x2="100%" y1="0" y2="100%">
            <stop offset="0%" stopColor="var(--color-accent)" />
            <stop offset="50%" stopColor="var(--color-primary-soft)" />
            <stop offset="100%" stopColor="var(--color-accent)" />
          </linearGradient>
        </defs>
        {connectors.map((c, i) => {
          const dim = hovered !== null && hovered !== CORE_ID && hovered !== c.id;
          return (
            <g key={c.id} style={{ opacity: dim ? 0.2 : 1, transition: "opacity 0.3s" }}>
              <path
                d={c.d}
                pathLength={1}
                fill="none"
                stroke="url(#connector-gradient)"
                strokeWidth={1.75}
                className={`connector ${drawn ? "is-drawn" : ""}`}
                style={{ transitionDelay: `${i * 0.12}s` }}
              />
              {drawn && animate && (
                <circle r={3} fill="var(--color-accent)" style={{ filter: "drop-shadow(0 0 6px var(--color-accent))" }}>
                  <animateMotion dur={`${2.2 + i * 0.3}s`} begin={`${1.4 + i * 0.25}s`} repeatCount="indefinite" path={c.d} />
                </circle>
              )}
            </g>
          );
        })}
      </svg>

      <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-20 lg:gap-y-10">
        {groups.map((g, i) => {
          const core = g.id === CORE_ID;
          return (
            <div
              key={g.id}
              ref={(el) => {
                cards.current[g.id] = el;
              }}
              className={`${PLACEMENT[g.id] ?? ""} ${core ? "sm:col-span-2 lg:col-span-1" : ""}`}
              onPointerEnter={() => setHovered(g.id)}
              onPointerLeave={() => setHovered(null)}
            >
              <Spotlight
                as="article"
                className={`card card-hover h-full p-6 ${
                  core ? "flex flex-col justify-center !border-primary/40 shadow-glow sm:p-8" : ""
                }`}
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h3 className={`font-display font-semibold text-ink ${core ? "text-2xl" : "text-lg"}`}>{g.label}</h3>
                  {core ? (
                    <span className="chip !border-primary/50 !bg-primary/15 font-mono !text-[11px] text-primary-soft">CORE</span>
                  ) : (
                    <span className="font-mono text-xs text-faint">{String(i).padStart(2, "0")}</span>
                  )}
                </div>
                {core && (
                  <p className="-mt-2 mb-5 text-sm leading-relaxed text-muted">
                    Where every specialty connects: the products I build end to end.
                  </p>
                )}
                <ul className="flex flex-wrap gap-2">
                  {g.skills.map((s) => (
                    <li key={s} className="chip">
                      <span className="size-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
                      {s}
                    </li>
                  ))}
                </ul>
              </Spotlight>
            </div>
          );
        })}
      </div>
    </div>
  );
}
