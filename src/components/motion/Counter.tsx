"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const format = (n: number) => Math.round(n).toLocaleString("en-US");

// Counts up from 0 to `value` when scrolled into view.
// The final number is rendered on the server so crawlers and no-JS users see it.
export default function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // The real number stays on screen until the count-up actually starts, so if the
    // trigger never fires (e.g. a page loaded in a background tab) it never shows "0".
    const state = { n: 0 };
    gsap.to(state, {
      n: value,
      duration: 2,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top bottom", once: true },
      onUpdate: () => {
        el.textContent = format(state.n) + suffix;
      },
    });
  });

  return (
    <span ref={ref} className="tabular-nums">
      {format(value) + suffix}
    </span>
  );
}
