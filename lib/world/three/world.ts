/**
 * Mounts the whole 3D world on a fixed full-screen canvas and runs it: the
 * scroll position (via the director) drives the camera, the bistro's build-up
 * and deconstruction, fog density and the prism bursts between stations.
 */
import { Color, FogExp2, PerspectiveCamera, PMREMGenerator, Scene, Vector3, type Texture } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { cameraAt, frameForAspect, scrollCursor, SETTLE, type CameraFrame } from "../director";
import { STATION_CAMERAS, STATION_IDS } from "../stations";
import { TIER_CONFIG, type Tier, type TierConfig } from "../tiers";
import { WORLD } from "../palette";
import { createBistro, type Bistro } from "./bistro";
import { createIceMaterial } from "./ice";
import { addLights, createSky, createSnow, createTerrain } from "./environment";
import { createPipeline, createRenderer, type Pipeline } from "./renderer";
import { createStations, type Stations } from "./stations";

const INTRO_SECONDS = 2.8;
const CAMERA_DAMPING = 4.5;
const LAST_STATION = STATION_IDS.length - 1;
const BISTRO_VISIBLE_RANGE = 140;
const ENVIRONMENT_INTENSITY = 0.35;

export type WorldOptions = {
  tier: Exclude<Tier, "static">;
  readProgress: () => number[];
  beforeFrame?: (timeMs: number) => void;
  onFrame?: (frame: CameraFrame) => void;
  onProgress?: (fraction: number) => void;
};
export type WorldHandle = { dispose: () => void };

type Built = { scene: Scene; bistro: Bistro; stations: Stations; snow: ReturnType<typeof createSnow>; env: Texture };

function buildScene(cfg: TierConfig, pmrem: PMREMGenerator, report: (f: number) => void): Built {
  const scene = new Scene();
  scene.background = new Color(WORLD.fog);
  scene.fog = new FogExp2(WORLD.fog, STATION_CAMERAS[0].fog);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  // The studio-style environment is far brighter than a foggy winter day: keep it for ice highlights only.
  scene.environmentIntensity = ENVIRONMENT_INTENSITY;
  scene.add(createSky());
  addLights(scene, cfg);
  scene.add(createTerrain(cfg));
  report(0.45);
  const ice = createIceMaterial(cfg);
  const bistro = createBistro(cfg, ice);
  const stations = createStations(ice);
  const snow = createSnow(cfg.snowParticles);
  scene.add(bistro.group, bistro.lights, stations.group, snow);
  report(0.7);
  return { scene, bistro, stations, snow, env };
}

/** How far apart the bistro's blocks are for the current camera frame. */
export function bistroDeconstruction(frame: CameraFrame): number {
  if (frame.station === 0) return Math.min(1, frame.local / SETTLE);
  if (frame.station === LAST_STATION) return Math.max(0, 1 - frame.local / 0.7);
  return 1;
}

type Rig = { camera: PerspectiveCamera; pos: Vector3; target: Vector3; fog: number; prism: number; primed: boolean };

const goalPos = new Vector3();
const goalTarget = new Vector3();

function stepRig(rig: Rig, raw: CameraFrame, dt: number): void {
  const frame = frameForAspect(raw, rig.camera.aspect);
  const k = rig.primed ? 1 - Math.exp(-dt * CAMERA_DAMPING) : 1;
  rig.pos.lerp(goalPos.set(frame.pos.x, frame.pos.y, frame.pos.z), k);
  rig.target.lerp(goalTarget.set(frame.target.x, frame.target.y, frame.target.z), k);
  rig.fog += (frame.fog - rig.fog) * k;
  rig.prism += (frame.prism - rig.prism) * Math.min(1, k * 1.6);
  rig.camera.fov += (frame.fov - rig.camera.fov) * k;
  rig.camera.position.copy(rig.pos);
  rig.camera.lookAt(rig.target);
  rig.camera.updateProjectionMatrix();
  rig.primed = true;
}

function renderFrame(built: Built, pipe: Pipeline, rig: Rig, frame: CameraFrame, times: { now: number; intro: number }): void {
  (built.scene.fog as FogExp2).density = rig.fog;
  built.bistro.group.visible = rig.pos.length() < BISTRO_VISIBLE_RANGE;
  built.bistro.update(times.intro, bistroDeconstruction(frame), times.now);
  built.stations.update(times.now, frame.station);
  built.snow.material.uniforms.uTime.value = times.now;
  pipe.lens.uniforms.uTime.value = times.now;
  pipe.lens.uniforms.uPrism.value = rig.prism;
  pipe.composer.render();
}

export async function mountWorld(canvas: HTMLCanvasElement, opts: WorldOptions): Promise<WorldHandle> {
  const cfg = TIER_CONFIG[opts.tier];
  const report = opts.onProgress ?? (() => undefined);
  const renderer = createRenderer(canvas, cfg);
  report(0.15);
  const pmrem = new PMREMGenerator(renderer);
  const built = buildScene(cfg, pmrem, report);
  const camera = new PerspectiveCamera(STATION_CAMERAS[0].from.fov, 1, 0.1, 600);
  const pipe = createPipeline(renderer, built.scene, camera, cfg);
  pipe.resize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight);
  built.snow.material.uniforms.uCamera.value = camera.position;
  built.snow.material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
  await renderer.compileAsync(built.scene, camera);
  report(0.9);
  return startLoop({ canvas, opts, built, pipe, pmrem, rig: { camera, pos: new Vector3(), target: new Vector3(), fog: STATION_CAMERAS[0].fog, prism: 0, primed: false } });
}

type LoopParts = { canvas: HTMLCanvasElement; opts: WorldOptions; built: Built; pipe: Pipeline; pmrem: PMREMGenerator; rig: Rig };

function startLoop({ canvas, opts, built, pipe, pmrem, rig }: LoopParts): WorldHandle {
  let introStart = -1;
  let last = performance.now();
  const loop = (nowMs: number) => {
    opts.beforeFrame?.(nowMs);
    const dt = Math.min(0.1, (nowMs - last) / 1000);
    last = nowMs;
    if (introStart < 0) introStart = nowMs;
    const frame = cameraAt(scrollCursor(opts.readProgress()), STATION_CAMERAS);
    stepRig(rig, frame, dt);
    renderFrame(built, pipe, rig, frame, { now: nowMs / 1000, intro: Math.min(1, (nowMs - introStart) / 1000 / INTRO_SECONDS) });
    opts.onFrame?.(frame);
  };
  const resize = new ResizeObserver(() => pipe.resize(canvas.clientWidth, canvas.clientHeight));
  resize.observe(canvas);
  const onVisibility = () => pipe.renderer.setAnimationLoop(document.hidden ? null : loop);
  document.addEventListener("visibilitychange", onVisibility);
  pipe.renderer.setAnimationLoop(loop);
  opts.onProgress?.(1);
  return {
    dispose: () => {
      pipe.renderer.setAnimationLoop(null);
      resize.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      disposeScene(built);
      pmrem.dispose();
      pipe.dispose();
    },
  };
}

function disposeScene(built: Built): void {
  built.scene.traverse((obj) => {
    const mesh = obj as unknown as { geometry?: { dispose: () => void }; material?: { dispose: () => void } | { dispose: () => void }[] };
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
    materials.forEach((m) => m.dispose());
  });
  built.env.dispose();
}
