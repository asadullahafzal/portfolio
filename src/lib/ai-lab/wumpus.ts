// Knowledge-based Wumpus World agent, ported from
// github.com/asadullahafzal/wumpus-logic-agent (src/engine.js).
//
// The agent keeps a propositional knowledge base in CNF. Before each move it
// ASKs whether ¬Pit and ¬Wumpus hold for neighbouring cells, answering with
// resolution refutation: add the negated query and search for the empty clause.
//
// Changes from the original: TypeScript types, a move limit so back-tracking
// can't loop forever, and a clause cap so resolution can't freeze the browser.

type Pos = [number, number];
type Clause = string[];

export type CellState = { pit: boolean; wumpus: boolean; percepts: { breeze: boolean; stench: boolean; glitter: boolean } | null };
export type EndStatus = "win" | "lose" | "stuck" | null;

const randInt = (a: number, b: number) => Math.floor(Math.random() * (b - a)) + a;
const neg = (l: string) => (l.startsWith("!") ? l.slice(1) : "!" + l);
const signature = (c: Clause) => c.slice().sort().join("|");

const MAX_RESOLUTION_CLAUSES = 250;

export class WumpusEngine {
  readonly R: number;
  readonly C: number;
  agent: Pos = [0, 0];
  visited = new Set<string>(["0,0"]);
  // A cell is safe only once it is proved free of BOTH pits and the Wumpus.
  // (The original marked "no breeze" neighbours safe, ignoring the Wumpus, so the agent could walk into it.)
  pitFree = new Set<string>(["0,0"]);
  wumpusFree = new Set<string>(["0,0"]);
  safeProved = new Set<string>(["0,0"]);
  dangerKnown = new Set<string>();
  kb: Clause[] = [];
  inferenceSteps = 0;
  moves = 0;
  gameOver = false;
  endStatus: EndStatus = null;
  endMessage = "";
  logs: string[] = [];
  grid: CellState[][];
  wumpus: Pos = [0, 0];
  pits: Pos[] = [];

  constructor(R = 4, C = 4) {
    this.R = Math.min(6, Math.max(3, R));
    this.C = Math.min(6, Math.max(3, C));
    this.grid = Array.from({ length: this.R }, () =>
      Array.from({ length: this.C }, () => ({ pit: false, wumpus: false, percepts: null })),
    );
    this.initWorld();
  }

  key(r: number, c: number) {
    return `${r},${c}`;
  }

  neighbors(r: number, c: number): Pos[] {
    const nb: Pos[] = [];
    if (r > 0) nb.push([r - 1, c]);
    if (r < this.R - 1) nb.push([r + 1, c]);
    if (c > 0) nb.push([r, c - 1]);
    if (c < this.C - 1) nb.push([r, c + 1]);
    return nb;
  }

  private log(msg: string) {
    this.logs.push(msg);
    if (this.logs.length > 200) this.logs.shift();
  }

  private initWorld() {
    // Wumpus anywhere except the start and the gold
    let wp: Pos;
    do wp = [randInt(0, this.R), randInt(0, this.C)];
    while ((wp[0] === 0 && wp[1] === 0) || (wp[0] === this.R - 1 && wp[1] === this.C - 1));
    this.grid[wp[0]][wp[1]].wumpus = true;
    this.wumpus = wp;

    const pitTarget = Math.max(1, Math.floor(this.R * this.C * 0.18));
    for (let i = 0; i < this.R && this.pits.length < pitTarget; i++) {
      for (let j = 0; j < this.C && this.pits.length < pitTarget; j++) {
        if ((i === 0 && j === 0) || (i === wp[0] && j === wp[1]) || (i === this.R - 1 && j === this.C - 1)) continue;
        if (Math.random() < 0.18) {
          this.grid[i][j].pit = true;
          this.pits.push([i, j]);
        }
      }
    }

    this.log(`New world ${this.R}×${this.C} · ${this.pits.length} pit(s) · 1 Wumpus · gold at [${this.R - 1},${this.C - 1}]`);
    this.perceiveAndTell(0, 0);
  }

  private addClause(lits: string[]) {
    const set = new Set(lits);
    const arr = [...set];
    if (arr.some((l) => set.has(neg(l)))) return; // tautology
    const sig = signature(arr);
    if (this.kb.some((c) => signature(c) === sig)) return;
    this.kb.push(arr);
  }

  // B ⇔ (P₁ ∨ P₂ ∨ …) in CNF
  private tellBreeze(r: number, c: number) {
    const p = this.neighbors(r, c).map(([nr, nc]) => `P_${nr}_${nc}`);
    this.addClause([`!B_${r}_${c}`, ...p]);
    for (const v of p) this.addClause([neg(v), `B_${r}_${c}`]);
  }

  private tellStench(r: number, c: number) {
    const w = this.neighbors(r, c).map(([nr, nc]) => `W_${nr}_${nc}`);
    this.addClause([`!S_${r}_${c}`, ...w]);
    for (const v of w) this.addClause([neg(v), `S_${r}_${c}`]);
  }

  private perceiveAndTell(r: number, c: number) {
    const breeze = this.neighbors(r, c).some(([nr, nc]) => this.grid[nr][nc].pit);
    const stench = this.neighbors(r, c).some(([nr, nc]) => this.grid[nr][nc].wumpus);
    const glitter = r === this.R - 1 && c === this.C - 1;

    if (breeze) {
      this.addClause([`B_${r}_${c}`]);
      this.tellBreeze(r, c);
      this.log(`[${r},${c}] Breeze → TELL B_${r}_${c}`);
    } else {
      this.addClause([`!B_${r}_${c}`]);
      for (const [nr, nc] of this.neighbors(r, c)) {
        this.addClause([`!P_${nr}_${nc}`]);
        this.markPitFree(this.key(nr, nc));
      }
      this.log(`[${r},${c}] No breeze → neighbours pit-free`);
    }

    if (stench) {
      this.addClause([`S_${r}_${c}`]);
      this.tellStench(r, c);
      this.log(`[${r},${c}] Stench → TELL S_${r}_${c}`);
    } else {
      this.addClause([`!S_${r}_${c}`]);
      for (const [nr, nc] of this.neighbors(r, c)) {
        this.addClause([`!W_${nr}_${nc}`]);
        this.markWumpusFree(this.key(nr, nc));
      }
    }

    this.grid[r][c].percepts = { breeze, stench, glitter };
  }

  private markPitFree(k: string) {
    this.pitFree.add(k);
    if (this.wumpusFree.has(k)) this.safeProved.add(k);
  }

  private markWumpusFree(k: string) {
    this.wumpusFree.add(k);
    if (this.pitFree.has(k)) this.safeProved.add(k);
  }

  // Resolve two clauses on one complementary literal: false = no resolvent, null = empty clause
  private resolvePair(c1: Clause, c2: Clause): Clause | null | false {
    for (const l of c1) {
      if (!c2.includes(neg(l))) continue;
      const res = [...new Set([...c1.filter((x) => x !== l), ...c2.filter((x) => x !== neg(l))])];
      if (res.some((x) => res.includes(neg(x)))) return false;
      return res.length === 0 ? null : res;
    }
    return false;
  }

  /**
   * KB ⊨ query ? Resolution refutation with the set-of-support strategy: every
   * resolution step uses at least one clause descended from ¬query. This is still
   * complete, but far faster than resolving every pair in the KB.
   */
  private entails(query: string) {
    this.inferenceSteps++;
    // Fast path: the answer is already a unit clause in the KB
    if (this.kb.some((c) => c.length === 1 && c[0] === query)) return true;

    const base = this.kb;
    const support: Clause[] = [[neg(query)]];
    const seen = new Set([...base.map(signature), signature(support[0])]);
    for (let i = 0; i < support.length; i++) {
      const s = support[i];
      for (const other of [...base, ...support.slice(0, i)]) {
        const r = this.resolvePair(s, other);
        if (r === null) return true;
        if (r === false) continue;
        const sig = signature(r);
        if (seen.has(sig)) continue;
        seen.add(sig);
        support.push(r);
        if (support.length > MAX_RESOLUTION_CLAUSES) return false; // give up: "unknown"
      }
    }
    return false;
  }

  step() {
    if (this.gameOver) return;
    const [r, c] = this.agent;
    const cell = this.grid[r][c];

    if (cell.pit || cell.wumpus) return this.end("lose", `Agent died at [${r},${c}]: ${cell.pit ? "fell into a pit" : "eaten by the Wumpus"}.`);
    if (r === this.R - 1 && c === this.C - 1 && this.moves > 0) return this.end("win", `Gold found at [${r},${c}] in ${this.moves} moves!`);
    if (this.moves >= this.R * this.C * 3) return this.end("stuck", "No new safe cells can be proved. The agent stops rather than risk dying.");

    let next: Pos | null = null;
    for (const [nr, nc] of this.neighbors(r, c)) {
      const k = this.key(nr, nc);
      if (this.dangerKnown.has(k) || this.visited.has(k)) continue;
      const noPit = this.entails(`!P_${nr}_${nc}`);
      const noWumpus = this.entails(`!W_${nr}_${nc}`);
      this.log(`ASK ¬P[${nr},${nc}] ${noPit ? "✓ proved" : "? unknown"} · ¬W ${noWumpus ? "✓ proved" : "? unknown"}`);
      if (noPit) this.markPitFree(k);
      if (noWumpus) this.markWumpusFree(k);
      if (noPit && noWumpus) {
        next = [nr, nc];
        break;
      }
      if (this.entails(`P_${nr}_${nc}`) || this.entails(`W_${nr}_${nc}`)) {
        this.dangerKnown.add(k);
        this.log(`  [${nr},${nc}] proved DANGEROUS`);
      }
    }

    // Otherwise go back through visited cells towards unexplored safe ones
    if (!next) next = this.pathToFrontier();
    if (!next) return this.end("stuck", "No provably safe move left. The agent stops rather than gamble.");

    this.agent = next;
    this.moves++;
    this.visited.add(this.key(...next));
    this.log(`→ MOVE to [${next[0]},${next[1]}]`);
    this.perceiveAndTell(...next);
  }

  // First step of the shortest route (through visited cells) to a proved-safe unvisited cell
  private pathToFrontier(): Pos | null {
    const start = this.key(...this.agent);
    const prev = new Map<string, string>();
    const queue: Pos[] = [this.agent];
    const seen = new Set([start]);
    while (queue.length) {
      const [r, c] = queue.shift()!;
      for (const [nr, nc] of this.neighbors(r, c)) {
        const k = this.key(nr, nc);
        if (seen.has(k) || this.dangerKnown.has(k)) continue;
        const isTarget = this.safeProved.has(k) && !this.visited.has(k);
        if (!this.visited.has(k) && !isTarget) continue;
        seen.add(k);
        prev.set(k, this.key(r, c));
        if (isTarget) {
          let cur = k;
          while (prev.get(cur) !== start) cur = prev.get(cur)!;
          return cur.split(",").map(Number) as Pos;
        }
        queue.push([nr, nc]);
      }
    }
    return null;
  }

  private end(status: Exclude<EndStatus, null>, msg: string) {
    this.gameOver = true;
    this.endStatus = status;
    this.endMessage = msg;
    this.log(msg);
  }
}
