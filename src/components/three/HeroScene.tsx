"use client";

import { Suspense, useEffect, useState, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import DeskModel from "./DeskModel";

type Props = {
  /** Element that receives pointer events (the hero section), so the text above stays clickable */
  eventSource: RefObject<HTMLElement | null>;
  progress: RefObject<number>;
  onReady?: () => void;
};

function Ready({ onReady }: { onReady?: () => void }) {
  useEffect(() => onReady?.(), [onReady]);
  return null;
}

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
      camera={{ position: [20, 3, 5], fov: 25, near: 0.1, far: 200 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      eventSource={eventSource as RefObject<HTMLElement>}
      eventPrefix="client"
      frameloop={reducedMotion ? "demand" : visible ? "always" : "never"}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      style={{ pointerEvents: "none" }}
    >
      {/* onReady fires once the model has loaded, so the poster stays up until then */}
      <Suspense fallback={null}>
        <DeskModel progress={progress} reducedMotion={reducedMotion} />
        <Ready onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
