---
title: "My logic agent kept walking into the Wumpus: debugging a knowledge-based AI"
description: "A Wumpus World agent that only moves to cells it can prove safe should never die. Mine died in 28% of games. Here's the bug, how a test harness found it, and how set-of-support resolution made it 25× faster."
date: 2026-10-09
tags: [AI, Logic, Algorithms, Testing]
---

Wumpus World is a classic AI exercise: an agent explores a cave grid looking for gold while avoiding bottomless pits and a monster, the Wumpus. It can't see hazards, only **perceive** them: a **breeze** next to a pit, a **stench** next to the Wumpus.

My agent is knowledge-based. It stores everything it learns as propositional logic and only steps onto a cell when it can **prove** that cell is safe. That design comes with a strong guarantee: **it should never die.** It might get stuck and refuse to gamble, but it should never walk into danger.

When I ported the agent to run as a live demo on my portfolio, I tested that guarantee. It failed.

## How the agent reasons

Percepts become clauses in **conjunctive normal form (CNF)**. A breeze at cell (1,0) means *at least one neighbour has a pit*, and a pit anywhere means its neighbours are breezy:

```text
B_1_0 ⇔ (P_0_0 ∨ P_2_0 ∨ P_1_1)

In CNF:
  ¬B_1_0 ∨ P_0_0 ∨ P_2_0 ∨ P_1_1
  ¬P_0_0 ∨ B_1_0
  ¬P_2_0 ∨ B_1_0
  ¬P_1_1 ∨ B_1_0
```

To decide whether a cell is safe, the agent **asks** its knowledge base whether `¬P` (no pit) and `¬W` (no Wumpus) hold. It answers with **resolution refutation**: add the *negation* of the question, keep resolving pairs of clauses, and if you derive the empty clause, the question was entailed.

## Testing the guarantee

Rather than click through a few games, I wrote a small harness that plays hundreds of random worlds and checks every move:

```ts
for (const size of [4, 5, 6]) {
  for (let game = 0; game < 150; game++) {
    const world = new WumpusEngine(size, size);
    while (!world.gameOver) {
      world.step();
      const [r, c] = world.agent;
      if (world.grid[r][c].pit || world.grid[r][c].wumpus) unsafeMoves++;
    }
  }
}
```

The first run: **the agent died in 28% of games**. For an agent that's supposed to be provably safe, that's not a tuning problem. It's a bug.

## The bug

The death logs all looked like this:

```text
ASK ¬P[1,3] ✓ proved · ¬W ? unknown
→ MOVE to [1,3]
Agent died at [1,3]: eaten by the Wumpus.
```

The agent proved there was **no pit**, failed to prove there was **no Wumpus**, and moved anyway.

The cause was a shortcut. When a cell has no breeze, its neighbours are obviously pit-free, so the code added them straight to a `safeProved` set:

```ts
// No breeze → neighbours can't have pits…
for (const [nr, nc] of neighbours) {
  addClause([`!P_${nr}_${nc}`]);
  safeProved.add(key(nr, nc)); // …but that doesn't make them SAFE
}
```

Later, when the agent couldn't find a provably safe neighbour, its fallback picked any cell in `safeProved`. "Pit-free" had quietly become "safe", ignoring the Wumpus entirely.

## The fix

Safety needs both proofs, so I track them separately and only combine them when both hold:

```ts
private markPitFree(k: string) {
  this.pitFree.add(k);
  if (this.wumpusFree.has(k)) this.safeProved.add(k);
}

private markWumpusFree(k: string) {
  this.wumpusFree.add(k);
  if (this.pitFree.has(k)) this.safeProved.add(k);
}
```

Re-running the harness on 450 worlds: **0 deaths and 0 unsafe moves.** The agent now does what a logic agent should: when nothing can be proved safe, it stops instead of gambling.

## The second problem: 750 ms per move

The harness also timed every step. On 6×6 grids, some moves took **750 ms**, long enough to freeze a web page.

Plain resolution tries every pair of clauses, and every new clause it derives makes the next round bigger. Most of that work is irrelevant to the question being asked.

**Set-of-support** fixes this. Every resolution step must involve at least one clause that descends from the negated question, so the search stays focused on the query. It's still complete, just far less wasteful:

```ts
const support: Clause[] = [[negate(query)]];
for (let i = 0; i < support.length; i++) {
  for (const other of [...kb, ...support.slice(0, i)]) {
    const resolvent = resolve(support[i], other);
    if (resolvent === EMPTY) return true; // contradiction → query proved
    if (resolvent && isNew(resolvent)) support.push(resolvent);
  }
}
return false;
```

Together with a fast path (if the answer is already a unit clause, return immediately), the slowest move dropped from **750 ms to about 30 ms**, with identical answers.

## What I took away

- **Test the guarantee, not the happy path.** A few manual games looked fine. 450 automated ones exposed the bug in seconds.
- **Names leak assumptions.** A set called `safeProved` that only proved half of "safe" was the whole bug.
- **Algorithms matter more than micro-optimisations.** Choosing the right resolution strategy beat any amount of code tuning.

You can play with the agent, step through its reasoning log and reveal the hidden world in the [AI Lab on my homepage](/#lab). The original project is on [GitHub](https://github.com/asadullahafzal/wumpus-logic-agent).
