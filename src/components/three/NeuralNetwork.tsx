"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { buildNeuralGraph, type NeuralGraph } from "./neuralGraph";
import { createGlowMaterial } from "./glowMaterial";

type Props = {
  /** 0 → 1 as the hero scrolls out of view; drives the camera fly-through */
  progress: RefObject<number>;
  reducedMotion: boolean;
};

type Pulse = { edge: number; forward: boolean; t: number; speed: number };

const CAMERA_Z = 13;

// Mutable per-frame simulation state, kept outside React so animation never re-renders.
function createSim(graph: NeuralGraph, pulseCount: number) {
  const rand = Math.random;
  const edgeCount = graph.edges.length / 2;
  const pulses: Pulse[] = Array.from({ length: pulseCount }, () => ({
    edge: Math.floor(rand() * edgeCount),
    forward: rand() > 0.5,
    t: rand(),
    speed: 1.1 + rand() * 1.4,
  }));
  return {
    pulses,
    flash: new Float32Array(graph.nodeCluster.length),
    intensity: new Float32Array(graph.clusters.length).fill(1),
    autoRotation: 0,
  };
}

export default function NeuralNetwork({ progress, reducedMotion }: Props) {
  // Phone layout is decided from the canvas's real size, so it adapts on resize
  // (and isn't fooled by a 0-width window in a background tab).
  const compact = useThree((s) => s.size.width > 0 && s.size.width < 768);
  const graph = useMemo(() => buildNeuralGraph({ density: compact ? 0.6 : 1 }), [compact]);
  const gl = useThree((s) => s.gl);
  const [hovered, setHovered] = useState<number | null>(null);
  const hoveredRef = useRef<number | null>(null);
  const group = useRef<THREE.Group>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  const nodeCount = graph.nodeCluster.length;
  const edgeCount = graph.edges.length / 2;
  const pulseCount = compact ? 34 : 72;

  const scene = useMemo(() => {
    const pr = Math.min(gl.getPixelRatio(), 2);

    // Raw sRGB colors for the glow shader, linear colors for the built-in line material
    const rawColors = graph.clusters.map((c) => new THREE.Color().setHex(c.color, THREE.LinearSRGBColorSpace));
    const linColors = graph.clusters.map((c) => new THREE.Color(c.color));

    const nodes = new THREE.BufferGeometry();
    nodes.setAttribute("position", new THREE.BufferAttribute(graph.positions, 3));
    nodes.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(graph.nodeSize), 1));
    nodes.setAttribute("aColor", new THREE.BufferAttribute(new Float32Array(nodeCount * 3), 3));

    const linePositions = new Float32Array(edgeCount * 6);
    for (let e = 0; e < edgeCount; e++) {
      for (let end = 0; end < 2; end++) {
        const n = graph.edges[e * 2 + end];
        linePositions.set(graph.positions.subarray(n * 3, n * 3 + 3), e * 6 + end * 3);
      }
    }
    const lines = new THREE.BufferGeometry();
    lines.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    lines.setAttribute("color", new THREE.BufferAttribute(new Float32Array(edgeCount * 6), 3));

    const pulses = new THREE.BufferGeometry();
    pulses.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pulseCount * 3), 3));
    pulses.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(pulseCount).fill(0.9), 1));
    pulses.setAttribute("aColor", new THREE.BufferAttribute(new Float32Array(pulseCount * 3), 3));

    return {
      rawColors,
      linColors,
      nodes,
      lines,
      pulses,
      nodeMaterial: createGlowMaterial({ size: 320, opacity: compact ? 0.7 : 1, pixelRatio: pr }),
      pulseMaterial: createGlowMaterial({ size: 320, opacity: 1, pixelRatio: pr }),
      lineMaterial: new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: compact ? 0.5 : 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
      sim: createSim(graph, pulseCount),
    };
  }, [graph, gl, compact, nodeCount, edgeCount, pulseCount]);

  // The frame loop mutates buffers and simulation state every frame, so it reads
  // the scene through a ref rather than the memoized value.
  const sceneRef = useRef(scene);
  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);

  useEffect(
    () => () => {
      scene.nodes.dispose();
      scene.lines.dispose();
      scene.pulses.dispose();
      scene.nodeMaterial.dispose();
      scene.pulseMaterial.dispose();
      scene.lineMaterial.dispose();
    },
    [scene],
  );

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    const scene = sceneRef.current;
    const { sim, rawColors, linColors } = scene;
    const { positions, edges, nodeCluster, nodeSize, adjacency } = graph;
    const hov = hoveredRef.current;
    const p = reducedMotion ? 0 : (progress.current ?? 0);

    // Hovering a cluster brightens it and dims the rest
    for (let c = 0; c < sim.intensity.length; c++) {
      const target = hov === null ? 1 : c === hov ? 1.8 : 0.3;
      sim.intensity[c] += (target - sim.intensity[c]) * Math.min(1, dt * 6);
    }

    // Signals travel edge to edge; when one arrives, that neuron "fires"
    const pulsePos = scene.pulses.attributes.position.array as Float32Array;
    const pulseCol = scene.pulses.attributes.aColor.array as Float32Array;
    sim.pulses.forEach((pulse, i) => {
      let a = edges[pulse.edge * 2 + (pulse.forward ? 0 : 1)];
      let b = edges[pulse.edge * 2 + (pulse.forward ? 1 : 0)];
      if (!reducedMotion) {
        const len = Math.hypot(
          positions[b * 3] - positions[a * 3],
          positions[b * 3 + 1] - positions[a * 3 + 1],
          positions[b * 3 + 2] - positions[a * 3 + 2],
        );
        pulse.t += (dt * pulse.speed) / Math.max(len, 0.3);
        if (pulse.t >= 1) {
          sim.flash[b] = 1;
          const options = adjacency[b].filter((e) => e !== pulse.edge);
          const pool = options.length ? options : adjacency[b];
          pulse.edge = pool[Math.floor(Math.random() * pool.length)];
          pulse.forward = edges[pulse.edge * 2] === b;
          pulse.t = 0;
          a = b;
          b = edges[pulse.edge * 2 + (pulse.forward ? 1 : 0)];
        }
      }
      for (let k = 0; k < 3; k++) {
        pulsePos[i * 3 + k] = positions[a * 3 + k] + (positions[b * 3 + k] - positions[a * 3 + k]) * pulse.t;
      }
      const cb = nodeCluster[b];
      const boost = 1.5 * sim.intensity[cb];
      pulseCol[i * 3] = rawColors[cb].r * boost;
      pulseCol[i * 3 + 1] = rawColors[cb].g * boost;
      pulseCol[i * 3 + 2] = rawColors[cb].b * boost;
    });
    scene.pulses.attributes.position.needsUpdate = true;
    scene.pulses.attributes.aColor.needsUpdate = true;

    // Neuron colors and sizes
    const nodeCol = scene.nodes.attributes.aColor.array as Float32Array;
    const nodeSz = scene.nodes.attributes.aSize.array as Float32Array;
    for (let n = 0; n < nodeCluster.length; n++) {
      const c = nodeCluster[n];
      sim.flash[n] = Math.max(0, sim.flash[n] - dt * 2.2);
      const f = sim.flash[n];
      const k = sim.intensity[c] * (1 + f * 0.9);
      nodeCol[n * 3] = rawColors[c].r * k;
      nodeCol[n * 3 + 1] = rawColors[c].g * k;
      nodeCol[n * 3 + 2] = rawColors[c].b * k;
      nodeSz[n] = nodeSize[n] * (1 + f * 0.8) * (c === hov ? 1.25 : 1);
    }
    scene.nodes.attributes.aColor.needsUpdate = true;
    scene.nodes.attributes.aSize.needsUpdate = true;

    // Connection colors follow their clusters' brightness
    const lineCol = scene.lines.attributes.color.array as Float32Array;
    for (let v = 0; v < edges.length; v++) {
      const c = nodeCluster[edges[v]];
      const k = 0.7 * sim.intensity[c];
      lineCol[v * 3] = linColors[c].r * k;
      lineCol[v * 3 + 1] = linColors[c].g * k;
      lineCol[v * 3 + 2] = linColors[c].b * k;
    }
    scene.lines.attributes.color.needsUpdate = true;

    // Layout: network sits to the right of the text on wide screens, centered behind it on phones
    const { width, height } = state.viewport;
    const wide = width / height > 1.1;
    const scale = wide ? THREE.MathUtils.clamp((width * 0.5) / 12, 0.55, 1) : THREE.MathUtils.clamp(width / 11.5, 0.4, 1);
    const x = wide ? width / 2 - 6.2 * scale - width * 0.03 : 0;
    const y = wide ? 0 : height * 0.14;
    g.scale.setScalar(scale);
    g.position.set(x, y, 0);

    // Slow drift plus a gentle tilt toward the mouse
    if (!reducedMotion) sim.autoRotation += dt * 0.06;
    const pointer = state.pointer;
    g.rotation.y += (sim.autoRotation + pointer.x * 0.35 - g.rotation.y) * Math.min(1, dt * 3);
    g.rotation.x += (-pointer.y * 0.2 - g.rotation.x) * Math.min(1, dt * 3);

    // Scrolling flies the camera into the network
    const e = Math.pow(p, 1.6);
    state.camera.position.set(x * e, y * e, CAMERA_Z - e * 11.5);

    // Labels: fade while flying in, and highlight the hovered cluster
    labelRefs.current.forEach((el, i) => {
      if (!el) return;
      const base = hov === null ? 0.8 : i === hov ? 1 : 0.25;
      el.style.opacity = String(base * Math.max(0, 1 - p * 5));
    });
  });

  return (
    <group ref={group}>
      <lineSegments geometry={scene.lines} material={scene.lineMaterial} frustumCulled={false} />
      <points geometry={scene.nodes} material={scene.nodeMaterial} frustumCulled={false} />
      <points geometry={scene.pulses} material={scene.pulseMaterial} frustumCulled={false} />

      {!compact &&
        graph.clusters.map((c, i) => (
          <group key={c.id} position={c.center}>
            {/* Invisible hover target around each cluster */}
            <mesh
              onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(i);
              }}
              onPointerOut={() => setHovered((h) => (h === i ? null : h))}
            >
              <sphereGeometry args={[c.radius * 1.2, 12, 12]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
            </mesh>
            <Html position={[0, c.radius + 0.45, 0]} center zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
              <div
                ref={(el) => {
                  labelRefs.current[i] = el;
                }}
                className={`whitespace-nowrap rounded-full border px-3 py-1 text-center font-mono text-[11px] tracking-wide backdrop-blur transition-colors duration-300 ${
                  hovered === i ? "border-accent/60 bg-bg/85 text-ink" : "border-line bg-bg/50 text-muted"
                }`}
              >
                {c.label}
                {hovered === i && (
                  <span className="block pt-0.5 text-[10px] text-accent">{c.skills.slice(0, 3).join(" · ")}</span>
                )}
              </div>
            </Html>
          </group>
        ))}
    </group>
  );
}
