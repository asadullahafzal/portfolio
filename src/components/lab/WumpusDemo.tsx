"use client";

import { useEffect, useRef, useState } from "react";
import { WumpusEngine } from "@/lib/ai-lab/wumpus";

const SPEEDS = { slow: 900, normal: 550, fast: 250 } as const;

// Deal a world whose starting cell is calm (no breeze or stench), so the agent
// has room to reason before it meets uncertainty: about 1.6× more moves on average.
function calmWorld(n: number) {
  let world = new WumpusEngine(n, n);
  for (let i = 0; i < 50; i++) {
    const p = world.grid[0][0].percepts;
    if (!p?.breeze && !p?.stench) break;
    world = new WumpusEngine(n, n);
  }
  return world;
}

export default function WumpusDemo() {
  const [size, setSize] = useState(4);
  const [engine, setEngine] = useState(() => calmWorld(4));
  // The engine mutates itself; bumping this re-renders the grid
  const [, setVersion] = useState(0);
  const [auto, setAuto] = useState(false);
  const [speed, setSpeed] = useState<keyof typeof SPEEDS>("normal");
  const [reveal, setReveal] = useState(false);
  const logRef = useRef<HTMLOListElement>(null);

  const step = () => {
    engine.step();
    setVersion((v) => v + 1);
    if (engine.gameOver) setAuto(false);
  };

  const newWorld = (n = size) => {
    setEngine(calmWorld(n));
    setAuto(false);
    setReveal(false);
  };

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(step, SPEEDS[speed]);
    return () => clearInterval(t);
  });

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  });

  const { R, C, grid, agent, visited, safeProved, dangerKnown, gameOver, endStatus, endMessage } = engine;
  const showAll = reveal || gameOver;
  const here = grid[agent[0]][agent[1]].percepts;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      {/* World */}
      <div>
        <div
          role="grid"
          aria-label={`Wumpus world, ${R} by ${C}. Agent at row ${agent[0]}, column ${agent[1]}.`}
          className="mx-auto grid w-full max-w-md gap-1.5"
          style={{ gridTemplateColumns: `repeat(${C}, minmax(0, 1fr))` }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const k = engine.key(r, c);
              const isAgent = agent[0] === r && agent[1] === c;
              const isGold = r === R - 1 && c === C - 1;
              const seen = visited.has(k);
              const safe = safeProved.has(k);
              const danger = dangerKnown.has(k);
              const tone = isAgent
                ? "border-accent bg-accent/15 shadow-[0_0_20px_-4px_var(--color-accent)]"
                : seen
                  ? "border-primary/40 bg-primary/10"
                  : danger
                    ? "border-rose-400/50 bg-rose-500/10"
                    : safe
                      ? "border-emerald-400/40 bg-emerald-400/[0.07]"
                      : "border-line bg-surface/60";
              return (
                <div
                  key={k}
                  role="gridcell"
                  className={`relative flex aspect-square flex-col items-center justify-center rounded-lg border text-center transition-colors duration-300 ${tone}`}
                >
                  <span className="absolute left-1.5 top-1 font-mono text-[9px] text-faint">
                    {r},{c}
                  </span>
                  <span className="text-lg leading-none sm:text-2xl" aria-hidden>
                    {isAgent ? "🤖" : showAll && cell.wumpus ? "👾" : showAll && cell.pit ? "🕳️" : isGold && (showAll || seen) ? "💰" : danger ? "⚠️" : ""}
                  </span>
                  {seen && cell.percepts && (
                    <span className="mt-1 flex gap-1 font-mono text-[9px] leading-none sm:text-[10px]">
                      {cell.percepts.breeze && <span className="text-sky-300">breeze</span>}
                      {cell.percepts.stench && <span className="text-lime-300">stench</span>}
                    </span>
                  )}
                  {!seen && safe && !isAgent && <span className="mt-1 font-mono text-[9px] text-emerald-300">safe</span>}
                </div>
              );
            }),
          )}
        </div>

        <ul className="mx-auto mt-4 flex max-w-md flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted">
          <li><span className="mr-1 inline-block size-2.5 rounded-sm border border-primary/40 bg-primary/20" />visited</li>
          <li><span className="mr-1 inline-block size-2.5 rounded-sm border border-emerald-400/40 bg-emerald-400/20" />proved safe</li>
          <li><span className="mr-1 inline-block size-2.5 rounded-sm border border-rose-400/50 bg-rose-500/20" />proved dangerous</li>
          <li>💰 gold (far corner)</li>
        </ul>
      </div>

      {/* Controls + reasoning */}
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={step} disabled={gameOver || auto} className="btn btn-primary !px-4 !py-2 text-sm disabled:opacity-40">
            Step
          </button>
          <button type="button" onClick={() => setAuto((a) => !a)} disabled={gameOver} className="btn btn-ghost !px-4 !py-2 text-sm disabled:opacity-40">
            {auto ? "⏸ Pause" : "▶ Auto-play"}
          </button>
          <button type="button" onClick={() => newWorld()} className="btn btn-ghost !px-4 !py-2 text-sm">
            New world
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted">
          <label className="flex items-center gap-2">
            Size
            <select
              value={size}
              onChange={(e) => {
                const n = Number(e.target.value);
                setSize(n);
                newWorld(n);
              }}
              className="rounded-lg border border-line bg-surface px-2 py-1 text-ink"
            >
              {[4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}×{n}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            Speed
            <select
              value={speed}
              onChange={(e) => setSpeed(e.target.value as keyof typeof SPEEDS)}
              className="rounded-lg border border-line bg-surface px-2 py-1 text-ink"
            >
              {Object.keys(SPEEDS).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={showAll} disabled={gameOver} onChange={(e) => setReveal(e.target.checked)} className="accent-[var(--color-accent)]" />
            Reveal world
          </label>
        </div>

        {gameOver ? (
          <p
            role="status"
            className={`rounded-xl border px-4 py-3 text-sm ${
              endStatus === "win" ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200" : "border-amber-400/40 bg-amber-400/10 text-amber-100"
            }`}
          >
            {endStatus === "win" ? "🎉 " : "🛑 "}
            {endMessage}
          </p>
        ) : (
          <p role="status" className="rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm text-muted">
            The agent perceives{" "}
            <span className="text-ink">{here?.breeze || here?.stench ? [here.breeze && "a breeze", here.stench && "a stench"].filter(Boolean).join(" and ") : "nothing"}</span>{" "}
            at [{agent[0]},{agent[1]}]. It only moves to cells it can <span className="text-ink">prove</span> are safe.
          </p>
        )}

        <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-line bg-line text-center">
          {[
            ["Moves", engine.moves],
            ["KB clauses", engine.kb.length],
            ["Inferences", engine.inferenceSteps],
          ].map(([label, value]) => (
            <div key={label} className="bg-surface px-2 py-3">
              <dd className="font-display text-xl font-semibold text-ink">{value}</dd>
              <dt className="text-[11px] text-muted">{label}</dt>
            </div>
          ))}
        </dl>

        <div>
          <p className="eyebrow mb-2 !text-[10px]">Reasoning log</p>
          <ol
            ref={logRef}
            data-lenis-prevent
            aria-label="Agent reasoning log"
            className="scrollbar-thin h-44 space-y-1 overflow-y-auto rounded-xl border border-line bg-bg/70 p-3 font-mono text-[11px] leading-relaxed text-muted"
          >
            {engine.logs.slice(-60).map((l, i) => (
              <li key={i} className={l.startsWith("ASK") ? "text-primary-soft" : l.startsWith("→") ? "text-accent" : ""}>
                {l}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
