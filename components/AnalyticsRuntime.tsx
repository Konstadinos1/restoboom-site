"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { CONSENT_EVENT, track } from "@/lib/analytics";
import { HERO_EXPERIMENT, readVariant } from "@/lib/experiments";
import { captureUtm } from "@/lib/lead";

/**
 * Page views, experiment exposure and CTA clicks. Clicks are declared in markup
 * with data-track="event_name" (+ optional data-track-label) so components stay
 * server-rendered. Every call goes through `track`, which no-ops without consent.
 */
export default function AnalyticsRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      captureUtm(window.sessionStorage, window.location.search);
    } catch {
      // Storage can be blocked (Safari private mode); attribution is best-effort.
    }
  }, []);

  useEffect(() => {
    const send = () => {
      const variant = readVariant(HERO_EXPERIMENT);
      track("pageview", variant ? { ab_hero: variant } : undefined);
    };
    send();
    // A visitor who opts in mid-visit gets the current page counted once.
    window.addEventListener(CONSENT_EVENT, send);
    return () => window.removeEventListener(CONSENT_EVENT, send);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-track]");
      if (!el?.dataset.track) return;
      const variant = readVariant(HERO_EXPERIMENT);
      track(el.dataset.track, { label: el.dataset.trackLabel ?? "", path: window.location.pathname, ...(variant ? { ab_hero: variant } : {}) });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
