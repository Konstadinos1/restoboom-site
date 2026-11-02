/**
 * Station 02, "12 h 15": a wall clock frozen in a slab of ice, ringing out
 * unanswered. Scrolling runs the panel's timeline (12:15:00 → 12:15:40): the
 * rings stop when the text goes out at 12:15:15 and a warm bubble appears.
 */
import { BoxGeometry, CircleGeometry, Group, Mesh, TorusGeometry, type Material, type MeshBasicMaterial } from "three";
import { clockHandAngles, speechBubbleOutline } from "../../stationShapes";
import { extrudeOutline, iceShell, type StationKit, type StationScene, type StationTick } from "./kit";

const SLAB = { w: 2.6, h: 2.6, d: 0.8 } as const;
const DIAL_RADIUS = 0.95;
const TICK_RADIUS = 0.8;
const TIMELINE_SECONDS = 40;
const TEXT_SENT_AT = 15 / TIMELINE_SECONDS;
const RINGS = 3;
const RING_PERIOD_S = 2.2;
const RING_GROWTH = 1.7;
const RING_OPACITY = 0.55;
const START = { hours: 12, minutes: 15 } as const;

type Hands = { hour: Mesh; minute: Mesh; second: Mesh };

function hand(width: number, length: number, material: Material, z: number): Mesh {
  const geo = new BoxGeometry(width, length, 0.03);
  geo.translate(0, length / 2 - 0.08, 0);
  const mesh = new Mesh(geo, material);
  mesh.position.z = z;
  return mesh;
}

function createDial(kit: StationKit): { group: Group; hands: Hands } {
  const group = new Group();
  const face = new Mesh(new CircleGeometry(DIAL_RADIUS, 64), kit.slate);
  const rim = new Mesh(new TorusGeometry(DIAL_RADIUS, 0.035, 8, 72), kit.ember);
  group.add(face, rim);
  for (let i = 0; i < 12; i++) {
    const quarter = i % 3 === 0;
    const tick = new Mesh(new BoxGeometry(0.035, quarter ? 0.2 : 0.1, 0.03), quarter ? kit.emberSoft : kit.ice);
    const a = (i / 12) * Math.PI * 2;
    tick.position.set(Math.sin(a) * TICK_RADIUS, Math.cos(a) * TICK_RADIUS, 0.02);
    tick.rotation.z = -a;
    group.add(tick);
  }
  const hands = { hour: hand(0.07, 0.5, kit.ice, 0.04), minute: hand(0.05, 0.78, kit.ice, 0.06), second: hand(0.016, 0.86, kit.ember, 0.08) };
  group.add(hands.hour, hands.minute, hands.second);
  return { group, hands };
}

function createRings(kit: StationKit): Mesh<TorusGeometry, MeshBasicMaterial>[] {
  return Array.from({ length: RINGS }, () => {
    const material = kit.emberSoft.clone();
    material.transparent = true;
    material.depthWrite = false;
    return new Mesh(new TorusGeometry(DIAL_RADIUS * 1.05, 0.012, 6, 96), material);
  });
}

function setTime(hands: Hands, local: number): void {
  const seconds = local * TIMELINE_SECONDS;
  const { hour, minute } = clockHandAngles(START.hours, START.minutes + seconds / 60);
  hands.hour.rotation.z = -hour;
  hands.minute.rotation.z = -minute;
  hands.second.rotation.z = -(seconds / 60) * Math.PI * 2;
}

export function createClockScene(kit: StationKit): StationScene {
  const group = new Group();
  const { group: dial, hands } = createDial(kit);
  const rings = createRings(kit);
  const bubble = new Mesh(extrudeOutline(speechBubbleOutline(0.7, 0.42, 0.1, 4), 0.1, 0.02), kit.ember);
  bubble.position.set(0.95, 0.95, SLAB.d / 2 + 0.25);
  group.add(dial, ...rings, iceShell(kit, SLAB.w, SLAB.h, SLAB.d), bubble);
  const update = ({ time, local }: StationTick) => {
    setTime(hands, local);
    const ringing = local < TEXT_SENT_AT;
    rings.forEach((ring, i) => {
      const phase = (time / RING_PERIOD_S + i / RINGS) % 1;
      ring.visible = ringing;
      ring.scale.setScalar(1 + phase * RING_GROWTH);
      ring.material.opacity = (1 - phase) * RING_OPACITY;
    });
    bubble.scale.setScalar(Math.max(0.001, Math.min(1, (local - TEXT_SENT_AT) * 6)));
    group.rotation.set(-0.08 + Math.sin(time * 0.5) * 0.04, -0.35 + Math.sin(time * 0.3) * 0.06, 0);
  };
  return { group, update };
}
