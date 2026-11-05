/**
 * Station 04, the platform: four lidded ice cubes, igloo-style, each with one
 * module frozen inside as a glowing object: a chat bubble (front desk), a star
 * (reviews), a paper plane (follow-ups) and a heart (regulars). Point at a
 * cube and it lights up; click it and its lid swings open, the object rises
 * and turns to face you (see world.ts for the pointer, explore.ts for the rules).
 */
import {
  BoxGeometry, BufferAttribute, BufferGeometry, Color, DoubleSide, EdgesGeometry, Group, LineBasicMaterial, LineSegments, Mesh, type MeshBasicMaterial,
  type Object3D,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { approach, lerpAngle } from "../../explore";
import { lerp } from "../../random";
import { heartOutline, speechBubbleOutline, starOutline, type Vec2 } from "../../stationShapes";
import { extrudeOutline, type Explorable, type StationKit, type StationScene, type StationTick } from "./kit";

const CUBE = 1.05;
const HALF = CUBE / 2;
const SHELL_RADIUS = 0.05;
const SPACING = 1.42;
const SPREAD = 0.35;
const OBJECT_DEPTH = 0.12;
const OBJECT_BEVEL = 0.025;
const EDGE_COLOR = "#f4f8fb";
const EDGE_IDLE = 0.22;
const EDGE_LIT = 0.95;
const SHELL_ORDER = 1;
const EDGE_ORDER = 2;
/** How fast a cube catches up with being pointed at or opened, per second. */
const EASE_RATE = 7;
const HOVER_GROW = 0.07;
/** A pointed-at or open object flares from a warm glow to a blooming one. */
const FLARE = 0.9;
const LID_LIFT = 0.28;
const LID_SWING = 1.1;
const OPEN_FORWARD = 0.45;
const OBJECT_RISE = 0.2;
const OBJECT_GROW = 0.55;
/** The others step back a little while one is open. */
const FOCUS_SHRINK = 0.1;
/** The group is turned -0.3 rad; an open cube turns its front square to the camera. */
const GROUP_TURN = -0.3;
const FACING_CAMERA = -GROUP_TURN;
const MAX_STEP = 0.1;

/** A folded paper plane: two wings and a keel, nose pointing +x. Drawn for this site. */
function paperPlaneGeometry(size: number): BufferGeometry {
  const s = size;
  const nose = [0.5 * s, 0, 0];
  const tailLeft = [-0.4 * s, 0.06 * s, -0.36 * s];
  const tailRight = [-0.4 * s, 0.06 * s, 0.36 * s];
  const spine = [-0.34 * s, 0, 0];
  const keel = [-0.38 * s, -0.16 * s, 0];
  const tris = [nose, tailLeft, spine, nose, spine, tailRight, nose, keel, spine, nose, spine, keel];
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(new Float32Array(tris.flat()), 3));
  geo.computeVertexNormals();
  return geo;
}

/**
 * The four frozen objects, in the order of the platform's module cards. Each has its own copy of the
 * glow (same shader program) so it can flare on its own when its cube is pointed at.
 */
function moduleObjects(kit: StationKit): Mesh<BufferGeometry, MeshBasicMaterial>[] {
  const extruded = (outline: Parameters<typeof extrudeOutline>[0]) => new Mesh(extrudeOutline(outline, OBJECT_DEPTH, OBJECT_BEVEL), kit.emberWarm.clone());
  const planeGlow = kit.emberWarm.clone();
  // The plane is open sheets, not a closed solid: it needs both faces drawn.
  planeGlow.side = DoubleSide;
  return [
    extruded(speechBubbleOutline(0.6, 0.4, 0.1, 4)),
    extruded(starOutline(5, 0.34, 0.15)),
    new Mesh(paperPlaneGeometry(0.72), planeGlow),
    extruded(heartOutline(0.56, 48)),
  ];
}

/** Half a cube of clear ice with its bright edge lines, `offsetY` above or below the seam. */
function shellHalf(kit: StationKit, edges: LineBasicMaterial, offsetY: number, exploreIndex: number): { shell: Mesh; lines: LineSegments } {
  const shell = new Mesh(new RoundedBoxGeometry(CUBE, HALF, CUBE, 3, SHELL_RADIUS), kit.shell);
  shell.renderOrder = SHELL_ORDER;
  shell.position.y = offsetY;
  shell.userData.exploreIndex = exploreIndex;
  const lines = new LineSegments(new EdgesGeometry(new BoxGeometry(CUBE, HALF, CUBE)), edges);
  lines.renderOrder = EDGE_ORDER;
  lines.position.y = offsetY;
  return { shell, lines };
}

type Cell = {
  holder: Group;
  object: Mesh<BufferGeometry, MeshBasicMaterial>;
  /** The object's resting glow colour; it brightens from there when pointed at. */
  glow: Color;
  /** Hinged on the back edge of the seam. */
  lid: Group;
  edges: LineBasicMaterial;
  home: Vec2;
  phase: number;
  hover: number;
  open: number;
};

function createCell(kit: StationKit, object: Mesh<BufferGeometry, MeshBasicMaterial>, index: number): { cell: Cell; targets: Object3D[] } {
  const edges = new LineBasicMaterial({ color: EDGE_COLOR, transparent: true, opacity: EDGE_IDLE, depthWrite: false });
  const base = shellHalf(kit, edges, -HALF / 2, index);
  const top = shellHalf(kit, edges, HALF / 2, index);
  // The lid's hinge runs along the back of the seam, so it swings up and back like a box lid.
  const lid = new Group();
  lid.position.z = -CUBE / 2;
  top.shell.position.z = CUBE / 2;
  top.lines.position.z = CUBE / 2;
  lid.add(top.shell, top.lines);
  const holder = new Group();
  holder.add(object, base.shell, base.lines, lid);
  const home = { x: (index % 2 === 0 ? -1 : 1) * (SPACING / 2), y: (index < 2 ? 1 : -1) * (SPACING / 2) };
  const cell = { holder, object, glow: object.material.color.clone(), lid, edges, home, phase: index * 1.7, hover: 0, open: 0 };
  return { cell, targets: [base.shell, top.shell] };
}

type Focus = { hovered: number | null; opened: number | null };

function animateCell(c: Cell, index: number, focus: Focus, time: number, dt: number, spread: number, othersOpen: number): void {
  c.hover = approach(c.hover, focus.hovered === index ? 1 : 0, dt, EASE_RATE);
  c.open = approach(c.open, focus.opened === index ? 1 : 0, dt, EASE_RATE);
  const lit = Math.max(c.hover, c.open);
  const idleTurn = time * 0.22 + c.phase;
  c.holder.position.set(c.home.x * spread, c.home.y * spread + Math.sin(time * 0.7 + c.phase) * 0.06, OPEN_FORWARD * c.open);
  c.holder.rotation.set(lerp(0.3 + Math.sin(time * 0.4 + c.phase) * 0.12, 0.16, c.open), lerpAngle(idleTurn, FACING_CAMERA, c.open), lerp(0.12, 0, c.open));
  c.holder.scale.setScalar((1 + HOVER_GROW * lit) * (1 - FOCUS_SHRINK * Math.max(0, othersOpen - c.open)));
  c.lid.position.y = LID_LIFT * c.open;
  c.lid.rotation.x = -LID_SWING * c.open;
  c.object.position.y = OBJECT_RISE * c.open;
  c.object.scale.setScalar(1 + OBJECT_GROW * c.open);
  c.object.rotation.y = lerp(Math.sin(time * 0.9 + c.phase) * 0.5, 0, c.open);
  c.edges.opacity = EDGE_IDLE + (EDGE_LIT - EDGE_IDLE) * lit;
  c.object.material.color.copy(c.glow).multiplyScalar(1 + FLARE * lit);
}

export function createModulesScene(kit: StationKit): StationScene {
  const group = new Group();
  group.rotation.y = GROUP_TURN;
  const built = moduleObjects(kit).map((object, i) => createCell(kit, object, i));
  const cells = built.map((b) => b.cell);
  cells.forEach((c) => group.add(c.holder));
  const focus: Focus = { hovered: null, opened: null };
  let lastTime: number | null = null;
  const update = ({ time, local }: StationTick) => {
    const dt = lastTime === null ? 0 : Math.min(MAX_STEP, Math.max(0, time - lastTime));
    lastTime = time;
    const spread = 1 + Math.sin(Math.min(1, local) * Math.PI) * SPREAD;
    const anyOpen = Math.max(...cells.map((c) => c.open));
    cells.forEach((c, i) => animateCell(c, i, focus, time, dt, spread, anyOpen));
  };
  const explorable: Explorable = {
    targets: built.flatMap((b) => b.targets),
    setHovered: (index) => (focus.hovered = index),
    setOpened: (index) => (focus.opened = index),
  };
  return { group, update, explorable };
}
