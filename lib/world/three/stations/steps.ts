/**
 * Station 05, how it works: three hexagonal ice pads climbing to the right,
 * numbered 1-2-3 in the same dot-matrix as the sign, joined by a warm path. A
 * glowing ember travels the path as the visitor scrolls through the steps.
 */
import { CatmullRomCurve3, CylinderGeometry, Group, Mesh, SphereGeometry, TubeGeometry, Vector3 } from "three";
import { steppingStones } from "../../stationShapes";
import { dotText, type StationKit, type StationScene, type StationTick } from "./kit";

const STEPS = 3;
const SPREAD = 2.6;
const RISE = 1.3;
const PAD = { radius: 0.5, height: 0.2 } as const;
const DIGIT_DOT = 0.08;
const PATH_LIFT = 0.2;
const PATH_SEGMENTS = 96;

function createPads(kit: StationKit): { pads: Group; tops: Vector3[] } {
  const pads = new Group();
  const tops = steppingStones(STEPS, SPREAD, RISE).map((s, i) => {
    const pad = new Mesh(new CylinderGeometry(PAD.radius, PAD.radius, PAD.height, 6), kit.ice);
    pad.position.set(s.x, s.y, s.z);
    const digit = dotText(String(i + 1), DIGIT_DOT, kit.emberSoft);
    digit.rotation.x = -Math.PI / 2;
    digit.position.set(s.x, s.y + PAD.height / 2 + DIGIT_DOT / 2, s.z);
    pads.add(pad, digit);
    return new Vector3(s.x, s.y + PAD.height / 2 + PATH_LIFT, s.z);
  });
  return { pads, tops };
}

export function createStepsScene(kit: StationKit): StationScene {
  const group = new Group();
  const { pads, tops } = createPads(kit);
  const curve = new CatmullRomCurve3(tops);
  const path = new Mesh(new TubeGeometry(curve, PATH_SEGMENTS, 0.012, 5, false), kit.emberSoft);
  const orb = new Mesh(new SphereGeometry(0.09, 20, 14), kit.ember);
  // Nudged away from the panel (on the right) so the third pad clears it.
  const content = new Group();
  content.position.x = -0.5;
  content.add(pads, path, orb);
  group.add(content);
  const total = path.geometry.index?.count ?? 0;
  const update = ({ time, local }: StationTick) => {
    const t = Math.min(1, Math.max(0, local));
    path.geometry.setDrawRange(0, Math.floor((total / 6) * t) * 6);
    orb.position.copy(curve.getPointAt(t));
    orb.position.y += Math.abs(Math.sin(time * 3.2)) * 0.06;
    // Tilted towards the camera so the numbers on the pads read.
    group.rotation.set(0.55, -0.18 + Math.sin(time * 0.3) * 0.05, 0);
  };
  return { group, update };
}
