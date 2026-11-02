/** Decide whether the WebGL hero is worth running on this device. Pure → unit-tested. */
export type DeviceSignals = {
  viewportWidth: number;
  reducedMotion: boolean;
  saveData: boolean;
  hardwareConcurrency: number;
  webgl2: boolean;
};

export const MIN_WEBGL_VIEWPORT = 768;
export const MIN_CPU_CORES = 4;

export function shouldRunWebGL(s: DeviceSignals): boolean {
  return s.webgl2 && !s.reducedMotion && !s.saveData && s.viewportWidth >= MIN_WEBGL_VIEWPORT && s.hardwareConcurrency >= MIN_CPU_CORES;
}

export function readDeviceSignals(): DeviceSignals {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  let webgl2 = false;
  try {
    const probe = document.createElement("canvas").getContext("webgl2");
    webgl2 = Boolean(probe);
    // Release the probe context immediately; browsers cap live WebGL contexts.
    probe?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webgl2 = false;
  }
  return {
    viewportWidth: window.innerWidth,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: Boolean(nav.connection?.saveData),
    hardwareConcurrency: nav.hardwareConcurrency || 2,
    webgl2,
  };
}
