/**
 * Station 04, the platform: four ice cubes, igloo-style, each with one module
 * frozen inside as a glowing object: a chat bubble (front desk), a star
 * (reviews), a paper plane (follow-ups) and a heart (regulars).
 */
import { BufferAttribute, BufferGeometry, DoubleSide, Group, Mesh } from "three";
import { heartOutline, speechBubbleOutline, starOutline } from "../../stationShapes";
import { extrudeOutline, iceShell, type StationKit, type StationScene, type StationTick } from "./kit";

const CUBE = 1.05;
const SPACING = 1.42;
const SPREAD = 0.35;
const OBJECT_DEPTH = 0.12;
const OBJECT_BEVEL = 0.025;

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

/** The four frozen objects, in the order of the platform's module cards. */
function moduleObjects(kit: StationKit): Mesh[] {
  const extruded = (outline: Parameters<typeof extrudeOutline>[0]) => new Mesh(extrudeOutline(outline, OBJECT_DEPTH, OBJECT_BEVEL), kit.ember);
  // The plane is open sheets, not a closed solid: it needs both faces drawn (on its own copy of the glow).
  const planeGlow = kit.ember.clone();
  planeGlow.side = DoubleSide;
  const plane = new Mesh(paperPlaneGeometry(0.72), planeGlow);
  return [
    extruded(speechBubbleOutline(0.6, 0.4, 0.1, 4)),
    extruded(starOutline(5, 0.34, 0.15)),
    plane,
    extruded(heartOutline(0.56, 48)),
  ];
}

type Cell = { holder: Group; object: Mesh; home: { x: number; y: number }; phase: number };

function createCells(kit: StationKit): Cell[] {
  return moduleObjects(kit).map((object, i) => {
    const holder = new Group();
    const home = { x: (i % 2 === 0 ? -1 : 1) * (SPACING / 2), y: (i < 2 ? 1 : -1) * (SPACING / 2) };
    holder.add(object, iceShell(kit, CUBE, CUBE, CUBE));
    return { holder, object, home, phase: i * 1.7 };
  });
}

export function createModulesScene(kit: StationKit): StationScene {
  const group = new Group();
  const cells = createCells(kit);
  cells.forEach((c) => group.add(c.holder));
  const update = ({ time, local }: StationTick) => {
    const spread = 1 + Math.sin(Math.min(1, local) * Math.PI) * SPREAD;
    for (const c of cells) {
      c.holder.position.set(c.home.x * spread, c.home.y * spread + Math.sin(time * 0.7 + c.phase) * 0.06, 0);
      c.holder.rotation.set(0.3 + Math.sin(time * 0.4 + c.phase) * 0.12, time * 0.22 + c.phase, 0.12);
      c.object.rotation.y = Math.sin(time * 0.9 + c.phase) * 0.5;
    }
    group.rotation.y = -0.3;
  };
  return { group, update };
}
