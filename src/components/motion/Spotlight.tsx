"use client";

import type { PointerEvent, ReactNode } from "react";

type Props = { children: ReactNode; className?: string; as?: "div" | "article" };

// Card with a soft glow that follows the cursor (styles: .spotlight in globals.css).
export default function Spotlight({ children, className = "", as: Tag = "div" }: Props) {
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <Tag className={`spotlight ${className}`} onPointerMove={onPointerMove}>
      {children}
    </Tag>
  );
}
