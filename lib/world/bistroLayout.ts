/**
 * Procedural layout of the ice-block bistro: four walls in running bond, a
 * storefront with a window and a door, a parapet and a flat roof of slabs.
 * Pure data (no three.js) so it is unit-tested and identical on every visit.
 */
import { createRng } from "./random";

export const BRICK = { length: 0.6, height: 0.32, depth: 0.34 } as const;
export const BISTRO = { width: 5.4, depth: 3.6, rows: 9 } as const;
export const WALL_HEIGHT = BISTRO.rows * BRICK.height;
const ROOF_SLAB = 0.16;
const JITTER = 0.018;
const OPENING_OVERLAP = 0.4;

export type Opening = { name: "window" | "door"; x0: number; x1: number; y0: number; y1: number };
export const OPENINGS: readonly Opening[] = [
  { name: "window", x0: -2.25, x1: -0.45, y0: 0.62, y1: 2.25 },
  { name: "door", x0: 0.55, x1: 1.55, y0: 0, y1: 2.0 },
];

export type WallName = "front" | "back" | "left" | "right" | "parapet" | "roof";
export type Brick = { x: number; y: number; z: number; sx: number; sy: number; sz: number; ry: number; wall: WallName; row: number };

/** Split a span into bricks; odd rows start with a half brick (running bond). */
function courseSegments(span: number, row: number): { center: number; length: number }[] {
  const len = span / Math.max(1, Math.round(span / BRICK.length));
  const out: { center: number; length: number }[] = [];
  let cursor = 0;
  if (row % 2 === 1) {
    out.push({ center: len / 4, length: len / 2 });
    cursor = len / 2;
  }
  while (cursor + len <= span + 1e-6) {
    out.push({ center: cursor + len / 2, length: len });
    cursor += len;
  }
  if (span - cursor > 1e-6) out.push({ center: cursor + (span - cursor) / 2, length: span - cursor });
  return out.map((seg) => ({ center: seg.center - span / 2, length: seg.length }));
}

/** True when a front-wall brick sits mostly inside the window or the door. */
export function inOpening(x: number, length: number, y: number): boolean {
  return OPENINGS.some((o) => {
    const overlap = Math.min(x + length / 2, o.x1) - Math.max(x - length / 2, o.x0);
    return overlap > length * OPENING_OVERLAP && y > o.y0 && y < o.y1;
  });
}

function wallBricks(wall: "front" | "back" | "left" | "right"): Brick[] {
  const alongX = wall === "front" || wall === "back";
  const span = alongX ? BISTRO.width : BISTRO.depth - 2 * BRICK.depth;
  const offset = (alongX ? BISTRO.depth : BISTRO.width) / 2 - BRICK.depth / 2;
  const sign = wall === "front" || wall === "right" ? 1 : -1;
  const out: Brick[] = [];
  for (let row = 0; row < BISTRO.rows; row++) {
    const y = row * BRICK.height + BRICK.height / 2;
    for (const seg of courseSegments(span, row)) {
      if (wall === "front" && inOpening(seg.center, seg.length, y)) continue;
      const along = { sx: seg.length, sz: BRICK.depth };
      out.push(alongX
        ? { x: seg.center, y, z: sign * offset, ...along, sy: BRICK.height, ry: 0, wall, row }
        : { x: sign * offset, y, z: seg.center, sx: BRICK.depth, sy: BRICK.height, sz: seg.length, ry: 0, wall, row });
    }
  }
  return out;
}

function roofAndParapet(): Brick[] {
  const out: Brick[] = [];
  const top = WALL_HEIGHT;
  const nx = 8;
  const nz = 5;
  for (let i = 0; i < nx; i++) {
    for (let k = 0; k < nz; k++) {
      const sx = BISTRO.width / nx;
      const sz = BISTRO.depth / nz;
      out.push({ x: -BISTRO.width / 2 + sx * (i + 0.5), y: top + ROOF_SLAB / 2, z: -BISTRO.depth / 2 + sz * (k + 0.5), sx, sy: ROOF_SLAB, sz, ry: 0, wall: "roof", row: BISTRO.rows });
    }
  }
  for (const seg of courseSegments(BISTRO.width, 1)) {
    for (const z of [BISTRO.depth / 2 - BRICK.depth / 2, -BISTRO.depth / 2 + BRICK.depth / 2]) {
      out.push({ x: seg.center, y: top + ROOF_SLAB + BRICK.height / 2, z, sx: seg.length, sy: BRICK.height, sz: BRICK.depth, ry: 0, wall: "parapet", row: BISTRO.rows + 1 });
    }
  }
  return out;
}

/** All bricks with a tiny seeded jitter so the walls look hand-built. */
export function buildBistroLayout(seed = 7): Brick[] {
  const rng = createRng(seed);
  const all = [...wallBricks("front"), ...wallBricks("back"), ...wallBricks("left"), ...wallBricks("right"), ...roofAndParapet()];
  return all.map((b) => ({ ...b, x: b.x + (rng() - 0.5) * JITTER, y: b.y + (rng() - 0.5) * JITTER * 0.5, z: b.z + (rng() - 0.5) * JITTER, ry: (rng() - 0.5) * 0.03 }));
}
