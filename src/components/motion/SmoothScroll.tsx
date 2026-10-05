"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HEADER_OFFSET = -72;

// Lenis smooth scrolling driven by GSAP's ticker, so Lenis and ScrollTrigger
// share one animation frame loop. Skipped entirely for reduced-motion users.
export default function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      anchors: { offset: HEADER_OFFSET },
      autoRaf: false,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // After client-side navigation: start the new page at the top, or at the
  // requested section (e.g. "/#projects" from a case study), then re-measure triggers.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const target = window.location.hash ? document.querySelector<HTMLElement>(window.location.hash) : null;
      const lenis = lenisRef.current;
      if (target) {
        if (lenis) lenis.scrollTo(target, { offset: HEADER_OFFSET, immediate: true, force: true });
        else target.scrollIntoView();
      } else if (lenis) {
        lenis.scrollTo(0, { immediate: true, force: true });
      }
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
