"use client";

import { useEffect, useState } from "react";
import type { Module } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { EXPLORE_CLOSE_EVENT, EXPLORE_EVENT, EXPLORE_INDEX_ATTRIBUTE } from "@/lib/world/explore";

const T = {
  fr: { open: "Voir le module", close: "Fermer", label: "Module ouvert dans la 3D" },
  en: { open: "See the module", close: "Close", label: "Module opened in 3D" },
} as const;
const EXPLORED_CLASS = "is-explored";

/** The opened cube's index (null when none), following the 3D explorer; marks the matching module card. */
function useOpenedModule(): number | null {
  const [opened, setOpened] = useState<number | null>(null);
  useEffect(() => {
    const onExplore = (e: Event) => {
      const { index } = (e as CustomEvent<{ index: number | null }>).detail;
      setOpened(index);
      document.querySelectorAll<HTMLElement>(`[${EXPLORE_INDEX_ATTRIBUTE}]`).forEach((card) => {
        card.classList.toggle(EXPLORED_CLASS, Number(card.getAttribute(EXPLORE_INDEX_ATTRIBUTE)) === index);
      });
    };
    window.addEventListener(EXPLORE_EVENT, onExplore);
    return () => window.removeEventListener(EXPLORE_EVENT, onExplore);
  }, []);
  return opened;
}

/**
 * HUD readout for a cube opened in the 3D platform scene: which module it is, a link down to its card,
 * and a close button. The cards stay the real content; this only appears for visitors who click a cube.
 */
export default function ExploreReadout({ locale, modules }: { locale: Locale; modules: readonly Module[] }) {
  const t = T[locale];
  const opened = useOpenedModule();
  const item = opened === null ? null : modules[opened];
  if (!item) return null;
  return (
    <aside className="explore-readout glass ticks p-5" aria-label={t.label} data-testid="explore-readout">
      <p className="flex flex-wrap items-center gap-1.5">
        <span className="hud-label hud-label--accent">{`MODULE_${item.num}`}</span>
        <span className="hud-label hud-label--light">{item.tag}</span>
      </p>
      <p className="display-md mt-3">{item.h}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <a href={`#${item.id}`} className="btn btn-ghost px-4 py-2.5 text-[0.72rem]" data-track="explore_module" data-track-label={item.id}>
          {t.open} <span aria-hidden="true">↓</span>
        </a>
        <button type="button" className="hud-label hud-label--light px-3 py-2.5 hover:bg-slate hover:text-white" onClick={() => window.dispatchEvent(new Event(EXPLORE_CLOSE_EVENT))}>
          {t.close} <span aria-hidden="true">✕</span>
        </button>
      </div>
    </aside>
  );
}
