/**
 * Station 06, compliance: an ice vault whose round door carries a glowing
 * maple leaf (hosted in Canada, Law 25, CASL). The door's bolt ring turns as
 * the visitor reads the panel, like a combination lock settling shut.
 */
import { CylinderGeometry, Group, Mesh, TorusGeometry } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mapleLeafOutline } from "../../stationShapes";
import { extrudeOutline, type StationKit, type StationScene, type StationTick } from "./kit";

const BODY = { w: 2.3, h: 2.3, d: 1.6 } as const;
const DOOR_RADIUS = 0.86;
const DOOR_DEPTH = 0.14;
const BOLTS = 8;
const LOCK_TURN = Math.PI / 2;
const LEAF_SIZE = 0.62;

function createDoor(kit: StationKit): { door: Group; ring: Group } {
  const door = new Group();
  const slab = new Mesh(new CylinderGeometry(DOOR_RADIUS, DOOR_RADIUS, DOOR_DEPTH, 64), kit.ice);
  slab.rotation.x = Math.PI / 2;
  const leaf = new Mesh(extrudeOutline(mapleLeafOutline(LEAF_SIZE), 0.06, 0.015), kit.ember);
  leaf.position.z = DOOR_DEPTH / 2 + 0.04;
  const ring = new Group();
  // On the door's front face: at the door's centre plane the torus would sit hidden inside the slab.
  const glowRing = new Mesh(new TorusGeometry(DOOR_RADIUS - 0.06, 0.03, 8, 80), kit.emberSoft);
  glowRing.position.z = DOOR_DEPTH / 2 + 0.012;
  ring.add(glowRing);
  for (let i = 0; i < BOLTS; i++) {
    const a = (i / BOLTS) * Math.PI * 2;
    const bolt = new Mesh(new CylinderGeometry(0.05, 0.05, 0.1, 12), kit.slate);
    bolt.rotation.x = Math.PI / 2;
    bolt.position.set(Math.cos(a) * (DOOR_RADIUS - 0.18), Math.sin(a) * (DOOR_RADIUS - 0.18), DOOR_DEPTH / 2 + 0.03);
    ring.add(bolt);
  }
  ring.position.z = 0.01;
  door.add(slab, ring, leaf);
  door.position.z = BODY.d / 2 + DOOR_DEPTH / 2 - 0.02;
  return { door, ring };
}

export function createVaultScene(kit: StationKit): StationScene {
  const group = new Group();
  const body = new Mesh(new RoundedBoxGeometry(BODY.w, BODY.h, BODY.d, 3, 0.16), kit.ice);
  const { door, ring } = createDoor(kit);
  group.add(body, door);
  const update = ({ time, local }: StationTick) => {
    ring.rotation.z = -Math.min(1, Math.max(0, local)) * LOCK_TURN;
    group.rotation.set(-0.05 + Math.sin(time * 0.35) * 0.03, -0.5 + Math.sin(time * 0.22) * 0.06, 0);
  };
  return { group, update };
}
