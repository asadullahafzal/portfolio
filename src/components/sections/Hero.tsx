"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { profile, stats } from "@/data/profile";
import Counter from "@/components/motion/Counter";
import { openChat } from "@/lib/chat";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// The 3D desk is client-only and loaded after the page is idle; a still render of it
// (the poster) shows instantly, so phones see the full hero without waiting for WebGL.
const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [showScene, setShowScene] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    if (!supportsWebGL()) return;
    const start = () => setShowScene(true);

    // Phones/tablets: starting WebGL during page load blocks a slow CPU for ~1 s. The
    // poster already shows the desk, so the live scene starts on the first scroll or tap.
    if (window.matchMedia("(pointer: coarse)").matches) {
      const events = ["pointerdown", "touchstart", "scroll", "keydown"] as const;
      const onFirst = () => {
        events.forEach((e) => window.removeEventListener(e, onFirst));
        start();
      };
      events.forEach((e) => window.addEventListener(e, onFirst, { passive: true, once: true }));
      return () => events.forEach((e) => window.removeEventListener(e, onFirst));
    }

    // Desktop: start once the browser is idle
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(start, 600);
    return () => clearTimeout(id);
  }, []);

  // Scrolling past the hero eases the camera towards the monitor
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
    <section ref={ref} id="top" className="relative isolate overflow-hidden pt-16">
      {/* Text is fully visible on first paint: no intro animation hides it (that delayed LCP on phones) */}
      <div className="mx-auto w-full max-w-6xl px-4 pt-14 sm:px-6 sm:pt-20">
        <p className="chip mb-7 w-fit">
          <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden />
          {profile.availability}
        </p>

        <h1 className="font-display text-[clamp(2.9rem,8vw,6.5rem)] leading-[0.98] tracking-[-0.015em]">
          Hi, I&apos;m <span className="accent-italic">Asadullah</span> Afzal
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
          {profile.roles.join(", ").replace(/, ([^,]*)$/, " and $1")}. {profile.tagline} Currently at{" "}
          <span className="text-ink">Dollar Tech</span>, studying CS at <span className="text-ink">FAST-NUCES</span>.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <a href="#projects" className="btn btn-primary">
            View my work <ArrowUpRight size={17} strokeWidth={2.2} aria-hidden />
          </a>
          <button type="button" onClick={() => openChat()} className="btn btn-ghost">
            <MessageCircle size={17} aria-hidden /> Ask my AI
          </button>
          <a href="#contact" className="btn btn-ghost">
            Get in touch
          </a>
        </div>
      </div>

      {/* The desk */}
      <div aria-hidden className="relative mx-auto -mt-2 h-[clamp(300px,58vh,660px)] w-full max-w-7xl">
        <Image
          src="/images/desk-poster.webp"
          alt=""
          fill
          preload
          // Already a small, optimised WebP: skip the on-the-fly optimizer (it slowed LCP)
          unoptimized
          className={`object-contain transition-opacity duration-700 ${sceneReady ? "opacity-0" : "opacity-100"}`}
        />
        <div className={`absolute inset-0 transition-opacity duration-700 ${sceneReady ? "opacity-100" : "opacity-0"}`}>
          {showScene && <HeroScene eventSource={ref} progress={progress} onReady={() => setSceneReady(true)} />}
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6">
        <dl className="grid grid-cols-2 border-y border-line sm:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} className={`px-1 py-6 sm:px-6 ${i > 0 ? "sm:border-l sm:border-line" : ""} ${i % 2 ? "border-l border-line pl-5 sm:pl-6" : ""}`}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-4xl text-ink sm:text-5xl">
                <Counter value={s.value} suffix={s.suffix} />
              </dd>
              <dd className="mt-1 text-xs leading-snug text-muted sm:text-sm">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
