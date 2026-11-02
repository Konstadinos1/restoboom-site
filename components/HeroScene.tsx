"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { readDeviceSignals, shouldRunWebGL } from "@/lib/scene/capability";
import type { SceneHandle } from "@/lib/scene/emberCrystal";

const IDLE_TIMEOUT_MS = 2500;
const IDLE_FALLBACK_MS = 1200;

/** Wait for the browser to be idle so the 3D scene never competes with LCP. */
function whenIdle(cb: () => void): () => void {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(cb, { timeout: IDLE_TIMEOUT_MS });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(cb, IDLE_FALLBACK_MS);
  return () => window.clearTimeout(id);
}

/** Pointer, scroll, click-pulse and visibility → scene. Returns the unbind function. */
function bindSceneInputs(handle: SceneHandle, section: HTMLElement | null): () => void {
  const onPointer = (e: PointerEvent) => handle.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
  const onScroll = () => handle.setScroll(window.scrollY / Math.max(window.innerHeight, 1));
  const onPulse = () => handle.pulse();
  const onVisibility = () => handle.setActive(!document.hidden);
  // Pause rendering entirely while the hero is off-screen.
  const io = new IntersectionObserver(([entry]) => handle.setActive(entry.isIntersecting && !document.hidden));
  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  section?.addEventListener("pointerdown", onPulse);
  if (section) io.observe(section);
  return () => {
    io.disconnect();
    window.removeEventListener("pointermove", onPointer);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", onVisibility);
    section?.removeEventListener("pointerdown", onPulse);
  };
}

/** Lazy-mount the WebGL scene on capable devices; `ready` flips once it renders. */
function useEmberScene(canvasRef: RefObject<HTMLCanvasElement | null>): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!shouldRunWebGL(readDeviceSignals())) return;
    let disposed = false;
    let teardown = () => {};
    const cancelIdle = whenIdle(async () => {
      try {
        const { mountEmberCrystal } = await import("@/lib/scene/emberCrystal");
        const canvas = canvasRef.current;
        if (disposed || !canvas) return;
        const handle = mountEmberCrystal(canvas);
        const unbind = bindSceneInputs(handle, canvas.closest("section"));
        teardown = () => {
          unbind();
          handle.dispose();
        };
        setReady(true);
      } catch (err) {
        // WebGL init can fail on blocklisted GPUs — the CSS fallback stays visible.
        console.warn("[hero] WebGL scene unavailable", err);
      }
    });
    return () => {
      disposed = true;
      cancelIdle();
      teardown();
    };
  }, [canvasRef]);
  return ready;
}

export default function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ready = useEmberScene(canvasRef);
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div className="hero-fallback transition-opacity duration-[1500ms]" style={{ opacity: ready ? 0.35 : 1 }} />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full transition-opacity duration-[1800ms]"
        style={{ opacity: ready ? 1 : 0 }}
        data-testid="hero-canvas"
        data-ready={ready ? "true" : "false"}
      />
      <div className="hero-vignette" />
    </div>
  );
}
