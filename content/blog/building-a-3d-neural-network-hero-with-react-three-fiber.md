---
title: "How I built a 3D neural-network hero with React Three Fiber"
description: "The glowing neural network at the top of my portfolio: how it's generated, why I skipped bloom for a custom glow shader, and the tricks that keep it fast on phones."
date: 2026-10-09
tags: [Three.js, React Three Fiber, WebGL, Performance]
---

The first thing you see on my portfolio is a glowing 3D neural network. It isn't decoration for its own sake: each cluster of neurons is one of my skill areas, with **Full-Stack** at the core and AI, SEO, data, languages and ad-tech wired around it. Signals pulse between them, hovering a cluster lights it up, and scrolling flies the camera *into* the network.

Here's how it works, and the performance decisions that let it run smoothly on a mid-range phone.

## The stack

- **Three.js** through **React Three Fiber** (R3F), so the scene is just React components
- **@react-three/drei** for the HTML labels that float over each cluster
- **GSAP ScrollTrigger** to drive the scroll fly-through
- **Next.js 16**, with the whole scene loaded client-side only

## Generating the network from data

The network isn't hand-placed. It's built from the same data file that drives the rest of the site, so adding a skill group adds a cluster.

Each cluster gets a centre point, and its neurons are scattered uniformly inside a sphere around it. Then I wire them up:

1. Every neuron connects to its **3 nearest neighbours** in the same cluster.
2. Every specialty sends **3 connections into the Full-Stack core**.
3. Neighbouring specialties link to each other around the ring.

I use a **seeded random generator** (mulberry32) instead of `Math.random()`, so the network has the same shape on every visit:

```ts
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

## Why I didn't use bloom

The obvious way to make things glow in Three.js is a bloom post-processing pass. It looks great, but it re-renders the whole screen every frame, which is expensive on phones.

Instead, each neuron is a **point sprite** with a tiny custom shader that draws a bright white core inside a soft coloured halo:

```glsl
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d > 1.0) discard;
  float core = smoothstep(0.32, 0.0, d);
  float halo = pow(1.0 - d, 2.4);
  vec3 color = vColor * halo + vec3(1.0) * core * 0.85;
  gl_FragColor = vec4(color, (halo * 0.85 + core) * uOpacity);
}
```

With additive blending, overlapping halos brighten each other, so dense clusters glow more, which is exactly the effect bloom would give, at a fraction of the cost. 124 neurons, 265 connections and 72 moving signals render as just three objects: one set of lines and two point clouds.

## Signals that "fire" neurons

Each signal travels along a connection. When it arrives, the target neuron **flashes** (its size and brightness spike, then decay) and the signal picks another connection leaving that neuron, so activity flows through the network instead of looping on one edge.

All of this state lives outside React. The frame loop mutates typed arrays directly and flags the GPU buffers for upload:

```ts
pulse.t += (dt * pulse.speed) / edgeLength;
if (pulse.t >= 1) {
  flash[target] = 1; // the neuron fires
  pulse.edge = nextEdgeFrom(target);
  pulse.t = 0;
}
geometry.attributes.position.needsUpdate = true;
```

Re-rendering React components 60 times a second would be far too slow; R3F's `useFrame` plus mutable buffers keeps it smooth.

## Hover without blocking the page

The canvas sits *behind* the hero text, so it can't take mouse events directly, or the buttons on top would stop working. R3F's `eventSource` solves this: the canvas ignores the pointer (`pointer-events: none`), and R3F listens on the hero section instead, raycasting into the scene itself.

Each cluster has an invisible sphere as its hover target. Hovering one brightens that cluster, dims the rest, and expands its label to show the top three skills.

## The scroll fly-through

My first version scrolled the network off screen with the page, which felt flat. The fix was to **pin the canvas to the viewport** (`position: fixed`) and let ScrollTrigger feed the scroll progress into the camera instead:

```ts
const e = Math.pow(progress, 1.6);
camera.position.set(x * e, y * e, 13 - e * 11.5);
```

The camera accelerates into the network while the hero text drifts away, and the whole layer fades out as the next section arrives.

## Making it fast and robust

This is the part that matters most in production:

- **Load it last.** The scene is a separate bundle imported with `next/dynamic` (`ssr: false`) and mounted in `requestIdleCallback`, so the text paints first and the 3D fades in after.
- **Stop when hidden.** An `IntersectionObserver` switches R3F's `frameloop` to `"never"` once you've scrolled past the hero, so it costs nothing while you read the rest of the page.
- **Adapt to the screen.** On phones *and* portrait tablets the network moves behind the text, so it gets fewer neurons, lower opacity and no labels. I learned the portrait-tablet case the hard way: a tall browser window put full-brightness labels right over my name.
- **Don't trust `window.innerWidth` at mount.** A page loaded in a background tab can report a width of `0`. I decide the layout from the canvas's real measured size instead, so it corrects itself.
- **Fallbacks.** No WebGL? The CSS gradient glow behind the hero stays and nothing breaks. Reduced motion? The network renders one still frame.

## Results

The hero loads after the page's text, the page keeps a Cumulative Layout Shift of **0**, and Lighthouse scores the site **100 for SEO, accessibility and best practices**.

You can see it at the top of [my homepage](/), and the full source is on [GitHub](https://github.com/asadullahafzal/portfolio).
