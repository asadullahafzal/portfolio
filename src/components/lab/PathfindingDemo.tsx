"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { randomWalls, search, type Algorithm } from "@/lib/ai-lab/pathfinding";

type Phase = "idle" | "exploring" | "walking" | "arrived" | "blocked";

type Model = {
  cols: number;
  rows: number;
  walls: Uint8Array;
  start: number;
  goal: number;
  agent: number;
  explored: number[];
  shownExplored: number;
  path: number[];
  pathIndex: number;
};

const STATUS: Record<Phase, string> = {
  idle: "Draw walls by dragging on the grid, then press Run.",
  exploring: "Searching…",
  walking: "Following the path…",
  arrived: "Arrived at the goal.",
  blocked: "No path exists. The goal is walled off.",
};

// 30% random walls (as in the original), re-rolled until the goal is reachable
function solvableMaze(cols: number, rows: number, start: number, goal: number) {
  let walls = randomWalls(cols, rows, [start, goal]);
  for (let i = 0; i < 30 && !search(walls, cols, rows, start, goal, "astar").path; i++) walls = randomWalls(cols, rows, [start, goal]);
  return walls;
}

function makeModel(cols: number, rows: number, maze: boolean): Model {
  const start = Math.floor(rows / 2) * cols + 2;
  const goal = Math.floor(rows / 2) * cols + cols - 3;
  return {
    cols,
    rows,
    walls: maze ? solvableMaze(cols, rows, start, goal) : new Uint8Array(cols * rows),
    start,
    goal,
    agent: start,
    explored: [],
    shownExplored: 0,
    path: [],
    pathIndex: 0,
  };
}

export default function PathfindingDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const model = useRef<Model | null>(null);
  const paint = useRef<{ value: 0 | 1 } | null>(null);
  const raf = useRef(0);

  const [phase, setPhase] = useState<Phase>("idle");
  const [algorithm, setAlgorithm] = useState<Algorithm>("astar");
  const [dynamic, setDynamic] = useState(true);
  const [stats, setStats] = useState({ explored: 0, length: 0, replans: 0 });

  const settings = useRef({ algorithm, dynamic });
  useEffect(() => {
    settings.current = { algorithm, dynamic };
  }, [algorithm, dynamic]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const m = model.current;
    if (!canvas || !m) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const css = getComputedStyle(document.documentElement);
    const color = (v: string) => css.getPropertyValue(v).trim();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const cell = width / m.cols;
    canvas.width = width * dpr;
    canvas.height = cell * m.rows * dpr;
    ctx.scale(dpr, dpr);

    const fill = (i: number, style: string, inset = 1, radius = 3) => {
      ctx.fillStyle = style;
      const x = (i % m.cols) * cell + inset;
      const y = Math.floor(i / m.cols) * cell + inset;
      ctx.beginPath();
      ctx.roundRect(x, y, cell - inset * 2, cell - inset * 2, radius);
      ctx.fill();
    };

    ctx.fillStyle = color("--color-surface");
    ctx.fillRect(0, 0, width, cell * m.rows);
    for (let i = 0; i < m.cols * m.rows; i++) fill(i, "rgba(120,160,255,0.06)");
    for (let k = 0; k < m.shownExplored; k++) fill(m.explored[k], "rgba(47,123,255,0.28)");
    for (let k = 0; k < m.path.length; k++) fill(m.path[k], k < m.pathIndex ? "rgba(34,211,238,0.25)" : "rgba(34,211,238,0.6)", cell * 0.22, 99);
    for (let i = 0; i < m.walls.length; i++) if (m.walls[i]) fill(i, color("--color-faint"), 0.5, 2);
    fill(m.goal, "#f59e0b", 2, 4);
    fill(m.start, "rgba(52,211,153,0.5)", 2, 4);

    // Agent with a glow
    ctx.shadowColor = color("--color-accent");
    ctx.shadowBlur = 14;
    fill(m.agent, color("--color-accent"), cell * 0.18, 99);
    ctx.shadowBlur = 0;
  }, []);

  // New grid sized to the container width
  const buildGrid = useCallback(
    (maze: boolean) => {
      cancelAnimationFrame(raf.current);
      const w = wrapRef.current?.clientWidth ?? 800;
      const cols = w < 520 ? 18 : w < 760 ? 26 : 34;
      const rows = w < 520 ? 14 : 16;
      model.current = makeModel(cols, rows, maze);
      draw();
    },
    [draw],
  );

  const reset = (maze: boolean) => {
    buildGrid(maze);
    setPhase("idle");
    setStats({ explored: 0, length: 0, replans: 0 });
  };

  useEffect(() => {
    buildGrid(true);
    const ro = new ResizeObserver(() => draw());
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf.current);
    };
  }, [buildGrid, draw]);

  const run = () => {
    const m = model.current;
    if (!m) return;
    cancelAnimationFrame(raf.current);
    m.agent = m.start;
    let replans = 0;
    let lastStep = 0;

    const plan = (from: number) => {
      const res = search(m.walls, m.cols, m.rows, from, m.goal, settings.current.algorithm);
      m.explored = res.visited;
      m.shownExplored = 0;
      m.path = res.path ?? [];
      m.pathIndex = 0;
      return res.path !== null;
    };

    plan(m.start);
    let phaseNow: Phase = "exploring";
    setPhase("exploring");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const tick = (time: number) => {
      if (phaseNow === "exploring") {
        // Reveal the search a few cells per frame
        m.shownExplored = reduced ? m.explored.length : Math.min(m.explored.length, m.shownExplored + Math.max(2, Math.ceil(m.explored.length / 90)));
        if (m.shownExplored >= m.explored.length) {
          if (m.path.length === 0) {
            phaseNow = "blocked";
          } else {
            phaseNow = "walking";
            lastStep = time;
          }
          setPhase(phaseNow);
          setStats({ explored: m.explored.length, length: Math.max(0, m.path.length - 1), replans });
        }
      } else if (phaseNow === "walking" && time - lastStep > 70) {
        lastStep = time;

        // Dynamic mode: obstacles appear while the agent moves, sometimes right in its way
        if (settings.current.dynamic && Math.random() < 0.18) {
          const ahead = m.path.slice(m.pathIndex + 2, m.pathIndex + 7).filter((i) => i !== m.goal);
          const target =
            ahead.length && Math.random() < 0.6 ? ahead[Math.floor(Math.random() * ahead.length)] : Math.floor(Math.random() * m.walls.length);
          if (target !== m.agent && target !== m.goal && target !== m.start && !m.walls[target]) {
            m.walls[target] = 1;
            // Never seal the goal off completely; the point is to force a detour
            if (!search(m.walls, m.cols, m.rows, m.agent, m.goal, "astar").path) m.walls[target] = 0;
          }
        }

        const next = m.path[m.pathIndex + 1];
        if (next !== undefined && m.walls[next]) {
          // Path blocked: re-plan from where the agent stands
          replans++;
          plan(m.agent);
          phaseNow = "exploring";
          setPhase("exploring");
        } else if (next !== undefined) {
          m.pathIndex++;
          m.agent = next;
          if (m.agent === m.goal) {
            phaseNow = "arrived";
            setPhase("arrived");
          }
        }
      }

      draw();
      if (phaseNow === "exploring" || phaseNow === "walking") raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  // Drag to draw or erase walls (only while nothing is running)
  const cellAt = (e: PointerEvent<HTMLCanvasElement>) => {
    const m = model.current!;
    const rect = e.currentTarget.getBoundingClientRect();
    const cell = rect.width / m.cols;
    const c = Math.floor((e.clientX - rect.left) / cell);
    const r = Math.floor((e.clientY - rect.top) / cell);
    return r >= 0 && r < m.rows && c >= 0 && c < m.cols ? r * m.cols + c : -1;
  };
  const busy = phase === "exploring" || phase === "walking";
  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    const m = model.current;
    if (busy || !m) return;
    const i = cellAt(e);
    if (i < 0 || i === m.start || i === m.goal) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    // Clear the previous run's trail before editing
    m.explored = [];
    m.shownExplored = 0;
    m.path = [];
    m.agent = m.start;
    paint.current = { value: m.walls[i] ? 0 : 1 };
    m.walls[i] = paint.current.value;
    setPhase("idle");
    draw();
  };
  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    const m = model.current;
    if (!paint.current || !m) return;
    const i = cellAt(e);
    if (i < 0 || i === m.start || i === m.goal) return;
    m.walls[i] = paint.current.value;
    draw();
  };
  const onPointerUp = () => {
    paint.current = null;
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={run} disabled={busy} className="btn btn-primary !px-4 !py-2 text-sm disabled:opacity-40">
          ▶ Run
        </button>
        <button type="button" onClick={() => reset(true)} disabled={busy} className="btn btn-ghost !px-4 !py-2 text-sm disabled:opacity-40">
          Random maze
        </button>
        <button type="button" onClick={() => reset(false)} disabled={busy} className="btn btn-ghost !px-4 !py-2 text-sm disabled:opacity-40">
          Clear
        </button>
        <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
          <label className="flex items-center gap-2">
            Algorithm
            <select
              value={algorithm}
              disabled={busy}
              onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
              className="rounded-lg border border-line bg-surface px-2 py-1 text-ink"
            >
              <option value="astar">A* (optimal)</option>
              <option value="greedy">Greedy Best-First</option>
            </select>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={dynamic} onChange={(e) => setDynamic(e.target.checked)} className="accent-[var(--color-accent)]" />
            Dynamic obstacles
          </label>
        </div>
      </div>

      <div ref={wrapRef} className="overflow-hidden rounded-xl border border-line">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Pathfinding grid. Drag to draw walls; press Run to search from the green start to the amber goal."
          className="block w-full touch-none cursor-crosshair"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p role="status" className="text-sm text-muted">
          {STATUS[phase]}
        </p>
        <dl className="flex gap-5 text-center">
          {[
            ["Explored", stats.explored],
            ["Path length", stats.length],
            ["Re-plans", stats.replans],
          ].map(([label, value]) => (
            <div key={label}>
              <dd className="font-display text-lg font-semibold text-ink">{value}</dd>
              <dt className="text-[11px] text-muted">{label}</dt>
            </div>
          ))}
        </dl>
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <li><span className="mr-1 inline-block size-2.5 rounded-sm bg-emerald-400/60" />start</li>
        <li><span className="mr-1 inline-block size-2.5 rounded-sm bg-amber-500" />goal</li>
        <li><span className="mr-1 inline-block size-2.5 rounded-sm bg-primary/40" />explored</li>
        <li><span className="mr-1 inline-block size-2.5 rounded-full bg-accent/70" />path</li>
        <li><span className="mr-1 inline-block size-2.5 rounded-sm bg-faint" />wall</li>
      </ul>
    </div>
  );
}
