// Informed search on a grid, ported from
// github.com/asadullahafzal/Dynamic-Pathfinding-Agent (algorithms.py).
// A* orders the frontier by f = g + h; Greedy Best-First (left as an exercise
// in the original) orders it by h alone. Both use the Manhattan heuristic.

export type Algorithm = "astar" | "greedy";

export type SearchResult = {
  /** Cells in the order they were expanded (for the exploration animation) */
  visited: number[];
  /** Start → goal, or null if the goal can't be reached */
  path: number[] | null;
};

export function search(walls: Uint8Array, cols: number, rows: number, start: number, goal: number, algorithm: Algorithm): SearchResult {
  const gx = goal % cols;
  const gy = Math.floor(goal / cols);
  const h = (i: number) => Math.abs((i % cols) - gx) + Math.abs(Math.floor(i / cols) - gy);

  const g = new Float64Array(cols * rows).fill(Infinity);
  const cameFrom = new Int32Array(cols * rows).fill(-1);
  const closed = new Uint8Array(cols * rows);
  g[start] = 0;

  // Small binary heap keyed by [priority, insertion order] (ties: first in, first out, like heapq with a counter)
  const heap: [number, number, number][] = [];
  let counter = 0;
  const push = (item: [number, number, number]) => {
    heap.push(item);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (less(heap[p], heap[i])) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop()!;
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < heap.length && less(heap[l], heap[m])) m = l;
        if (r < heap.length && less(heap[r], heap[m])) m = r;
        if (m === i) break;
        [heap[m], heap[i]] = [heap[i], heap[m]];
        i = m;
      }
    }
    return top;
  };
  const less = (a: [number, number, number], b: [number, number, number]) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);

  push([algorithm === "astar" ? h(start) : h(start), counter++, start]);
  const visited: number[] = [];

  while (heap.length) {
    const [, , current] = pop();
    if (closed[current]) continue;
    closed[current] = 1;
    visited.push(current);

    if (current === goal) {
      const path = [current];
      while (cameFrom[path[0]] !== -1) path.unshift(cameFrom[path[0]]);
      return { visited, path };
    }

    const cx = current % cols;
    const cy = Math.floor(current / cols);
    const neighbours = [cy > 0 && current - cols, cy < rows - 1 && current + cols, cx > 0 && current - 1, cx < cols - 1 && current + 1];
    for (const n of neighbours) {
      if (n === false || walls[n] || closed[n]) continue;
      const tentative = g[current] + 1;
      if (tentative < g[n]) {
        g[n] = tentative;
        cameFrom[n] = current;
        push([algorithm === "astar" ? tentative + h(n) : h(n), counter++, n]);
      }
    }
  }
  return { visited, path: null };
}

/** Random maze at the given wall density (the original used 30%), keeping start/goal clear */
export function randomWalls(cols: number, rows: number, keep: number[], density = 0.3) {
  const walls = new Uint8Array(cols * rows);
  for (let i = 0; i < walls.length; i++) if (!keep.includes(i) && Math.random() < density) walls[i] = 1;
  return walls;
}
