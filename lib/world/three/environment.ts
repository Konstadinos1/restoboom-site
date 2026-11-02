/** The snowy world: gradient sky, plateau + distant mountains, cold light, drifting snow. */
import {
  AdditiveBlending, BackSide, BufferAttribute, BufferGeometry, Color, DirectionalLight, HemisphereLight, Mesh, MeshStandardMaterial,
  PlaneGeometry, Points, ShaderMaterial, SphereGeometry, type Scene,
} from "three";
import { createRng, fbm2D } from "../random";
import { WORLD } from "../palette";
import type { TierConfig } from "../tiers";

const TERRAIN_SIZE = 240;
const PLATEAU_RADIUS = 9;
const MOUNTAIN_START = 34;
const SNOW_BOX = { x: 34, y: 18, z: 34 };

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/** Height of the snow at (x, z): flat plateau under the bistro, rolling drifts, mountains far away. */
export function terrainHeight(x: number, z: number): number {
  const r = Math.hypot(x, z);
  const rise = smoothstep(PLATEAU_RADIUS, PLATEAU_RADIUS + 10, r);
  const drifts = (fbm2D(x * 0.045, z * 0.045, 4, 3) - 0.5) * 2.4;
  const mountains = smoothstep(MOUNTAIN_START, 100, r) * Math.pow(fbm2D(x * 0.013 + 7, z * 0.013, 5, 9), 1.6) * 70;
  const ripples = (fbm2D(x * 0.7, z * 0.7, 2, 5) - 0.5) * 0.06;
  return rise * (drifts + mountains) + ripples;
}

export function createTerrain(cfg: TierConfig): Mesh {
  const geo = new PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, cfg.terrainSegments, cfg.terrainSegments);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position as BufferAttribute;
  for (let i = 0; i < pos.count; i++) pos.setY(i, terrainHeight(pos.getX(i), pos.getZ(i)));
  geo.computeVertexNormals();
  const mesh = new Mesh(geo, new MeshStandardMaterial({ color: WORLD.snow, roughness: 0.93, metalness: 0 }));
  mesh.receiveShadow = cfg.shadows;
  return mesh;
}

export function createSky(): Mesh {
  const material = new ShaderMaterial({
    side: BackSide, depthWrite: false, fog: false,
    uniforms: { uTop: { value: new Color(WORLD.skyTop) }, uHorizon: { value: new Color(WORLD.skyHorizon) } },
    vertexShader: `varying vec3 vDir; void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 uTop; uniform vec3 uHorizon; varying vec3 vDir;
      void main() { float t = smoothstep(-0.05, 0.55, vDir.y); gl_FragColor = vec4(mix(uHorizon, uTop, t), 1.0); }`,
  });
  return new Mesh(new SphereGeometry(380, 32, 16), material);
}

export function addLights(scene: Scene, cfg: TierConfig): DirectionalLight {
  scene.add(new HemisphereLight(WORLD.hemiSky, WORLD.hemiGround, 0.62));
  const sun = new DirectionalLight("#ffffff", 0.8);
  sun.position.set(-8, 13, 9);
  sun.castShadow = cfg.shadows;
  if (cfg.shadows) {
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 });
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.02;
  }
  scene.add(sun);
  return sun;
}

/** Snow that drifts around the camera wherever it goes (positions wrap inside a box on the GPU). */
export function createSnow(count: number): Points<BufferGeometry, ShaderMaterial> {
  const rng = createRng(11);
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions.set([rng() * SNOW_BOX.x, rng() * SNOW_BOX.y, rng() * SNOW_BOX.z], i * 3);
    seeds[i] = rng();
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(positions, 3));
  geo.setAttribute("aSeed", new BufferAttribute(seeds, 1));
  const material = new ShaderMaterial({
    transparent: true, depthWrite: false, blending: AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uCamera: { value: [0, 0, 0] }, uBox: { value: [SNOW_BOX.x, SNOW_BOX.y, SNOW_BOX.z] }, uPixelRatio: { value: 1 } },
    vertexShader: SNOW_VERTEX,
    fragmentShader: `varying float vAlpha; void main() { float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(vec3(1.0), smoothstep(0.5, 0.1, d) * vAlpha); }`,
  });
  const points = new Points(geo, material);
  points.frustumCulled = false;
  return points;
}

const SNOW_VERTEX = /* glsl */ `
  uniform float uTime; uniform vec3 uCamera; uniform vec3 uBox; uniform float uPixelRatio;
  attribute float aSeed; varying float vAlpha;
  void main() {
    vec3 p = position;
    p.y -= uTime * (0.35 + aSeed * 0.6);
    p.x += uTime * 0.25 + sin(uTime * 0.6 + aSeed * 40.0) * 0.6;
    p.z += cos(uTime * 0.4 + aSeed * 30.0) * 0.5;
    p = mod(p - uCamera + uBox * 0.5, uBox) - uBox * 0.5 + uCamera;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.2 + aSeed * 2.4) * uPixelRatio * (14.0 / -mv.z);
    vAlpha = smoothstep(0.0, 4.0, -mv.z) * 0.85;
  }`;
