/**
 * Pure geometry for the floating station scenes (stage 2): outlines that get
 * extruded into glowing objects frozen in ice, crack paths, clock hands and
 * layouts. All original shapes; no three.js here so it stays unit-testable.
 */
import { createRng } from "./random";
import type { Vec3 } from "./explode";

export type Vec2 = { x: number; y: number };

const TAU = Math.PI * 2;
const MINUTES_PER_HOUR = 60;
const HOURS_ON_DIAL = 12;

/** A star with `points` tips, the first tip pointing straight up. */
export function starOutline(points: number, outer: number, inner: number): Vec2[] {
  if (points < 3) throw new Error("starOutline: a star needs at least 3 points");
  return Array.from({ length: points * 2 }, (_, i) => {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = Math.PI / 2 + (i * Math.PI) / points;
    return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
  });
}

// Right half of a stylised 11-point maple leaf, top tip to stem, about 1.6 units tall. Drawn for this site.
const MAPLE_RIGHT_HALF: readonly Vec2[] = [
  { x: 0, y: 1.0 }, { x: 0.12, y: 0.62 }, { x: 0.3, y: 0.72 }, { x: 0.24, y: 0.3 }, { x: 0.62, y: 0.52 },
  { x: 0.56, y: 0.38 }, { x: 0.86, y: 0.36 }, { x: 0.7, y: 0.16 }, { x: 0.78, y: 0.08 }, { x: 0.4, y: -0.14 },
  { x: 0.46, y: -0.32 }, { x: 0.06, y: -0.28 }, { x: 0.05, y: -0.6 },
];

/** Closed, symmetric maple leaf outline scaled by `size`: down the right edge from the top tip, back up the left. */
export function mapleLeafOutline(size: number): Vec2[] {
  const right = MAPLE_RIGHT_HALF.map((p) => ({ x: p.x * size, y: p.y * size }));
  // Mirror the right half, minus the top tip that sits on the axis, and walk it back up.
  const left = right.slice(1).reverse().map((p) => ({ x: -p.x, y: p.y }));
  return [...right, ...left];
}

/** Heart from the classic parametric curve, sampled at `samples` points, about `size` wide. */
export function heartOutline(size: number, samples: number): Vec2[] {
  const scale = size / 34;
  return Array.from({ length: samples }, (_, i) => {
    const t = (i / samples) * TAU;
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return { x: x * scale, y: y * scale };
  });
}

/** Rounded chat bubble with a tail at the bottom left, centred on the origin. */
export function speechBubbleOutline(width: number, height: number, radius: number, cornerSteps: number): Vec2[] {
  const hw = width / 2;
  const hh = height / 2;
  const corner = (cx: number, cy: number, from: number) =>
    Array.from({ length: cornerSteps + 1 }, (_, i) => {
      const a = from + (i / cornerSteps) * (Math.PI / 2);
      return { x: cx + Math.cos(a) * radius, y: cy + Math.sin(a) * radius };
    });
  return [
    ...corner(hw - radius, -hh + radius, -Math.PI / 2),
    ...corner(hw - radius, hh - radius, 0),
    ...corner(-hw + radius, hh - radius, Math.PI / 2),
    ...corner(-hw + radius, -hh + radius, Math.PI),
    { x: -hw + radius * 1.4, y: -hh - height * 0.32 },
    { x: -hw + radius * 2.6, y: -hh },
  ];
}

/** A jagged crack across an ice face: `segments` steps from `start`, wandering around `angle`. */
export function crackPath(seed: number, start: Vec2, angle: number, length: number, segments: number, jitter: number): Vec2[] {
  const rng = createRng(seed);
  const step = length / segments;
  const points: Vec2[] = [start];
  let heading = angle;
  for (let i = 0; i < segments; i++) {
    heading = angle + (rng() - 0.5) * 2 * jitter;
    const last = points[points.length - 1];
    points.push({ x: last.x + Math.cos(heading) * step, y: last.y + Math.sin(heading) * step });
  }
  return points;
}

/** Hand angles for a wall clock, radians clockwise from 12 o'clock. */
export function clockHandAngles(hours: number, minutes: number): { hour: number; minute: number } {
  const totalMinutes = (hours % HOURS_ON_DIAL) * MINUTES_PER_HOUR + minutes;
  return {
    hour: (totalMinutes / (HOURS_ON_DIAL * MINUTES_PER_HOUR)) * TAU,
    minute: ((minutes % MINUTES_PER_HOUR) / MINUTES_PER_HOUR) * TAU,
  };
}

/**
 * Where the little ice bistros stand on each pricing pillar: one for a single
 * restaurant, a triangle of three for a small group, a ring of six around a
 * centre one for a franchise.
 */
export function pricingVillage(restaurants: 1 | 3 | 7, spacing: number): Vec2[] {
  if (restaurants === 1) return [{ x: 0, y: 0 }];
  const ringCount = restaurants === 3 ? 3 : 6;
  const ring = Array.from({ length: ringCount }, (_, i) => {
    const a = Math.PI / 2 + (i / ringCount) * TAU;
    return { x: Math.cos(a) * spacing, y: Math.sin(a) * spacing };
  });
  return restaurants === 3 ? ring : [{ x: 0, y: 0 }, ...ring];
}

/** Stepping stones climbing to the right: x spread, rising y, gentle zig-zag in depth. */
export function steppingStones(count: number, spread: number, rise: number): Vec3[] {
  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0.5 : i / (count - 1);
    return { x: (t - 0.5) * spread, y: (t - 0.5) * rise, z: i % 2 === 0 ? 0.3 : -0.3 };
  });
}
