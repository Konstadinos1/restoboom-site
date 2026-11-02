"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Start revealing just *before* an element enters the viewport, so fast scrollers never land on an empty screen. */
const REVEAL_ROOT_MARGIN = "0px 0px 12% 0px";
const REVEAL_THRESHOLD = 0.04;

/**
 * Observes every [data-reveal] element and adds .is-visible once it scrolls in.
 * The boot script only hides reveal targets if this controller registers in
 * time, so a failed bundle never leaves content invisible.
 */
export default function RevealController() {
  const pathname = usePathname();

  useEffect(() => {
    (window as Window & { __rbReveal?: boolean }).__rbReveal = true;
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: REVEAL_ROOT_MARGIN, threshold: REVEAL_THRESHOLD },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
