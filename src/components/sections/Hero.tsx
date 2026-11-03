"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { openChat } from "@/lib/chat";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// The 3D desk is client-only. A still render of it (the poster) shows instantly, so the
// hero looks complete before WebGL and the 1.4 MB model have loaded.
const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

// Skip the live model on slow or data-saving connections; the poster is enough
function onSlowConnection() {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !!c && (c.saveData === true || /(^|-)2g|3g/.test(c.effectiveType ?? ""));
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [showScene, setShowScene] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  // Unpacking the 1.4 MB model blocks the main thread for ~0.5 s, so it starts on the first
  // interaction (mouse move, scroll, tap or key) rather than during page load. The poster
  // looks the same in the meantime, and visitors move the mouse almost immediately.
  useEffect(() => {
    if (!supportsWebGL() || onSlowConnection()) return;
    const events = ["pointermove", "pointerdown", "touchstart", "scroll", "keydown", "wheel"] as const;
    const onFirst = () => {
      events.forEach((e) => window.removeEventListener(e, onFirst));
      setShowScene(true);
    };
    events.forEach((e) => window.addEventListener(e, onFirst, { passive: true, once: true }));
    return () => events.forEach((e) => window.removeEventListener(e, onFirst));
  }, []);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          progress.current = self.progress;
        },
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="top" className="relative isolate mx-auto h-svh min-h-[640px] w-full overflow-hidden">
      {/* The desk fills the hero (poster first, then the live scene) */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <picture>
          <source media="(max-width: 640px)" srcSet="/images/desk-poster-mobile.webp" />
          <img
            src="/images/desk-poster.webp"
            alt=""
            fetchPriority="high"
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover object-bottom transition-opacity duration-700 ${sceneReady ? "opacity-0" : "opacity-100"}`}
          />
        </picture>
        <div className={`absolute inset-0 transition-opacity duration-700 ${sceneReady ? "opacity-100" : "opacity-0"}`}>
          {showScene && <HeroScene eventSource={ref} progress={progress} onReady={() => setSceneReady(true)} />}
        </div>
      </div>

      {/* Text is fully visible on first paint (no intro animation hiding it) */}
      <div className="mx-auto flex max-w-7xl flex-row items-start gap-5 px-6 pt-[108px] sm:px-16 sm:pt-[124px]">
        <div aria-hidden className="mt-5 flex flex-col items-center justify-center">
          <div className="size-5 rounded-full bg-[#915eff]" />
          <div className="violet-gradient h-40 w-1 sm:h-80" />
        </div>

        <div>
          <h1 className="text-[40px] font-black leading-[1.15] text-ink xs:text-[50px] sm:text-[60px] lg:text-[80px] lg:leading-[98px]">
            Hi, I&apos;m <span className="text-[#915eff]">Asadullah</span>
          </h1>
          <p className="mt-2 max-w-3xl text-base font-medium text-[#dfd9ff] xs:text-[20px] sm:text-[26px] lg:text-[30px] lg:leading-[40px]">
            I build products that ship, rank and scale, and teach AI to the people who use them.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#projects" className="btn btn-primary">
              View my work <ArrowUpRight size={17} strokeWidth={2.2} aria-hidden />
            </a>
            <button type="button" onClick={() => openChat()} className="btn btn-ghost bg-bg/40">
              <MessageCircle size={17} aria-hidden /> Ask my AI
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 flex w-full items-center justify-center">
        <a href="#about" aria-label="Scroll to About">
          <div className="flex h-16 w-[35px] items-start justify-center rounded-3xl border-4 border-muted p-2">
            <div className="scroll-dot mb-1 size-3 rounded-full bg-muted" />
          </div>
        </a>
      </div>
    </section>
  );
}
