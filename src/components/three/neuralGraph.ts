import { skillGroups, type SkillGroup } from "@/data/profile";

// Builds the neural network shown in the hero: one cluster of neurons per skill group,
// with Full-Stack as the core in the middle and the other specialties orbiting it.
// Uses a seeded random generator so the network looks the same on every visit.

export type Cluster = SkillGroup & {
  center: [number, number, number];
  radius: number;
  color: number;
};

export type NeuralGraph = {
  clusters: Cluster[];
  /** xyz per node */
  positions: Float32Array;
  /** cluster index per node */
  nodeCluster: Uint8Array;
  /** base point size per node */
  nodeSize: Float32Array;
  /** node index pairs */
  edges: Uint16Array;
  /** node index -> indices of edges touching it */
  adjacency: number[][];
};

const CORE_ID = "fullstack";

const LAYOUT: Record<string, [number, number, number]> = {
  fullstack: [0, 0, 0],
  ai: [-1.4, 3.7, 1.0],
  seo: [3.9, 1.7, -0.8],
  data: [3.1, -2.9, 1.2],
  languages: [-2.4, -3.4, -1.0],
  adtech: [-4.3, 0.5, 0.6],
};

const COLORS: Record<string, number> = {
  fullstack: 0x2f7bff,
  ai: 0x22d3ee,
  seo: 0x6ea2ff,
  data: 0x7c5cff,
  languages: 0x38bdf8,
  adtech: 0xa78bfa,
};

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildNeuralGraph({ density = 1 }: { density?: number } = {}): NeuralGraph {
  const rand = mulberry32(2027);

  const clusters: Cluster[] = skillGroups.map((g, i) => {
    const isCore = g.id === CORE_ID;
    // Fallback ring position for any skill group added later without a layout entry
    const angle = (i / skillGroups.length) * Math.PI * 2;
    return {
      ...g,
      center: LAYOUT[g.id] ?? [Math.cos(angle) * 4.4, Math.sin(angle) * 3.4, 0],
      radius: isCore ? 1.7 : 1.15,
      color: COLORS[g.id] ?? 0x6ea2ff,
    };
  });

  // Nodes
  const pts: number[] = [];
  const clusterOf: number[] = [];
  const sizes: number[] = [];
  const members: number[][] = clusters.map(() => []);

  clusters.forEach((c, ci) => {
    const count = Math.round((c.id === CORE_ID ? 34 : 18) * density);
    for (let k = 0; k < count; k++) {
      // Uniform point inside a sphere, squashed slightly on z for a flatter look
      const u = rand() * 2 - 1;
      const phi = rand() * Math.PI * 2;
      const r = c.radius * Math.cbrt(rand());
      const s = Math.sqrt(1 - u * u);
      pts.push(c.center[0] + r * s * Math.cos(phi), c.center[1] + r * s * Math.sin(phi), c.center[2] + r * u * 0.7);
      clusterOf.push(ci);
      sizes.push(0.7 + rand() * 0.8 + (k === 0 ? 0.9 : 0)); // first node of each cluster is a bigger "hub"
      members[ci].push(clusterOf.length - 1);
    }
  });

  const dist2 = (a: number, b: number) => {
    const dx = pts[a * 3] - pts[b * 3];
    const dy = pts[a * 3 + 1] - pts[b * 3 + 1];
    const dz = pts[a * 3 + 2] - pts[b * 3 + 2];
    return dx * dx + dy * dy + dz * dz;
  };
  const nearest = (from: number, pool: number[], n: number) =>
    pool
      .filter((p) => p !== from)
      .sort((a, b) => dist2(from, a) - dist2(from, b))
      .slice(0, n);

  // Edges
  const edgeSet = new Set<number>();
  const edgeList: number[] = [];
  const addEdge = (a: number, b: number) => {
    const key = a < b ? a * 4096 + b : b * 4096 + a;
    if (a === b || edgeSet.has(key)) return;
    edgeSet.add(key);
    edgeList.push(a, b);
  };

  // Local wiring inside each cluster
  members.forEach((m) => m.forEach((node) => nearest(node, m, 3).forEach((o) => addEdge(node, o))));

  const coreIndex = clusters.findIndex((c) => c.id === CORE_ID);
  const outer = clusters.map((_, i) => i).filter((i) => i !== coreIndex);

  // Every specialty connects back into the full-stack core
  if (coreIndex >= 0) {
    outer.forEach((ci) => {
      const m = members[ci];
      for (let k = 0; k < 3; k++) {
        const node = m[Math.floor(rand() * m.length)];
        addEdge(node, nearest(node, members[coreIndex], 1)[0]);
      }
    });
  }

  // Neighbouring specialties link to each other around the ring
  const byAngle = [...outer].sort(
    (a, b) =>
      Math.atan2(clusters[a].center[1], clusters[a].center[0]) - Math.atan2(clusters[b].center[1], clusters[b].center[0]),
  );
  byAngle.forEach((ci, i) => {
    const next = byAngle[(i + 1) % byAngle.length];
    const node = members[ci][Math.floor(rand() * members[ci].length)];
    addEdge(node, nearest(node, members[next], 1)[0]);
  });

  const adjacency: number[][] = clusterOf.map(() => []);
  for (let e = 0; e < edgeList.length / 2; e++) {
    adjacency[edgeList[e * 2]].push(e);
    adjacency[edgeList[e * 2 + 1]].push(e);
  }

  return {
    clusters,
    positions: new Float32Array(pts),
    nodeCluster: new Uint8Array(clusterOf),
    nodeSize: new Float32Array(sizes),
    edges: new Uint16Array(edgeList),
    adjacency,
  };
}
