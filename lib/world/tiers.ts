/**
 * Device tiers for the 3D world. Everyone with GPU-backed WebGL2 gets the
 * immersive experience; the tier only scales its cost. "static" means no WebGL
 * at all (reduced motion, Save-Data, no WebGL2, or WebGL2 that would run in
 * software on the CPU): a still image + the HTML content.
 */
export type Tier = "high" | "medium" | "low" | "static";

/** "software": WebGL2 exists but the browser reports a major performance caveat (e.g. SwiftShader, no GPU). */
export type WebGLSupport = "hardware" | "software" | "none";

export type TierSignals = {
  viewportWidth: number;
  reducedMotion: boolean;
  saveData: boolean;
  hardwareConcurrency: number;
  deviceMemory: number | null;
  webgl: WebGLSupport;
  /** QA override (?3d=on): run the world even on software WebGL. Never overrides reduced motion or Save-Data. */
  force3d: boolean;
  coarsePointer: boolean;
};

export type TierConfig = {
  maxDpr: number;
  msaaSamples: number;
  bloomScale: number;
  transmission: boolean;
  shadows: boolean;
  snowParticles: number;
  terrainSegments: number;
  smoothScroll: boolean;
};

/** CPU rasterisers that run WebGL without a GPU (Chrome/ANGLE, Mesa, Windows' fallback adapter). */
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render driver/i;

/**
 * Hardware vs software WebGL2, from two probe contexts: one created with
 * failIfMajorPerformanceCaveat and one without, plus the renderer's name.
 * Headless Chrome serves SwiftShader even to the strict probe, so the name
 * is checked too.
 */
export function classifyWebGL(strictProbeOk: boolean, plainProbeOk: boolean, rendererName: string): WebGLSupport {
  if (!strictProbeOk && !plainProbeOk) return "none";
  if (!strictProbeOk || SOFTWARE_RENDERER.test(rendererName)) return "software";
  return "hardware";
}

const HIGH_CORES = 8;
const HIGH_MIN_WIDTH = 1200;
const LOW_MEMORY_GB = 4;
const LOW_CORES = 4;
const PHONE_MAX_WIDTH = 900;

function canRunWorld(s: TierSignals): boolean {
  if (s.reducedMotion || s.saveData || s.webgl === "none") return false;
  // Software WebGL renders every frame on the CPU: it pins the main thread and drains batteries.
  return s.webgl === "hardware" || s.force3d;
}

export function chooseTier(s: TierSignals): Tier {
  if (!canRunWorld(s)) return "static";
  const weakDevice = s.hardwareConcurrency <= LOW_CORES || (s.deviceMemory !== null && s.deviceMemory <= LOW_MEMORY_GB);
  if ((s.coarsePointer && s.viewportWidth < PHONE_MAX_WIDTH) || weakDevice) return "low";
  if (s.hardwareConcurrency >= HIGH_CORES && s.viewportWidth >= HIGH_MIN_WIDTH && !s.coarsePointer) return "high";
  return "medium";
}

export const TIER_CONFIG: Record<Exclude<Tier, "static">, TierConfig> = {
  high: { maxDpr: 1.5, msaaSamples: 4, bloomScale: 0.5, transmission: true, shadows: true, snowParticles: 1400, terrainSegments: 220, smoothScroll: true },
  medium: { maxDpr: 1.25, msaaSamples: 0, bloomScale: 0.5, transmission: false, shadows: false, snowParticles: 900, terrainSegments: 160, smoothScroll: true },
  low: { maxDpr: 1, msaaSamples: 0, bloomScale: 0.35, transmission: false, shadows: false, snowParticles: 450, terrainSegments: 96, smoothScroll: false },
};
