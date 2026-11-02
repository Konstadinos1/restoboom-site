/**
 * The hero object: a bistro built from ice blocks with a warm interior whose
 * light leaks through the seams, windows and door. Blocks fly in on load and
 * lift apart on scroll (see lib/world/explode.ts).
 */
import {
  BoxGeometry, BufferAttribute, BufferGeometry, Color, Euler, Group, InstancedMesh, LineBasicMaterial, LineSegments, Matrix4, Mesh,
  MeshBasicMaterial, MeshStandardMaterial, Quaternion, Vector3, type Material,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { BISTRO, BRICK, buildBistroLayout, OPENINGS, WALL_HEIGHT, type Brick } from "../bistroLayout";
import { assemblyAmount, deconstructAmount, displacedPose, hoverOffset, type BrickRandom, type Vec3 } from "../explode";
import { layoutDots } from "../dotMatrix";
import { createRng } from "../random";
import { GLOW_INTENSITY, WORLD } from "../palette";
import type { TierConfig } from "../tiers";
import { createInterior, INTERIOR_LIGHT, type Interior } from "./bistroInterior";
import { tintInstances } from "./ice";

const SEAM = 0.045;
const INTRO_SCATTER = 2.6;
const SIGN_DOT = 0.05;
const AWNING_Y = 2.5;
const AWNING_TILT = 0.38;
const PARAPET_TOP = WALL_HEIGHT + 0.16 + BRICK.height;
const SIGN_Y = PARAPET_TOP + 0.3;
const CENTER = { x: 0, y: WALL_HEIGHT / 2, z: 0 };
const TOTAL_HEIGHT = PARAPET_TOP;
// The camera looks from the front-left and the headline sits screen-left: walls open towards the back-right.
const OPEN_DRIFT: Vec3 = { x: 0.9, y: 0, z: -0.7 };
const TINT_SEED = 17;
const AT_REST = 0.001;

const m4 = new Matrix4();
const quat = new Quaternion();
const euler = new Euler();
const pos3 = new Vector3();
const scale3 = new Vector3();
const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

export type Bistro = { group: Group; update: (intro: number, deconstruct: number, time: number) => void };

function createBricks(layout: Brick[], ice: Material, cfg: TierConfig): InstancedMesh {
  const mesh = new InstancedMesh(new RoundedBoxGeometry(1, 1, 1, 2, 0.07), ice, layout.length);
  mesh.castShadow = cfg.shadows;
  mesh.receiveShadow = cfg.shadows;
  mesh.frustumCulled = false;
  tintInstances(mesh, TINT_SEED);
  return mesh;
}

/** Ice mullions dividing the storefront window into panes. */
function createMullions(ice: Material): Group {
  const group = new Group();
  const w = OPENINGS[0];
  const z = BISTRO.depth / 2 - BRICK.depth / 2;
  const bar = (sx: number, sy: number, x: number, y: number) => {
    const mesh = new Mesh(new BoxGeometry(sx, sy, 0.08), ice);
    mesh.position.set(x, y, z);
    group.add(mesh);
  };
  bar(w.x1 - w.x0, 0.06, (w.x0 + w.x1) / 2, (w.y0 + w.y1) / 2 + 0.15);
  bar(0.06, w.y1 - w.y0, (w.x0 + w.x1) / 2, (w.y0 + w.y1) / 2);
  return group;
}

function createAwning(ice: Material): Group {
  const group = new Group();
  const warm = new MeshStandardMaterial({ color: WORLD.ember, emissive: WORLD.ember, emissiveIntensity: 0.75, roughness: 0.5 });
  const slats = 9;
  const x0 = -2.45;
  const width = (1.75 - x0) / slats;
  const geo = new BoxGeometry(width - 0.025, 0.05, 0.95);
  for (let i = 0; i < slats; i++) {
    const slat = new Mesh(geo, i % 2 ? warm : ice);
    slat.position.set(x0 + width * (i + 0.5), 0, 0.475);
    group.add(slat);
  }
  group.position.set(0, AWNING_Y, BISTRO.depth / 2);
  group.rotation.x = AWNING_TILT;
  return group;
}

function createSign(ice: Material): Group {
  const { dots, cols, rows } = layoutDots("RESTOBOOM");
  const glow = new MeshBasicMaterial({ color: new Color(WORLD.emberHot).multiplyScalar(GLOW_INTENSITY), toneMapped: false });
  const dotsMesh = new InstancedMesh(new BoxGeometry(SIGN_DOT * 0.82, SIGN_DOT * 0.82, 0.03), glow, dots.length);
  dots.forEach((d, i) => dotsMesh.setMatrixAt(i, m4.makeTranslation((d.col - cols / 2 + 0.5) * SIGN_DOT, (rows / 2 - d.row - 0.5) * SIGN_DOT, 0.02)));
  const plaque = new Mesh(new RoundedBoxGeometry(cols * SIGN_DOT + 0.32, rows * SIGN_DOT + 0.24, 0.07, 2, 0.03), ice);
  const group = new Group();
  group.add(plaque, dotsMesh);
  group.position.set(0, SIGN_Y, BISTRO.depth / 2 - 0.05);
  return group;
}

/** Pairs of nearby bricks joined by thin glowing lines once the walls come apart. */
function pickConstellation(layout: Brick[]): [number, number][] {
  const rng = createRng(23);
  const pairs: [number, number][] = [];
  layout.forEach((a, i) => {
    for (let j = i + 1; j < Math.min(layout.length, i + 14); j++) {
      const b = layout[j];
      if (Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < 1.0 && rng() < 0.32) {
        pairs.push([i, j]);
        return;
      }
    }
  });
  return pairs;
}

function createLines(pairCount: number, opacity: number): LineSegments<BufferGeometry, LineBasicMaterial> {
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(new Float32Array(pairCount * 6), 3));
  const lines = new LineSegments(geo, new LineBasicMaterial({ color: WORLD.line, transparent: true, opacity, depthWrite: false }));
  lines.frustumCulled = false;
  return lines;
}

/** Construction wireframe for the intro: random axis-aligned struts around the site. */
function createScaffold(): LineSegments<BufferGeometry, LineBasicMaterial> {
  const rng = createRng(31);
  const count = 160;
  const lines = createLines(count, 0);
  const arr = lines.geometry.attributes.position.array as Float32Array;
  for (let i = 0; i < count; i++) {
    const start = [(rng() - 0.5) * 9, rng() * 5.5, (rng() - 0.5) * 7];
    const axis = Math.floor(rng() * 3);
    const end = [...start];
    end[axis] += (rng() - 0.5) * 3.2;
    arr.set([...start, ...end], i * 6);
  }
  lines.material.color = new Color("#ffffff");
  return lines;
}

function randomsFor(count: number): BrickRandom[] {
  const rng = createRng(5);
  return Array.from({ length: count }, () => [rng(), rng(), rng(), rng(), rng()] as const);
}

type BrickMotion = { intro: number; decon: number; time: number };

/** Every brick's pose for this frame: flying in (intro), lifted apart (scroll) and hovering once loose. */
function poseBricks(mesh: InstancedMesh, layout: Brick[], rnds: BrickRandom[], motion: BrickMotion, out: Float32Array): void {
  for (let i = 0; i < layout.length; i++) {
    const b = layout[i];
    const ratio = b.y / TOTAL_HEIGHT;
    const apart = deconstructAmount(motion.decon, ratio);
    const amount = Math.max(assemblyAmount(motion.intro, ratio) * INTRO_SCATTER, apart);
    const pose = displacedPose(b, CENTER, rnds[i], amount, OPEN_DRIFT);
    pose.y += hoverOffset(rnds[i], apart, motion.time);
    quat.setFromEuler(euler.set(pose.rx, pose.ry + b.ry, pose.rz));
    mesh.setMatrixAt(i, m4.compose(pos3.set(pose.x, pose.y, pose.z), quat, scale3.set(b.sx - SEAM, b.sy - SEAM, b.sz - SEAM)));
    out[i * 3] = pose.x;
    out[i * 3 + 1] = pose.y;
    out[i * 3 + 2] = pose.z;
  }
  mesh.instanceMatrix.needsUpdate = true;
}

function linkLines(lines: LineSegments<BufferGeometry, LineBasicMaterial>, pairs: [number, number][], centers: Float32Array): void {
  const arr = lines.geometry.attributes.position.array as Float32Array;
  pairs.forEach(([a, b], i) => {
    arr.set([centers[a * 3], centers[a * 3 + 1], centers[a * 3 + 2], centers[b * 3], centers[b * 3 + 1], centers[b * 3 + 2]], i * 6);
  });
  lines.geometry.attributes.position.needsUpdate = true;
}

export function createBistro(cfg: TierConfig, ice: Material): Bistro {
  const layout = buildBistroLayout();
  const rnds = randomsFor(layout.length);
  const centers = new Float32Array(layout.length * 3);
  const bricks = createBricks(layout, ice, cfg);
  const pairs = pickConstellation(layout);
  const details: Details = {
    interior: createInterior(), awning: createAwning(ice), sign: createSign(ice), mullions: createMullions(ice),
    constellation: createLines(pairs.length, 0), scaffold: createScaffold(),
  };
  const roomGlow = details.interior.room.material.color.clone();
  const group = new Group();
  group.add(bricks, details.interior.group, details.awning, details.sign, details.mullions, details.constellation, details.scaffold);
  let last = { intro: -1, decon: -1 };
  const update = (intro: number, decon: number, time: number) => {
    // Bricks only need re-posing while something moves: the intro, a scroll, or the hover once apart.
    if (intro !== last.intro || decon !== last.decon || decon > AT_REST) {
      poseBricks(bricks, layout, rnds, { intro, decon, time }, centers);
      linkLines(details.constellation, pairs, centers);
      last = { intro, decon };
    }
    animateDetails(details, roomGlow, { intro, decon, time });
  };
  return { group, update };
}

type Details = {
  interior: Interior;
  awning: Group;
  sign: Group;
  mullions: Group;
  constellation: LineSegments<BufferGeometry, LineBasicMaterial>;
  scaffold: LineSegments<BufferGeometry, LineBasicMaterial>;
};

/** Flickering warm light; awning, sign and mullions lifting away; the room shrinking into a glowing heart. */
function animateDetails(d: Details, roomGlow: Color, { intro, decon, time }: BrickMotion): void {
  const flicker = 0.9 + 0.06 * Math.sin(time * 1.7) + 0.04 * Math.sin(time * 4.3);
  d.interior.room.material.color.copy(roomGlow).multiplyScalar(flicker * smooth(0.05, 0.6, intro));
  const lightLevel = INTERIOR_LIGHT.intensity * flicker * smooth(0.1, 0.7, intro) * (1 - decon * 0.6);
  d.interior.lights.forEach((l) => (l.intensity = lightLevel));
  const open = smooth(0.15, 0.65, decon);
  d.interior.room.scale.setScalar(Math.max(AT_REST, 1 - open));
  d.interior.heart.scale.setScalar(Math.max(AT_REST, open * (1.6 + 0.15 * Math.sin(time * 2.1))));
  d.interior.heart.rotation.set(time * 0.21, time * 0.33, 0);
  const appear = smooth(0.62, 1, intro);
  for (const g of [d.awning, d.sign, d.mullions]) g.scale.setScalar(Math.max(AT_REST, appear));
  d.awning.position.y = AWNING_Y + decon * 2.4;
  d.awning.rotation.x = AWNING_TILT + decon * 0.9;
  d.sign.position.y = SIGN_Y + decon * 3.2;
  d.sign.rotation.z = decon * 0.35;
  d.mullions.position.y = decon * 1.8;
  d.mullions.rotation.z = decon * -0.5;
  d.constellation.material.opacity = smooth(0.12, 0.5, decon) * 0.75;
  d.scaffold.material.opacity = smooth(0, 0.12, intro) * (1 - smooth(0.45, 0.95, intro)) * 0.7;
  d.scaffold.visible = d.scaffold.material.opacity > AT_REST;
}
