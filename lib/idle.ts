const IDLE_TIMEOUT_MS = 1800;
const IDLE_FALLBACK_MS = 600;

/** Run `cb` when the browser is idle (so heavy work never competes with first paint). Returns a cancel function. */
export function whenIdle(cb: () => void): () => void {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(cb, { timeout: IDLE_TIMEOUT_MS });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(cb, IDLE_FALLBACK_MS);
  return () => window.clearTimeout(id);
}
