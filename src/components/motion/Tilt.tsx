"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

type Props = { children: ReactNode; className?: string; max?: number };

// Card that tilts slightly towards the cursor (the reference's react-tilt effect, without the dependency).
export default function Tilt({ children, className = "", max = 10 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1000px) rotateX(${-y * max}deg) rotateY(${x * max}deg) scale(1.02)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={`transition-transform duration-300 ease-out will-change-transform motion-reduce:transform-none ${className}`}
    >
      {children}
    </div>
  );
}
