"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(SplitText, useGSAP);

type Props = { children: ReactNode; className?: string; as?: "h1" | "h2" | "h3" };

// Heading whose lines rise up from behind a mask as it scrolls into view.
// SplitText re-splits on resize and font load; the reveal only ever plays once.
export default function SplitHeading({ children, className, as: Tag = "h2" }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Once revealed, later re-splits (resize, font load) just show the lines as they are.
      let revealed = false;
      let tween: gsap.core.Tween | null = null;
      const split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) => {
          if (revealed) return;
          tween = gsap.from(self.lines, { yPercent: 110, duration: 1.1, ease: "power4.out", stagger: 0.1, paused: true });
          return tween;
        },
      });
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          revealed = true;
          tween?.play();
          io.disconnect();
        },
        { rootMargin: "0px 0px -10% 0px" },
      );
      io.observe(el);
      return () => {
        io.disconnect();
        split.revert();
      };
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
