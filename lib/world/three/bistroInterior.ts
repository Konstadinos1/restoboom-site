/**
 * Inside the ice bistro: a warm room seen through the window, the door and the
 * seams between blocks, dark furniture, pendant lamps and the glowing heart
 * that is left when the walls lift away.
 */
import {
  BackSide, BoxGeometry, BufferAttribute, Color, CylinderGeometry, Group, IcosahedronGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial,
  PointLight, ShaderMaterial, SphereGeometry, type BufferGeometry,
} from "three";
import { BISTRO, BRICK, OPENINGS, WALL_HEIGHT } from "../bistroLayout";
import { GLOW_INTENSITY, ROOM_GLOW, WORLD } from "../palette";

const ROOM_INSET = 2 * BRICK.depth + 0.06;
const ROOM_FLOOR = 0.05;
const ROOM_HEIGHT = WALL_HEIGHT - 0.1;
const ROOM_ROWS = 6;
const CEILING_SHADE = 0.42;
const FLOOR_SHADE = 1.45;
const WALL_SHADE_BOTTOM = 1.25;
const WALL_SHADE_FADE = 0.7;
const LAMP_BOOST = 1.4;
const HEART_RADIUS = 0.42;
const TABLE_XS = [-1.85, 1.05] as const;
const HEART_DETAIL = 1;
export const INTERIOR_LIGHT = { intensity: 9, range: 7, decay: 2 } as const;

export type Interior = {
  group: Group;
  room: Mesh<BoxGeometry, MeshBasicMaterial>;
  heart: Mesh<BufferGeometry, ShaderMaterial>;
  /** Counter, tables and chairs, pivoting on the heart so they can collapse into it. */
  furniture: Group;
  lights: PointLight[];
};

const HEART_POSITION = { x: 0, y: WALL_HEIGHT * 0.55, z: 0 } as const;

const glowing = (hex: string, intensity: number) => new MeshBasicMaterial({ color: new Color(hex).multiplyScalar(intensity), toneMapped: false });

/** Brightness of a point on the room's inner faces: light pools on the floor and fades up the walls to a dim ceiling. */
export function roomShade(heightRatio: number, outwardNormalY: number): number {
  if (outwardNormalY > 0.5) return CEILING_SHADE;
  if (outwardNormalY < -0.5) return FLOOR_SHADE;
  return WALL_SHADE_BOTTOM - WALL_SHADE_FADE * Math.min(1, Math.max(0, heightRatio));
}

function createRoom(): Mesh<BoxGeometry, MeshBasicMaterial> {
  const geo = new BoxGeometry(BISTRO.width - ROOM_INSET, ROOM_HEIGHT, BISTRO.depth - ROOM_INSET, 1, ROOM_ROWS, 1);
  const pos = geo.attributes.position;
  const normal = geo.attributes.normal;
  const shades = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) shades.fill(roomShade(pos.getY(i) / ROOM_HEIGHT + 0.5, normal.getY(i)), i * 3, i * 3 + 3);
  geo.setAttribute("color", new BufferAttribute(shades, 3));
  // Back faces only: from outside, the openings show the far walls, the floor and the ceiling.
  const material = glowing(WORLD.ember, ROOM_GLOW);
  material.vertexColors = true;
  material.side = BackSide;
  const room = new Mesh(geo, material);
  room.position.set(0, ROOM_FLOOR + ROOM_HEIGHT / 2, 0);
  return room;
}

// Facets facing the camera burn hot (they bloom); facets turned away fall to a deep ember, so the heart reads as a cut crystal.
const HEART_VERTEX = /* glsl */ `
  varying vec3 vNormal; varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = -mv.xyz;
    vNormal = normalMatrix * normal;
    gl_Position = projectionMatrix * mv;
  }`;
const HEART_FRAGMENT = /* glsl */ `
  uniform vec3 uColor; uniform float uIntensity;
  varying vec3 vNormal; varying vec3 vView;
  void main() {
    float facing = clamp(dot(normalize(vNormal), normalize(vView)), 0.0, 1.0);
    gl_FragColor = vec4(uColor * uIntensity * (0.3 + 1.1 * pow(facing, 2.0)), 1.0);
  }`;

/** The ember crystal at the heart of the bistro: flat-shaded facets, lit from within. */
function createHeart(): Mesh<BufferGeometry, ShaderMaterial> {
  const geo = new IcosahedronGeometry(HEART_RADIUS, HEART_DETAIL).toNonIndexed();
  geo.computeVertexNormals();
  const material = new ShaderMaterial({
    uniforms: { uColor: { value: new Color(WORLD.ember) }, uIntensity: { value: GLOW_INTENSITY } },
    vertexShader: HEART_VERTEX,
    fragmentShader: HEART_FRAGMENT,
  });
  const heart = new Mesh(geo, material);
  heart.position.set(HEART_POSITION.x, HEART_POSITION.y, HEART_POSITION.z);
  return heart;
}

/**
 * Dark silhouettes against the warm light: a counter and two bistro tables with chairs. The group's
 * origin sits on the heart, so scaling it down draws the furniture into the heart as the walls open.
 */
function createFurniture(): Group {
  const group = new Group();
  group.position.set(HEART_POSITION.x, HEART_POSITION.y, HEART_POSITION.z);
  const dark = new MeshStandardMaterial({ color: WORLD.furniture, roughness: 0.8 });
  const front = BISTRO.depth / 2 - BRICK.depth - 0.45;
  const add = (mesh: Mesh, x: number, y: number, z: number) => {
    mesh.position.set(x - HEART_POSITION.x, y - HEART_POSITION.y, z - HEART_POSITION.z);
    group.add(mesh);
  };
  add(new Mesh(new BoxGeometry(1.9, 1.0, 0.45), dark), -1.05, 0.5, front - 0.55);
  for (const x of TABLE_XS) {
    add(new Mesh(new CylinderGeometry(0.32, 0.32, 0.05, 20), dark), x, 0.74, front);
    add(new Mesh(new CylinderGeometry(0.04, 0.06, 0.72, 8), dark), x, 0.36, front);
    add(new Mesh(new BoxGeometry(0.34, 0.85, 0.06), dark), x - 0.48, 0.43, front + 0.05);
  }
  return group;
}

/** Pendant lamps over the tables: they stay hanging in the air when everything else comes apart. */
function createLamps(): Group {
  const group = new Group();
  const lamp = glowing(WORLD.emberHot, GLOW_INTENSITY * LAMP_BOOST);
  const cord = new MeshStandardMaterial({ color: WORLD.furniture, roughness: 0.8 });
  const front = BISTRO.depth / 2 - BRICK.depth - 0.45;
  for (const x of TABLE_XS) {
    const bulb = new Mesh(new SphereGeometry(0.11, 16, 12), lamp);
    bulb.position.set(x, 2.05, front);
    const wire = new Mesh(new CylinderGeometry(0.006, 0.006, 0.8, 4), cord);
    wire.position.set(x, 2.5, front);
    group.add(bulb, wire);
  }
  return group;
}

/** Warm light just inside each opening, spilling onto the furniture and the snow outside. */
function createLights(): PointLight[] {
  return OPENINGS.map((o) => {
    const light = new PointLight(WORLD.ember, INTERIOR_LIGHT.intensity, INTERIOR_LIGHT.range, INTERIOR_LIGHT.decay);
    light.position.set((o.x0 + o.x1) / 2, Math.min(o.y1, 1.2), BISTRO.depth / 2 - 0.25);
    return light;
  });
}

export function createInterior(): Interior {
  const group = new Group();
  const room = createRoom();
  const heart = createHeart();
  const furniture = createFurniture();
  const lights = createLights();
  // The lights are returned, not added: the world keeps them out of the bistro's group (see createBistro).
  group.add(room, heart, furniture, createLamps());
  return { group, room, heart, furniture, lights };
}
