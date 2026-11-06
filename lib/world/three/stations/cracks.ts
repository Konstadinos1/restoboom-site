/**
 * Station 03, "what leaks": a slab of ice breaking along four glowing cracks,
 * one per pain point in the panel. As the visitor scrolls, the cracks run out
 * one after another, the pieces part and tip outwards, and the warm glow
 * behind them shows through the gaps while shards drift off like money
 * leaking away.
 */
import {
  CatmullRomCurve3, ExtrudeGeometry, Group, InstancedMesh, Matrix4, Mesh, PlaneGeometry, Quaternion, Shape, TetrahedronGeometry, TubeGeometry,
  Vector2, Vector3,
} from "three";
import { clamp01, createRng, easeInOutCubic } from "../../random";
import { centroid, crackRegions, edgeCrack, type Rect, type Vec2 } from "../../stationShapes";
import type { StationKit, StationScene, StationTick } from "./kit";

const SLAB: Rect & { d: number } = { w: 3.4, h: 2.4, d: 0.46 };
const IMPACT: Vec2 = { x: -0.35, y: 0.2 };
// One heading per pain point (radians).
const CRACK_ANGLES = [0.35, 2.5, -2.4, -0.75] as const;
const CRACK_SEGMENTS = 9;
const CRACK_JITTER = 0.45;
const CRACK_INSET = 0.08;
const CRACK_SEED = 41;
const PIECE_BEVEL = 0.035;
/** How far the pieces part, and how far they tip outwards (radians), once the slab is fully broken. */
const GAP = 0.13;
const TILT = 0.11;
const CORE_RADIUS = 0.017;
const RADIAL_SEGMENTS = 5;
const BED_INSET = 0.12;
const BED_DEPTH = 0.06;
const REVEAL_STAGGER = 0.17;
const REVEAL_SPAN = 0.32;
const OPEN_START = 0.05;
const OPEN_SPAN = 0.6;
const SHARDS = 28;
const SHARD_TRAVEL = 1.6;

const CRACKS: readonly Vec2[][] = CRACK_ANGLES.map((angle, i) => edgeCrack(CRACK_SEED + i, IMPACT, angle, SLAB, CRACK_SEGMENTS, CRACK_JITTER, CRACK_INSET));

/** How much of crack `index` glows: they run out one after another through the section. */
function revealOf(index: number, local: number): number {
  return clamp01((local * 1.15 - index * REVEAL_STAGGER) / REVEAL_SPAN);
}

/** How far the slab has broken apart, 0..1. */
const openOf = (local: number) => easeInOutCubic(clamp01((local - OPEN_START) / OPEN_SPAN));

type Piece = { pivot: Group; home: Vec2; direction: Vec2; tiltAxis: Vector3; phase: number };

/** One solid of ice per region between two cracks, pivoting about its own centre so it tips in place. */
function createPieces(kit: StationKit): Piece[] {
  const depth = SLAB.d - 2 * PIECE_BEVEL;
  return crackRegions(CRACKS, SLAB).map((outline, i) => {
    const geometry = new ExtrudeGeometry(new Shape(outline.map((p) => new Vector2(p.x, p.y))), {
      depth, bevelEnabled: true, bevelThickness: PIECE_BEVEL, bevelSize: PIECE_BEVEL, bevelOffset: -PIECE_BEVEL, bevelSegments: 2, curveSegments: 1,
    });
    const middle = centroid(outline);
    // Centre the solid on its pivot: the bevel keeps neighbouring pieces from overlapping along the cracks.
    geometry.translate(-middle.x, -middle.y, -depth / 2);
    const pivot = new Group();
    pivot.position.set(middle.x, middle.y, 0);
    pivot.add(new Mesh(geometry, kit.ice));
    const length = Math.hypot(middle.x - IMPACT.x, middle.y - IMPACT.y) || 1;
    const direction = { x: (middle.x - IMPACT.x) / length, y: (middle.y - IMPACT.y) / length };
    return { pivot, home: middle, direction, tiltAxis: new Vector3(-direction.y, direction.x, 0), phase: i * 1.3 };
  });
}

const tilt = new Quaternion();

function placePieces(pieces: Piece[], open: number, time: number): void {
  pieces.forEach(({ pivot, home, direction, tiltAxis, phase }) => {
    const drift = Math.sin(time * 0.8 + phase) * 0.008 * open;
    pivot.position.set(home.x + direction.x * GAP * open, home.y + direction.y * GAP * open, drift);
    pivot.quaternion.copy(tilt.setFromAxisAngle(tiltAxis, -TILT * open));
  });
}

/** The hot filament running down the middle of each crack, inside the slab. */
function createCores(kit: StationKit): Mesh[] {
  return CRACKS.map((crack) => {
    const curve = new CatmullRomCurve3(crack.map((p) => new Vector3(p.x, p.y, 0)));
    return new Mesh(new TubeGeometry(curve, CRACK_SEGMENTS * 6, CORE_RADIUS, RADIAL_SEGMENTS, false), kit.ember);
  });
}

/** Warm light behind the slab: only seen through the gaps as the pieces part. */
function createBed(kit: StationKit): Mesh {
  const bed = new Mesh(new PlaneGeometry(SLAB.w - 2 * BED_INSET, SLAB.h - 2 * BED_INSET), kit.emberSoft);
  bed.position.z = -SLAB.d / 2 + BED_DEPTH;
  return bed;
}

function createShards(kit: StationKit): { mesh: InstancedMesh; seeds: number[][] } {
  const rng = createRng(77);
  const mesh = new InstancedMesh(new TetrahedronGeometry(0.06), kit.ice, SHARDS);
  const seeds = Array.from({ length: SHARDS }, () => [rng(), rng(), rng(), rng()]);
  return { mesh, seeds };
}

const m4 = new Matrix4();
const q = new Quaternion();
const at = new Vector3();
const size = new Vector3();
const SPIN_AXIS = new Vector3(1, 1, 1).normalize();

/** Shards leave from along the cracks, drift towards the camera and shrink away, on a loop. */
function driftShards(shards: { mesh: InstancedMesh; seeds: number[][] }, time: number, opened: number): void {
  shards.seeds.forEach(([a, b, c, d], i) => {
    const phase = (time * (0.08 + a * 0.06) + b) % 1;
    const crack = CRACKS[i % CRACKS.length];
    const from = crack[1 + Math.floor(c * (crack.length - 2))];
    at.set(from.x, from.y, SLAB.d / 2 + phase * SHARD_TRAVEL * opened);
    q.setFromAxisAngle(SPIN_AXIS, time * (0.6 + d) + i);
    shards.mesh.setMatrixAt(i, m4.compose(at, q, size.setScalar(Math.max(0.001, opened * (1 - phase)))));
  });
  shards.mesh.instanceMatrix.needsUpdate = true;
}

export function createCracksScene(kit: StationKit): StationScene {
  const group = new Group();
  const pieces = createPieces(kit);
  const cores = createCores(kit);
  const shards = createShards(kit);
  group.add(...pieces.map((p) => p.pivot), ...cores, createBed(kit), shards.mesh);
  const update = ({ time, local }: StationTick) => {
    cores.forEach((core, i) => {
      const total = core.geometry.index?.count ?? 0;
      core.geometry.setDrawRange(0, Math.floor((total / 6) * revealOf(i, local)) * 6);
    });
    placePieces(pieces, openOf(local), time);
    driftShards(shards, time, revealOf(0, local));
    group.rotation.set(-0.06 + Math.sin(time * 0.4) * 0.03, 0.42 + Math.sin(time * 0.25) * 0.05, -0.04);
  };
  return { group, update };
}
