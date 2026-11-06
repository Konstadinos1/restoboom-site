"use client";

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { whenIdle } from "@/lib/idle";
import { assetPath } from "@/lib/site";
import { HOME_PORTRAIT_STILL, STILLS } from "@/lib/world/stills";
import { scrollCursor } from "@/lib/world/director";
import { collectStations, publishBuild, publishProgress, publishStation, readStationProgress, resetStation } from "@/lib/world/publish";
import { readTierSignals } from "@/lib/world/signals";
import { chooseTier, TIER_CONFIG, type Tier } from "@/lib/world/tiers";
import type { WorldHandle } from "@/lib/world/three/world";

type LenisLike = { raf: (time: number) => void; destroy: () => void };
/** The stills the static tier shows (CSS only fetches them when it applies them). */
const STILL_VARS = {
  "--still-landscape": `url(${assetPath(STILLS.home.src)})`,
  "--still-portrait": `url(${assetPath(HOME_PORTRAIT_STILL.src)})`,
} as CSSProperties;
type Mounted = { handle: WorldHandle; lenis: LenisLike | null };
const LENIS_LERP = 0.09;

/** Keeps the HUD in sync from plain scroll events (static tier, and while the 3D loads). */
function trackWithoutWorld(): () => void {
  let raf = 0;
  const update = () => {
    raf = 0;
    const cursor = scrollCursor(readStationProgress(collectStations()));
    publishStation(Math.floor(cursor));
    publishProgress(cursor);
  };
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => {
    window.removeEventListener("scroll", onScroll);
    cancelAnimationFrame(raf);
  };
}

async function startWorld(canvas: HTMLCanvasElement, tier: Exclude<Tier, "static">, onReady: () => void): Promise<Mounted> {
  const [{ mountWorld }, lenisModule] = await Promise.all([
    import("@/lib/world/three/world"),
    TIER_CONFIG[tier].smoothScroll ? import("lenis") : Promise.resolve(null),
  ]);
  const lenis = lenisModule ? new lenisModule.default({ autoRaf: false, anchors: true, lerp: LENIS_LERP }) : null;
  const stations = collectStations();
  const handle = await mountWorld(canvas, {
    tier,
    readProgress: () => readStationProgress(stations),
    beforeFrame: (t) => lenis?.raf(t),
    onFrame: (f) => {
      publishStation(f.station);
      publishProgress(f.station + f.local);
    },
    onProgress: (p) => publishBuild(p, p >= 1 ? "ready" : "building"),
  });
  onReady();
  return { handle, lenis };
}

const teardown = (m: Mounted) => {
  m.handle.dispose();
  m.lenis?.destroy();
};

type MountCallbacks = { onReady: () => void; onFail: () => void };

/** Mounts the world once the browser is idle; returns the cleanup. Any failure keeps the still fallback. */
function mountWhenIdle(canvasRef: RefObject<HTMLCanvasElement | null>, tier: Exclude<Tier, "static">, cb: MountCallbacks): () => void {
  let disposed = false;
  let mounted: Mounted | null = null;
  const cancelIdle = whenIdle(() => {
    if (!canvasRef.current) return;
    startWorld(canvasRef.current, tier, cb.onReady)
      .then((m) => (disposed ? teardown(m) : (mounted = m)))
      .catch((err) => {
        console.warn("[world] 3D unavailable, keeping the still fallback", err);
        publishBuild(1, "static");
        cb.onFail();
      });
  });
  return () => {
    disposed = true;
    cancelIdle();
    if (mounted) teardown(mounted);
  };
}

/** Picks the tier, mounts the world when the browser is idle and tears it down on unmount. */
function useWorld(canvasRef: RefObject<HTMLCanvasElement | null>): { tier: Tier | "pending"; ready: boolean } {
  const [tier, setTier] = useState<Tier | "pending">("pending");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const chosen = chooseTier(readTierSignals());
    setTier(chosen);
    let stopTracking = trackWithoutWorld();
    if (chosen === "static") {
      publishBuild(1, "static");
      return () => {
        stopTracking();
        resetStation();
      };
    }
    publishBuild(0.05, "building");
    const unmount = mountWhenIdle(canvasRef, chosen, {
      onReady: () => {
        // The world's loop publishes the station from now on.
        stopTracking();
        stopTracking = () => undefined;
        setReady(true);
      },
      onFail: () => setTier("static"),
    });
    return () => {
      unmount();
      stopTracking();
      resetStation();
    };
  }, [canvasRef]);
  return { tier, ready };
}

/** The fixed full-screen 3D world behind the home page (or its rendered still). Content never waits for it. */
export default function WorldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { tier, ready } = useWorld(canvasRef);
  return (
    <div className="world" aria-hidden="true" data-testid="world" data-tier={tier} data-ready={ready ? "true" : "false"} style={STILL_VARS}>
      <div className="world-fallback" />
      <div className="world-still" data-testid="world-still" />
      <canvas ref={canvasRef} className="world-canvas" data-testid="world-canvas" style={{ opacity: ready ? 1 : 0 }} />
    </div>
  );
}
