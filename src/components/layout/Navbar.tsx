"use client";

import { useEffect, useState } from "react";
import { navLinks, profile } from "@/data/profile";
import { CloseIcon, DownloadIcon, MenuIcon } from "@/components/ui/Icons";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open ? "border-b border-line bg-bg/75 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6" aria-label="Main">
        <a href="#top" className="group flex items-center gap-2.5" aria-label={`${profile.name} — home`}>
          <span className="grid size-9 place-items-center rounded-xl border border-line-strong bg-surface-2 font-display text-sm font-bold text-ink shadow-glow transition group-hover:border-accent">
            AA
          </span>
          <span className="hidden font-display text-[0.95rem] font-semibold tracking-tight sm:block">
            Asadullah<span className="text-accent">.</span>
          </span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-full px-3.5 py-2 text-sm text-muted transition hover:bg-white/5 hover:text-ink"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a href={profile.cv} download className="btn btn-ghost hidden !px-4 !py-2 text-sm sm:inline-flex">
            <DownloadIcon width={16} height={16} /> CV
          </a>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-line text-ink md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-line px-4 pb-6 pt-2 md:hidden">
          <ul className="flex flex-col">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-line py-3.5 font-display text-lg text-ink"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a href={profile.cv} download className="btn btn-primary mt-5 w-full">
            <DownloadIcon width={16} height={16} /> Download CV
          </a>
        </div>
      )}
    </header>
  );
}
