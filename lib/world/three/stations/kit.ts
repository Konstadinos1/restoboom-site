/**
 * What every floating station scene shares: the materials (solid ice, the
 * see-through ice objects are frozen in, warm glows, a dark slate) and a few
 * small builders. One kit per world, so materials compile once.
 */
import {
  Color, ExtrudeGeometry, Group, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, MeshStandardMaterial, Shape, Vector2, type Material, type Object3D,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { layoutDots } from "../../dotMatrix";
import { GLOW_INTENSITY, ROOM_GLOW, WARM_GLOW, WORLD } from "../../palette";
import type { Vec2 } from "../../stationShapes";
import type { TierConfig } from "../../tiers";
import { createShellMaterial } from "../ice";

export type StationKit = {
  cfg: TierConfig;
  /** Solid ice, the same as the bistro's bricks. */
  ice: Material;
  /** Clear ice that objects are frozen in. */
  shell: Material;
  /** Hot glow: crosses the bloom threshold. */
  ember: MeshBasicMaterial;
  /** Warm glow below the bloom threshold: stays a saturated orange. */
  emberSoft: MeshBasicMaterial;
  /** Between the two: a small object that glows orange with a light halo instead of blooming to peach. */
  emberWarm: MeshBasicMaterial;
  /** Dark details (clock face, bolts). */
  slate: MeshStandardMaterial;
};

/** One frame of a station: seconds since start, progress through its section (0..1), and whether it is the current one. */
export type StationTick = { time: number; local: number; active: boolean };

/** Objects in a station the visitor can point at and open (the platform's module cubes). */
export type Explorable = {
  /** Meshes the pointer can hit; each one's userData.exploreIndex names the item it belongs to. */
  targets: readonly Object3D[];
  /** The item under the pointer (or under its content card), or null. */
  setHovered: (index: number | null) => void;
  /** The opened item, or null to close it. */
  setOpened: (index: number | null) => void;
};

export type StationScene = { group: Group; update: (tick: StationTick) => void; explorable?: Explorable };

const SLATE = "#2c3045";
const SHELL_RENDER_ORDER = 1;

const glow = (intensity: number) => new MeshBasicMaterial({ color: new Color(WORLD.ember).multiplyScalar(intensity), toneMapped: false });

export function createStationKit(cfg: TierConfig, ice: Material): StationKit {
  return {
    cfg,
    ice,
    shell: createShellMaterial(cfg),
    ember: glow(GLOW_INTENSITY),
    emberSoft: glow(ROOM_GLOW),
    emberWarm: glow(WARM_GLOW),
    slate: new MeshStandardMaterial({ color: SLATE, roughness: 0.6, metalness: 0.1 }),
  };
}

/** A flat outline turned into a solid with softened edges, centred on the origin. */
export function extrudeOutline(outline: readonly Vec2[], depth: number, bevel: number): ExtrudeGeometry {
  const shape = new Shape(outline.map((p) => new Vector2(p.x, p.y)));
  const geo = new ExtrudeGeometry(shape, {
    depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 8,
  });
  geo.center();
  return geo;
}

/** A block of clear ice; drawn after the opaque things frozen inside it. */
export function iceShell(kit: StationKit, w: number, h: number, d: number): Mesh {
  const shell = new Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(w, h, d) * 0.09), kit.shell);
  shell.renderOrder = SHELL_RENDER_ORDER;
  return shell;
}

/** Dot-matrix text built from small blocks (same glyphs as the HUD wordmark), centred on the origin. */
export function dotText(text: string, dot: number, material: Material): InstancedMesh {
  const { dots, cols, rows } = layoutDots(text);
  const mesh = new InstancedMesh(new RoundedBoxGeometry(dot * 0.86, dot * 0.86, dot * 0.86, 1, dot * 0.12), material, dots.length);
  const m = new Matrix4();
  dots.forEach((d, i) => mesh.setMatrixAt(i, m.makeTranslation((d.col - cols / 2 + 0.5) * dot, (rows / 2 - d.row - 0.5) * dot, 0)));
  return mesh;
}
