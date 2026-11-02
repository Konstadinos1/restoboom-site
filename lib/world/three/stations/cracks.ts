/**
 * Station 03, "what leaks": a slab of ice splitting along four glowing cracks,
 * one per pain point in the panel. Each crack runs out in turn as the visitor
 * scrolls, and small shards drift off the face like money leaking away.
 */
import { CatmullRomCurve3, Group, InstancedMesh, Matrix4, Mesh, Quaternion, TetrahedronGeometry, TubeGeometry, Vector3 } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { createRng } from "../../random";
import { crackPath, type Vec2 } from "../../stationShapes";
import type { StationKit, StationScene, StationTick } from "./kit";

const SLAB = { w: 3.4, h: 2.4, d: 0.5 } as const;
const IMPACT: Vec2 = { x: -0.35, y: 0.2 };
// One heading per pain point (radians), long enough to reach the slab's edge.
const CRACKS = [
  { angle: 0.35, length: 1.9 }, { angle: 2.5, length: 1.4 }, { angle: -2.4, length: 1.3 }, { angle: -0.75, length: 1.6 },
] as const;
const CRACK_SEGMENTS = 9;
const CRACK_JITTER = 0.45;
const CRACK_RADIUS = 0.016;
const GROOVE_WIDTH = 2.6;
const GROOVE_DEPTH = -0.03;
const GLOW_DEPTH = 0.004;
const RADIAL_SEGMENTS = 5;
const REVEAL_STAGGER = 0.17;
const REVEAL_SPAN = 0.32;
const SHARDS = 28;
const SHARD_TRAVEL = 1.6;

/** The crack's path across the slab's front face (clamped to the slab), `depth` in front of the face. */
function crackCurve(index: number, depth: number): CatmullRomCurve3 {
  const c = CRACKS[index];
  const points = crackPath(41 + index, IMPACT, c.angle, c.length, CRACK_SEGMENTS, CRACK_JITTER)
    .map((p) => new Vector3(Math.max(-SLAB.w / 2, Math.min(SLAB.w / 2, p.x)), Math.max(-SLAB.h / 2, Math.min(SLAB.h / 2, p.y)), SLAB.d / 2 + depth));
  return new CatmullRomCurve3(points);
}

const crackTube = (curve: CatmullRomCurve3, radius: number) => new TubeGeometry(curve, CRACK_SEGMENTS * 6, radius, RADIAL_SEGMENTS, false);

/** How much of crack `index` is drawn: they run out one after another through the section. */
function revealOf(index: number, local: number): number {
  return Math.min(1, Math.max(0, (local * 1.15 - index * REVEAL_STAGGER) / REVEAL_SPAN));
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
    const along = 0.3 + c * crack.length * 0.8;
    at.set(IMPACT.x + Math.cos(crack.angle) * along, IMPACT.y + Math.sin(crack.angle) * along, SLAB.d / 2 + phase * SHARD_TRAVEL * opened);
    q.setFromAxisAngle(SPIN_AXIS, time * (0.6 + d) + i);
    shards.mesh.setMatrixAt(i, m4.compose(at, q, size.setScalar(Math.max(0.001, opened * (1 - phase)))));
  });
  shards.mesh.instanceMatrix.needsUpdate = true;
}

export function createCracksScene(kit: StationKit): StationScene {
  const group = new Group();
  const slab = new Mesh(new RoundedBoxGeometry(SLAB.w, SLAB.h, SLAB.d, 3, 0.1), kit.ice);
  // Each crack is a thin glow over a wider dark groove half-buried in the face, so it reads as cut into
  // the ice rather than laid on it (the groove sits deeper, or it would swallow the glow).
  const tubes = CRACKS.flatMap((_, i) => [
    new Mesh(crackTube(crackCurve(i, GROOVE_DEPTH), CRACK_RADIUS * GROOVE_WIDTH), kit.slate),
    new Mesh(crackTube(crackCurve(i, GLOW_DEPTH), CRACK_RADIUS), kit.ember),
  ]);
  const shards = createShards(kit);
  group.add(slab, ...tubes, shards.mesh);
  const update = ({ time, local }: StationTick) => {
    tubes.forEach((tube, i) => {
      const total = tube.geometry.index?.count ?? 0;
      const quads = Math.floor((total / 6) * revealOf(Math.floor(i / 2), local));
      tube.geometry.setDrawRange(0, quads * 6);
    });
    driftShards(shards, time, revealOf(0, local));
    group.rotation.set(-0.06 + Math.sin(time * 0.4) * 0.03, 0.42 + Math.sin(time * 0.25) * 0.05, -0.04);
  };
  return { group, update };
}
