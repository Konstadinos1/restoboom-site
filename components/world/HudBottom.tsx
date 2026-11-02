"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

const HINT_HIDE_AFTER_PX = 40;
const T = {
  fr: { hint: "Défilez pour découvrir", build: "Construction" },
  en: { hint: "Scroll to discover", build: "Building" },
} as const;

/** Bottom HUD on the home page: scroll progress, the scroll hint, Montréal coordinates and the 3D build bar. */
export default function HudBottom({ locale }: { locale: Locale }) {
  const t = T[locale];
  const [moved, setMoved] = useState(false);
  useEffect(() => {
    const onScroll = () => window.scrollY > HINT_HIDE_AFTER_PX && setMoved(true);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="hud-bottom" aria-hidden="true">
      <div className="flex flex-col gap-2">
        <span className={`hud-hint hud-label hud-label--light ${moved ? "is-hidden" : ""}`}>{t.hint} ↓</span>
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
  );
}
