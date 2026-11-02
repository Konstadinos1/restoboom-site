"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

const HINT_HIDE_AFTER_PX = 40;
const T = {
  fr: { hint: "Défilez pour découvrir", build: "Construction" },
  en: { hint: "Scroll to discover", build: "Building" },
} as const;

/** True once the visitor has scrolled a little: the scroll hint has done its job. */
function useHasScrolled(): boolean {
  const [moved, setMoved] = useState(false);
  useEffect(() => {
    const onScroll = () => window.scrollY > HINT_HIDE_AFTER_PX && setMoved(true);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return moved;
}

/** True while the site footer is on screen, so the fixed HUD can step aside. */
function useFooterInView(): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);
  return inView;
}

/** Bottom HUD on the home page: scroll progress, the scroll hint, Montréal coordinates and the 3D build bar. */
export default function HudBottom({ locale }: { locale: Locale }) {
  const t = T[locale];
  const moved = useHasScrolled();
  const footerInView = useFooterInView();
  return (
    <div className={`hud-bottom ${footerInView ? "is-hidden" : ""}`} aria-hidden="true" data-testid="hud-bottom">
      <div className="wrap hud-bottom-inner">
        <div className="flex flex-col gap-2">
          {/* Phones scroll by habit, and there the hint would sit on the hero's second button. */}
          <span className={`hud-hint hud-label hud-label--light hidden sm:inline-block ${moved ? "is-hidden" : ""}`}>{t.hint} ↓</span>
          <div className="hud-progress"><span /></div>
        </div>
        <div className="hidden flex-col items-end gap-2 sm:flex">
          <span className="hud-label hud-label--light tabular-nums">45.50° N · 73.57° W</span>
          <div className="world-build flex items-center gap-2">
            <span className="hud-label">{t.build}</span>
            <div className="hud-progress hud-progress--build w-20"><span /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
