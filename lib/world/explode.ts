/**
 * Brick motion for the hero: bricks fly in to build the bistro (intro), then
 * lift apart as the visitor scrolls (deconstruction), igloo-style. Pure math.
 */
import { clamp01, easeInOutCubic, easeOutCubic } from "./random";

export type Vec3 = { x: number; y: number; z: number };
export type Pose = Vec3 & { rx: number; ry: number; rz: number };
/** Five per-brick random numbers in [0, 1), fixed for the brick's lifetime. */
export type BrickRandom = readonly [number, number, number, number, number];

const STAGGER = 0.4;
const LIFT = 1.1;
const EXTRA_LIFT = 2.2;
const MIN_DISTANCE = 1.4;
const EXTRA_DISTANCE = 3.6;
const SPIN = Math.PI * 1.1;
const HOVER_HEIGHT = 0.09;
const HOVER_SPEED = 0.8;
const NO_DRIFT: Vec3 = { x: 0, y: 0, z: 0 };

/**
 * Pose of a brick displaced by `amount` (0 = in the wall, 1 = fully apart).
 * Bricks fly outward from `center`; `drift` (horizontal) bends every path the
 * same way, so the hero can open away from the camera and the headline.
 */
export function displacedPose(home: Vec3, center: Vec3, rnd: BrickRandom, amount: number, drift: Vec3 = NO_DRIFT): Pose {
  const dx = home.x - center.x;
  const dz = home.z - center.z;
  const radial = Math.hypot(dx, dz) || 1;
  const ux = dx / radial + drift.x;
  const uz = dz / radial + drift.z;
  const len = Math.hypot(ux, uz) || 1;
  const dist = (MIN_DISTANCE + rnd[0] * EXTRA_DISTANCE) * amount;
  return {
    x: home.x + (ux / len) * dist,
    y: home.y + (LIFT + rnd[1] * EXTRA_LIFT) * amount,
    z: home.z + (uz / len) * dist,
    rx: (rnd[2] - 0.5) * SPIN * amount,
    ry: (rnd[3] - 0.5) * SPIN * amount,
    rz: (rnd[4] - 0.5) * SPIN * amount,
  };
}

/** Slow vertical bob of a loose brick, scaled by how far apart it is (0 while in the wall). */
export function hoverOffset(rnd: BrickRandom, amount: number, timeSeconds: number): number {
  if (amount <= 0) return 0;
  return Math.sin(timeSeconds * HOVER_SPEED + rnd[0] * Math.PI * 2) * HOVER_HEIGHT * amount;
}

/** Scroll deconstruction: higher bricks leave first. `heightRatio` is y / building height. */
export function deconstructAmount(scroll: number, heightRatio: number): number {
  const delay = STAGGER * (1 - clamp01(heightRatio));
  return easeInOutCubic(clamp01((scroll - delay) / (1 - STAGGER)));
}

/** Intro build-up: lower bricks land first; returns how far apart the brick still is (1 → 0). */
export function assemblyAmount(intro: number, heightRatio: number): number {
  const delay = STAGGER * clamp01(heightRatio);
  return 1 - easeOutCubic(clamp01((intro - delay) / (1 - STAGGER)));
}
