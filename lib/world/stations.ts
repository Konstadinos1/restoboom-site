/**
 * The camera plan: one entry per home-page section, in page order. The bistro
 * sits at the origin on a snowy plateau; the other stations float high in the
 * fog (y = VOID_Y), one every STATION_SPACING units, like igloo's project cubes.
 */
import type { StationCamera } from "./director";
import type { Vec3 } from "./explode";

export const STATION_IDS = ["hero", "scene", "pains", "platform", "steps", "compliance", "samples", "pricing", "faq", "closer"] as const;
export type StationId = (typeof STATION_IDS)[number];

export const VOID_Y = 70;
export const STATION_SPACING = 60;
const HERO_FOG = 0.02;
const VOID_FOG = 0.07;
/** The platform's cubes are framed from farther back (four of them): thinner fog keeps them clear. */
const PLATFORM_FOG = 0.045;

/** Where a floating station's object lives. */
export function stationAnchor(index: number): Vec3 {
  return { x: 0, y: VOID_Y, z: -STATION_SPACING * index };
}

/** Progress to hand a station's scene: its own while current, finished once passed, not started before. */
export function stationLocal(index: number, current: number, local: number): number {
  if (index === current) return local;
  return index < current ? 1 : 0;
}

const v = (x: number, y: number, z: number): Vec3 => ({ x, y, z });
const add = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });

/** Panels sit on one side; the object is framed on the other by shifting the look-at target. */
function voidStation(index: number, panelSide: "left" | "right", distance = 9, fog = VOID_FOG): StationCamera {
  const a = stationAnchor(index);
  const shift = panelSide === "left" ? -1.6 : 1.6;
  return {
    from: { pos: add(a, v(0, 0.9, distance)), target: add(a, v(shift, 0.2, 0)), fov: 36 },
    to: { pos: add(a, v(panelSide === "left" ? 1.6 : -1.6, 0.4, distance * 0.72)), target: add(a, v(shift * 0.8, 0.1, 0)), fov: 38 },
    fog,
  };
}

export const STATION_CAMERAS: readonly StationCamera[] = [
  { from: { pos: v(-1.6, 3.4, 17.5), target: v(-4.4, 1.9, 0), fov: 34 }, to: { pos: v(-4.0, 2.8, 11), target: v(-3.2, 2.2, 0), fov: 38 }, fog: HERO_FOG },
  voidStation(1, "left"),
  voidStation(2, "right"),
  voidStation(3, "left", 13, PLATFORM_FOG),
  voidStation(4, "right"),
  voidStation(5, "left"),
  voidStation(6, "right", 10),
  voidStation(7, "left", 12),
  voidStation(8, "right"),
  { from: { pos: v(-9, 3.8, 15), target: v(-4.6, 1.8, 0), fov: 34 }, to: { pos: v(-5.2, 3.0, 12.5), target: v(-3.4, 2.0, 0), fov: 38 }, fog: HERO_FOG },
];
