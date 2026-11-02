/**
 * The floating stations: one scene per home section between the hero and the
 * closer, each placed at its station anchor high in the fog. Only the current
 * station and its neighbours are drawn and animated.
 */
import { Group } from "three";
import { STATION_IDS, stationAnchor, stationLocal, type StationId } from "../../stations";
import { createClockScene } from "./clock";
import { createCracksScene } from "./cracks";
import type { StationKit, StationScene } from "./kit";
import { createMessagesScene } from "./messages";
import { createModulesScene } from "./modules";
import { createQuestionScene } from "./question";
import { createStepsScene } from "./steps";
import { createVaultScene } from "./vault";
import { createVillageScene } from "./village";

export { createStationKit, type StationKit } from "./kit";

const SCENES: Partial<Record<StationId, (kit: StationKit) => StationScene>> = {
  scene: createClockScene,
  pains: createCracksScene,
  platform: createModulesScene,
  steps: createStepsScene,
  compliance: createVaultScene,
  samples: createMessagesScene,
  pricing: createVillageScene,
  faq: createQuestionScene,
};
// Within this many units of the camera a station is drawn. Farther out it would be fully fogged, but the
// sky dome behind it is not, so it would show as a flat grey silhouette against the sky.
const VISIBLE_RANGE = 32;
const BOB = { height: 0.12, speed: 0.6 } as const;

type Point = { x: number; y: number; z: number };
export type Stations = { group: Group; update: (time: number, station: number, local: number, camera: Point) => void };

export function createStations(kit: StationKit): Stations {
  const group = new Group();
  const placed = STATION_IDS.flatMap((id, index) => {
    const make = SCENES[id];
    if (!make) return [];
    const scene = make(kit);
    const anchor = stationAnchor(index);
    scene.group.position.set(anchor.x, anchor.y, anchor.z);
    group.add(scene.group);
    return [{ index, anchor, scene }];
  });
  const update = (time: number, station: number, local: number, camera: Point) => {
    for (const { index, anchor, scene } of placed) {
      const near = Math.hypot(camera.x - anchor.x, camera.y - anchor.y, camera.z - anchor.z) < VISIBLE_RANGE;
      scene.group.visible = near;
      if (!near) continue;
      scene.group.position.y = anchor.y + Math.sin(time * BOB.speed + index) * BOB.height;
      scene.update({ time, local: stationLocal(index, station, local), active: index === station });
    }
  };
  return { group, update };
}
