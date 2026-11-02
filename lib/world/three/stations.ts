/**
 * Floating stations in the fog, one per home section after the hero.
 * Stage 1: an ice cube with a warm core marks each station so camera moves
 * and transitions can be judged; stage 2 replaces them with section scenes.
 */
import { Color, Group, Mesh, MeshBasicMaterial, SphereGeometry, type Material } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { STATION_IDS, stationAnchor } from "../stations";
import { GLOW_INTENSITY, WORLD } from "../palette";

export type Stations = { group: Group; update: (time: number, activeStation: number) => void };

export function createStations(ice: Material): Stations {
  const group = new Group();
  const cubeGeo = new RoundedBoxGeometry(2.4, 2.4, 2.4, 4, 0.22);
  const coreGeo = new SphereGeometry(0.42, 24, 16);
  const coreMat = new MeshBasicMaterial({ color: new Color(WORLD.ember).multiplyScalar(GLOW_INTENSITY), toneMapped: false });
  const cubes: Group[] = [];
  STATION_IDS.forEach((_id, index) => {
    if (index === 0 || index === STATION_IDS.length - 1) return;
    const holder = new Group();
    const a = stationAnchor(index);
    holder.position.set(a.x, a.y, a.z);
    holder.add(new Mesh(cubeGeo, ice), new Mesh(coreGeo, coreMat));
    holder.userData.index = index;
    cubes.push(holder);
    group.add(holder);
  });
  const update = (time: number, activeStation: number) => {
    for (const holder of cubes) {
      const near = Math.abs(holder.userData.index - activeStation) <= 1;
      holder.visible = near;
      if (!near) continue;
      holder.rotation.set(0.35 + Math.sin(time * 0.3) * 0.08, time * 0.18 + holder.userData.index, 0.2);
      holder.position.y = stationAnchor(holder.userData.index).y + Math.sin(time * 0.6 + holder.userData.index) * 0.18;
    }
  };
  return { group, update };
}
