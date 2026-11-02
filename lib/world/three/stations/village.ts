/**
 * Station 08, pricing: three ice pillars of rising height for the three plans,
 * topped with tiny ice bistros: one for a single restaurant, three for a
 * small group, seven for a franchise. Each little window glows.
 */
import { BoxGeometry, Group, Mesh } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { pricingVillage } from "../../stationShapes";
import type { StationKit, StationScene, StationTick } from "./kit";

const PILLARS = [
  { x: -1.55, height: 0.9, restaurants: 1 },
  { x: 0, height: 1.5, restaurants: 3 },
  { x: 1.55, height: 2.1, restaurants: 7 },
] as const;
const PILLAR_WIDTH = 1.2;
const BASE_Y = -1.3;
const HOUSE = { w: 0.26, h: 0.2, d: 0.22 } as const;
const HOUSE_SPACING = 0.36;
// The pricing cards cover the scene from about a third of the way in: the pillars are up by then.
const RISE_SPAN = 0.22;
const RISE_STAGGER = 0.05;
const MIN_RISE = 0.55;

function createHouse(kit: StationKit): Group {
  const house = new Group();
  const body = new Mesh(new RoundedBoxGeometry(HOUSE.w, HOUSE.h, HOUSE.d, 1, 0.025), kit.ice);
  body.position.y = HOUSE.h / 2;
  const glow = new Mesh(new BoxGeometry(HOUSE.w * 0.6, HOUSE.h * 0.45, 0.01), kit.emberSoft);
  glow.position.set(0, HOUSE.h * 0.42, HOUSE.d / 2 + 0.006);
  const roof = new Mesh(new BoxGeometry(HOUSE.w * 1.12, 0.035, HOUSE.d * 1.12), kit.ice);
  roof.position.y = HOUSE.h + 0.018;
  house.add(body, glow, roof);
  return house;
}

type Pillar = { group: Group; block: Mesh; village: Group; height: number };

function createPillar(kit: StationKit, height: number, restaurants: 1 | 3 | 7): Pillar {
  const group = new Group();
  // Unit-height block scaled to the pillar's height, so it can rise without squashing the houses on top.
  const block = new Mesh(new RoundedBoxGeometry(PILLAR_WIDTH, 1, PILLAR_WIDTH, 3, 0.1 / height), kit.ice);
  const village = new Group();
  for (const spot of pricingVillage(restaurants, HOUSE_SPACING)) {
    const house = createHouse(kit);
    house.position.set(spot.x, 0, spot.y);
    village.add(house);
  }
  group.add(block, village);
  return { group, block, village, height };
}

function raisePillar(p: Pillar, share: number): void {
  const h = p.height * share;
  p.block.scale.y = h;
  p.block.position.y = h / 2;
  p.village.position.y = h;
}

export function createVillageScene(kit: StationKit): StationScene {
  const group = new Group();
  const pillars = PILLARS.map((p) => {
    const pillar = createPillar(kit, p.height, p.restaurants);
    pillar.group.position.set(p.x, BASE_Y, 0);
    group.add(pillar.group);
    return pillar;
  });
  const update = ({ time, local }: StationTick) => {
    pillars.forEach((pillar, i) => {
      const rise = Math.min(1, Math.max(0, (local - i * RISE_STAGGER) / RISE_SPAN));
      raisePillar(pillar, MIN_RISE + (1 - MIN_RISE) * rise);
      pillar.group.position.y = BASE_Y + Math.sin(time * 0.6 + i * 1.3) * 0.04;
    });
    group.rotation.set(0.28, -0.42 + Math.sin(time * 0.25) * 0.05, 0);
  };
  return { group, update };
}
