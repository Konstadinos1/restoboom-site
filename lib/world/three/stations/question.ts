/**
 * Station 09, FAQ: a question mark built from ice blocks in the sign's
 * dot-matrix, its full stop glowing. The blocks breathe apart and settle back
 * together as the questions scroll by.
 */
import { Group, InstancedMesh, Matrix4, Mesh, Quaternion, Vector3 } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { layoutDots } from "../../dotMatrix";
import { createRng } from "../../random";
import type { StationKit, StationScene, StationTick } from "./kit";

const DOT = 0.36;
const BLOCK = DOT * 0.88;
const BREATH = 0.28;
const PANEL_CLEARANCE = -1.1;

type Block = { x: number; y: number; seed: [number, number, number] };

function questionBlocks(): { blocks: Block[]; stop: Block } {
  const { dots, cols, rows } = layoutDots("?");
  const rng = createRng(19);
  const all = dots.map((d) => ({ x: (d.col - cols / 2 + 0.5) * DOT, y: (rows / 2 - d.row - 0.5) * DOT, seed: [rng(), rng(), rng()] as [number, number, number] }));
  // The glyph's last dot is the full stop: it glows on its own.
  return { blocks: all.slice(0, -1), stop: all[all.length - 1] };
}

const m4 = new Matrix4();
const q = new Quaternion();
const at = new Vector3();
const unit = new Vector3(1, 1, 1);
const tilt = new Vector3();

export function createQuestionScene(kit: StationKit): StationScene {
  const group = new Group();
  const { blocks, stop } = questionBlocks();
  const mesh = new InstancedMesh(new RoundedBoxGeometry(BLOCK, BLOCK, BLOCK, 2, 0.04), kit.ice, blocks.length);
  const dot = new Mesh(new RoundedBoxGeometry(BLOCK, BLOCK, BLOCK, 2, 0.04), kit.ember);
  dot.position.set(stop.x, stop.y, 0);
  // The FAQ panel is wider than the others: keep the question mark clear of it.
  const content = new Group();
  content.position.x = PANEL_CLEARANCE;
  content.add(mesh, dot);
  group.add(content);
  const update = ({ time, local }: StationTick) => {
    const apart = Math.sin(Math.min(1, Math.max(0, local)) * Math.PI) * BREATH;
    blocks.forEach((b, i) => {
      const [a, c, d] = b.seed;
      at.set(b.x * (1 + apart * 0.4), b.y * (1 + apart * 0.4), (a - 0.5) * apart * 1.2 + Math.sin(time * 0.9 + i) * 0.03);
      q.setFromAxisAngle(tilt.set(c - 0.5, d - 0.5, 0.3).normalize(), apart * (a - 0.5) * 1.4);
      mesh.setMatrixAt(i, m4.compose(at, q, unit));
    });
    mesh.instanceMatrix.needsUpdate = true;
    dot.rotation.set(time * 0.4, time * 0.6, 0);
    group.rotation.set(0.1, 0.4 + Math.sin(time * 0.3) * 0.08, 0);
  };
  return { group, update };
}
