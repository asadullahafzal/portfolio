"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { playWhenVisible } from "./playWhenVisible";

gsap.registerPlugin(useGSAP);

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Animate direct children one after another instead of the wrapper as a whole. */
  stagger?: boolean;
  delay?: number;
};

// Fades content up as it scrolls into view. Content is fully visible in the
// server HTML (good for SEO); the animation only runs once JS has loaded.
export default function Reveal({ children, as: Tag = "div", className, stagger = false, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Any block element works; typed as div so ref/className/children check cleanly
  const Component = Tag as "div";

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const targets = stagger ? Array.from(el.children) : el;
      const tween = gsap.from(targets, {
        y: 32,
        autoAlpha: 0,
        duration: 0.9,
        ease: "power3.out",
        delay,
        stagger: stagger ? 0.08 : 0,
        paused: true,
      });
      return playWhenVisible(el, tween);
    },
    { scope: ref },
  );

  return (
    <Component ref={ref} className={className}>
      {children}
    </Component>
  );
}
