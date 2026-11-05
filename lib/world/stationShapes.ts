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

/** A rectangle centred on the origin. */
export type Rect = { w: number; h: number };

const EDGE_EPSILON = 1e-6;

/** Where a ray from `from` (inside the rectangle) heading `angle` leaves it. */
export function rayToEdge(from: Vec2, angle: number, rect: Rect): Vec2 {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const exitX = dx > 0 ? (rect.w / 2 - from.x) / dx : dx < 0 ? (-rect.w / 2 - from.x) / dx : Infinity;
  const exitY = dy > 0 ? (rect.h / 2 - from.y) / dy : dy < 0 ? (-rect.h / 2 - from.y) / dy : Infinity;
  const t = Math.max(0, Math.min(exitX, exitY));
  return { x: from.x + dx * t, y: from.y + dy * t };
}

const clampInside = (p: Vec2, rect: Rect, inset: number): Vec2 => ({
  x: Math.max(-rect.w / 2 + inset, Math.min(rect.w / 2 - inset, p.x)),
  y: Math.max(-rect.h / 2 + inset, Math.min(rect.h / 2 - inset, p.y)),
});

/**
 * A crack from `start` right across to the face's border: the jagged path kept
 * `inset` inside the face, then finished straight to the edge along `angle`, so
 * the cracks cut the face into separate pieces (see crackRegions).
 */
export function edgeCrack(seed: number, start: Vec2, angle: number, rect: Rect, segments: number, jitter: number, inset: number): Vec2[] {
  const end = rayToEdge(start, angle, rect);
  const reach = Math.hypot(end.x - start.x, end.y - start.y);
  const path = crackPath(seed, start, angle, reach * 0.85, segments, jitter).map((p) => clampInside(p, rect, inset));
  return [...path, rayToEdge(path[path.length - 1], angle, rect)];
}

/** Distance along the border, counter-clockwise from the bottom-left corner, of a point on it. */
export function perimeterPosition(p: Vec2, rect: Rect): number {
  const hw = rect.w / 2;
  const hh = rect.h / 2;
  const distances = [Math.abs(p.y + hh), Math.abs(p.x - hw), Math.abs(p.y - hh), Math.abs(p.x + hw)];
  const side = distances.indexOf(Math.min(...distances));
  if (side === 0) return p.x + hw;
  if (side === 1) return rect.w + p.y + hh;
  if (side === 2) return rect.w + rect.h + hw - p.x;
  return 2 * rect.w + rect.h + hh - p.y;
}

function cornersBetween(from: number, to: number, rect: Rect): Vec2[] {
  const perimeter = 2 * (rect.w + rect.h);
  const hw = rect.w / 2;
  const hh = rect.h / 2;
  const corners = [
    { t: 0, p: { x: -hw, y: -hh } }, { t: rect.w, p: { x: hw, y: -hh } },
    { t: rect.w + rect.h, p: { x: hw, y: hh } }, { t: 2 * rect.w + rect.h, p: { x: -hw, y: hh } },
  ];
  const span = (((to - from) % perimeter) + perimeter) % perimeter;
  const ahead = (t: number) => (((t - from) % perimeter) + perimeter) % perimeter;
  return corners
    .filter((c) => ahead(c.t) > EDGE_EPSILON && ahead(c.t) < span - EDGE_EPSILON)
    .sort((a, b) => ahead(a.t) - ahead(b.t))
    .map((c) => c.p);
}

/**
 * The pieces a face breaks into along cracks that all start at one point and
 * end on its border (as edgeCrack draws them): one counter-clockwise outline
 * per piece, each between two neighbouring cracks.
 */
export function crackRegions(cracks: readonly Vec2[][], rect: Rect): Vec2[][] {
  if (cracks.length < 2) throw new Error("crackRegions: it takes at least two cracks to split a face");
  const order = [...cracks].sort((a, b) => perimeterPosition(a[a.length - 1], rect) - perimeterPosition(b[b.length - 1], rect));
  return order.map((crack, i) => {
    const next = order[(i + 1) % order.length];
    const from = perimeterPosition(crack[crack.length - 1], rect);
    const to = perimeterPosition(next[next.length - 1], rect);
    // Out along this crack, round the border to the next one, and back in along it (minus the shared start).
    return [...crack, ...cornersBetween(from, to, rect), ...[...next].reverse().slice(0, -1)];
  });
}

/** Signed area of an outline: positive when it runs counter-clockwise. */
export function signedArea(outline: readonly Vec2[]): number {
  return outline.reduce((sum, p, i) => {
    const q = outline[(i + 1) % outline.length];
    return sum + (p.x * q.y - q.x * p.y) / 2;
  }, 0);
}

export function centroid(outline: readonly Vec2[]): Vec2 {
  const n = outline.length;
  return { x: outline.reduce((s, p) => s + p.x, 0) / n, y: outline.reduce((s, p) => s + p.y, 0) / n };
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
