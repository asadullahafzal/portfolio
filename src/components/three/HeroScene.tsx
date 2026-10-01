"use client";

import { useEffect, useState, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import NeuralNetwork from "./NeuralNetwork";

type Props = {
  /** Element that receives pointer events (the hero section), so the text above stays clickable */
  eventSource: RefObject<HTMLElement | null>;
  progress: RefObject<number>;
  onReady?: () => void;
};

// Client-only: loaded with next/dynamic after the page is interactive.
export default function HeroScene({ eventSource, progress, onReady }: Props) {
  const [reducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [visible, setVisible] = useState(true);

  // Stop rendering entirely once the hero is off screen
  useEffect(() => {
    const el = eventSource.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [eventSource]);

  return (
    <Canvas
      camera={{ position: [0, 0, 13], fov: 50, near: 0.1, far: 100 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      eventSource={eventSource as RefObject<HTMLElement>}
      eventPrefix="client"
      frameloop={reducedMotion ? "demand" : visible ? "always" : "never"}
      onCreated={() => onReady?.()}
      style={{ pointerEvents: "none" }}
    >
      <NeuralNetwork progress={progress} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
