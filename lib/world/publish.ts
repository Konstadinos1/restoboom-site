/**
 * Bridges the 3D loop to the HUD without React re-rendering every frame:
 * the station id goes on <html data-active-station> (+ an event when it changes) and
 * progress goes into CSS custom properties read by the HUD bars.
 */
import { sectionProgress } from "./director";
import { STATION_IDS, type StationId } from "./stations";

export const STATION_EVENT = "rb:station";
let current: StationId | null = null;
let motion = 0;

export function publishStation(index: number): void {
  const id = STATION_IDS[Math.min(STATION_IDS.length - 1, Math.max(0, index))];
  if (id === current) return;
  current = id;
  document.documentElement.dataset.activeStation = id;
  window.dispatchEvent(new CustomEvent<StationId>(STATION_EVENT, { detail: id }));
}

export function publishProgress(cursor: number): void {
  const overall = Math.min(1, Math.max(0, cursor / (STATION_IDS.length - 1)));
  document.documentElement.style.setProperty("--world-progress", overall.toFixed(4));
}

/** How hard the camera is diving between sections right now (0..1): the sound swells with it. */
export function publishMotion(value: number): void {
  motion = Math.min(1, Math.max(0, value));
}

export function readMotion(): number {
  return motion;
}

export function publishBuild(fraction: number, state: "building" | "ready" | "static"): void {
  document.documentElement.style.setProperty("--world-build", fraction.toFixed(3));
  document.documentElement.dataset.world = state;
}

/** The home sections the camera follows, in page order (sections only: <html> carries data-active-station). */
export function collectStations(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>("main section[data-station]"));
}

export function readStationProgress(stations: readonly HTMLElement[]): number[] {
  const vh = window.innerHeight;
  return stations.map((el, i) => {
    const r = el.getBoundingClientRect();
    return sectionProgress(r.top, r.height, vh, i === 0 ? 0 : vh / 2);
  });
}

/** Leaving the home page: forget the station so other pages show their own label. */
export function resetStation(): void {
  current = null;
  motion = 0;
  delete document.documentElement.dataset.activeStation;
  document.documentElement.style.removeProperty("--world-progress");
}
