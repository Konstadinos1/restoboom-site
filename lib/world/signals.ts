/** Reads the browser signals that decide the 3D tier (see tiers.ts). Browser-only. */
import { classifyWebGL, type TierSignals, type WebGLSupport } from "./tiers";

const FORCE_3D_PARAM = "3d";
const FORCE_3D_VALUE = "on";

type Probe = { ok: boolean; renderer: string };

function rendererName(gl: WebGL2RenderingContext): string {
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  return String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? "");
}

/** Creates a throwaway WebGL2 context and releases it at once; browsers cap live WebGL contexts. */
function probeContext(attributes: WebGLContextAttributes): Probe {
  try {
    const gl = document.createElement("canvas").getContext("webgl2", attributes);
    if (!gl) return { ok: false, renderer: "" };
    const renderer = rendererName(gl);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return { ok: true, renderer };
  } catch {
    return { ok: false, renderer: "" };
  }
}

export function probeWebGL(): WebGLSupport {
  const strict = probeContext({ failIfMajorPerformanceCaveat: true });
  const plain = strict.ok ? strict : probeContext({});
  return classifyWebGL(strict.ok, plain.ok, plain.renderer);
}

export function readTierSignals(): TierSignals {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  return {
    viewportWidth: window.innerWidth,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: Boolean(nav.connection?.saveData),
    hardwareConcurrency: nav.hardwareConcurrency || 2,
    deviceMemory: typeof nav.deviceMemory === "number" ? nav.deviceMemory : null,
    webgl: probeWebGL(),
    force3d: new URLSearchParams(window.location.search).get(FORCE_3D_PARAM) === FORCE_3D_VALUE,
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
  };
}
