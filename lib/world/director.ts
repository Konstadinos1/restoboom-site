/**
 * Scroll director: maps where the visitor is on the page to a camera pose.
 * Each HTML section ("station") owns a camera move; between stations the
 * camera dives through fog with a prismatic burst, like igloo.inc.
 */
import { clamp01, easeInOutCubic, lerp } from "./random";
import type { Vec3 } from "./explode";

export type CameraPose = { pos: Vec3; target: Vec3; fov: number };
export type StationCamera = { from: CameraPose; to: CameraPose; fog: number };
export type CameraFrame = CameraPose & { fog: number; prism: number; station: number; local: number };

/** Share of a station spent settling; the rest is the dive into the next one. */
export const SETTLE = 0.82;

/**
 * 0 when the section's top reaches `startLine` (mid-screen by default), 1 when
 * its bottom reaches mid-screen. The first section starts at the viewport top
 * so the page opens on station 0 at rest instead of a quarter of the way in.
 */
export function sectionProgress(top: number, height: number, viewportHeight: number, startLine = viewportHeight / 2): number {
  const travel = height + startLine - viewportHeight / 2;
  if (travel <= 0) return 0;
  return clamp01((startLine - top) / travel);
}

/** Continuous position along the stations: index + progress within it. */
export function scrollCursor(progresses: readonly number[]): number {
  let cursor = 0;
  progresses.forEach((p, i) => {
    if (p > 0) cursor = i + Math.min(p, 0.9999);
  });
  return cursor;
}

const mixVec = (a: Vec3, b: Vec3, t: number): Vec3 => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), z: lerp(a.z, b.z, t) });
const mixPose = (a: CameraPose, b: CameraPose, t: number): CameraPose => ({ pos: mixVec(a.pos, b.pos, t), target: mixVec(a.target, b.target, t), fov: lerp(a.fov, b.fov, t) });

export function cameraAt(cursor: number, stations: readonly StationCamera[]): CameraFrame {
  const last = stations.length - 1;
  const station = Math.min(last, Math.max(0, Math.floor(cursor)));
  const local = clamp01(cursor - station);
  const cur = stations[station];
  if (local <= SETTLE || station === last) {
    const pose = mixPose(cur.from, cur.to, easeInOutCubic(clamp01(local / SETTLE)));
    return { ...pose, fog: cur.fog, prism: 0, station, local };
  }
  const t = (local - SETTLE) / (1 - SETTLE);
  const next = stations[station + 1];
  const pose = mixPose(cur.to, next.from, easeInOutCubic(t));
  return { ...pose, fog: lerp(cur.fog, next.fog, t), prism: Math.sin(Math.PI * t), station, local };
}

const PORTRAIT_PULLBACK = 1.35;
const PORTRAIT_LIFT = 0.9;

/**
 * Portrait screens: pull the camera back so the object fits, centre it
 * horizontally (panels sit below it, not beside it) and frame it a little
 * higher so text panels at the bottom don't cover it.
 */
export function frameForAspect<T extends CameraPose>(frame: T, aspect: number): T {
  if (aspect >= 1) return frame;
  const k = Math.min(1, (1 - aspect) / 0.45);
  const pull = 1 + (PORTRAIT_PULLBACK - 1) * k;
  const target = { x: lerp(frame.target.x, 0, k), y: frame.target.y - PORTRAIT_LIFT * k, z: frame.target.z };
  const pos = {
    x: target.x + (frame.pos.x - frame.target.x) * pull,
    y: target.y + (frame.pos.y - frame.target.y) * pull + PORTRAIT_LIFT * k,
    z: target.z + (frame.pos.z - frame.target.z) * pull,
  };
  return { ...frame, pos, target, fov: frame.fov + 8 * k };
}
