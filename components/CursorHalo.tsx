"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { CLICKABLE, CURSOR_LABELS, cursorMode, TEXT_ENTRY, type PointerTarget } from "@/lib/cursor";
import type { Locale } from "@/lib/i18n";
import { approach } from "@/lib/world/explore";

/** How fast the reticle catches up with the pointer, per second: it trails just enough to feel weighty. */
const FOLLOW_RATE = 22;
const SETTLED_PX = 0.1;
const FRAME_S = 1 / 60;
const FINE_POINTER = "(pointer: fine) and (hover: hover)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function describe(target: EventTarget | null): PointerTarget {
  const el = target instanceof Element ? target : null;
  return { textEntry: Boolean(el?.closest(TEXT_ENTRY)), clickable: Boolean(el?.closest(CLICKABLE)) };
}

/** A mouse or trackpad only, and not for visitors who asked for less motion. */
function useCursorAllowed(): boolean {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => setAllowed(window.matchMedia(FINE_POINTER).matches && !window.matchMedia(REDUCED_MOTION).matches), []);
  return allowed;
}

/** Eases the reticle towards the pointer on animation frames, only while it still has somewhere to go. */
function createFollower(el: HTMLElement) {
  const at = { x: 0, y: 0 };
  const to = { x: 0, y: 0 };
  let raf = 0;
  let last = 0;
  const step = (now: number) => {
    const dt = last ? (now - last) / 1000 : FRAME_S;
    at.x = approach(at.x, to.x, dt, FOLLOW_RATE);
    at.y = approach(at.y, to.y, dt, FOLLOW_RATE);
    el.style.transform = `translate3d(${at.x}px, ${at.y}px, 0)`;
    const settled = Math.abs(at.x - to.x) < SETTLED_PX && Math.abs(at.y - to.y) < SETTLED_PX;
    last = settled ? 0 : now;
    raf = settled ? 0 : requestAnimationFrame(step);
  };
  const moveTo = (x: number, y: number, jump: boolean) => {
    Object.assign(to, { x, y });
    if (jump) Object.assign(at, { x, y });
    if (!raf) raf = requestAnimationFrame(step);
  };
  return { moveTo, stop: () => cancelAnimationFrame(raf) };
}

/** Follows the mouse and re-reads its mode from what is under it and from <html data-cursor> (the 3D cubes). */
function useReticle(ref: RefObject<HTMLDivElement | null>, allowed: boolean): void {
  useEffect(() => {
    const el = ref.current;
    if (!allowed || !el) return;
    const follower = createFollower(el);
    let over: PointerTarget | null = null;
    const render = () => (el.dataset.mode = cursorMode(over, document.documentElement.dataset.cursor));
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      follower.moveTo(e.clientX, e.clientY, over === null);
      over = describe(e.target);
      render();
    };
    // A scroll can bring a link under a pointer that hasn't moved: the browser then only sends pointerover.
    const onOver = (e: PointerEvent) => e.pointerType === "mouse" && over !== null && ((over = describe(e.target)), render());
    const onOut = (e: PointerEvent) => e.relatedTarget === null && ((over = null), render());
    const onDown = () => (el.dataset.pressed = "true");
    const onUp = () => delete el.dataset.pressed;
    const hints = new MutationObserver(render);
    hints.observe(document.documentElement, { attributes: true, attributeFilter: ["data-cursor"] });
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      hints.disconnect();
      follower.stop();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [ref, allowed]);
}

/**
 * HUD cursor: four corner ticks trailing the system pointer (which stays visible, at the size the
 * visitor chose). They open up over links and buttons and, over a 3D cube, say "Explorer" or "Fermer".
 */
export default function CursorHalo({ locale }: { locale: Locale }) {
  const ref = useRef<HTMLDivElement>(null);
  const allowed = useCursorAllowed();
  useReticle(ref, allowed);
  if (!allowed) return null;
  const labels = CURSOR_LABELS[locale];
  return (
    <div ref={ref} className="cursor-reticle" data-mode="hidden" aria-hidden="true" data-testid="cursor">
      <span className="cursor-box">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="cursor-label cursor-label--explore hud-label">{labels.explore}</span>
      <span className="cursor-label cursor-label--close hud-label">{labels.close}</span>
    </div>
  );
}
