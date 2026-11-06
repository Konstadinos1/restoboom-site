"use client";

import { useEffect, useRef, useState } from "react";
import { scrambleText } from "@/lib/world/scramble";

/** Noise refreshes ~25 times a second, like a terminal redraw, rather than on every display frame. */
const NOISE_FRAME_MS = 40;

/**
 * igloo-style decoding: when `text` changes, it resolves left to right out of
 * glyph noise over `durationMs`. The first render (which must match the server
 * HTML) and visitors who prefer reduced motion get the text as-is.
 */
export function useScramble(text: string, durationMs: number): string {
  const [shown, setShown] = useState(text);
  const firstRender = useRef(true);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (firstRender.current || reduced) {
      firstRender.current = false;
      setShown(text);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = elapsed / durationMs;
      setShown(progress >= 1 ? text : scrambleText(text, progress, Math.floor(elapsed / NOISE_FRAME_MS)));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, durationMs]);
  return shown;
}
