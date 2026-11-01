/**
 * "Ember in ice" hero scene — original artwork for RestoBoom.
 * A faceted, slowly morphing ice crystal with an ember core, a HUD wire shell
 * and drifting sparks. Loaded lazily (dynamic import) so three.js never sits
 * on the critical path; the page is fully usable before this runs.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  EdgesGeometry,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
  type Material,
} from "three";
import { CRYSTAL_FRAG, CRYSTAL_VERT, SPARK_FRAG, SPARK_VERT } from "./shaders";

const MAX_DPR = 1.75;
const CRYSTAL_RADIUS = 1.25;
const CRYSTAL_DETAIL = 5;
const SHELL_SCALE = 1.55;
const SPARK_COUNT = 900;
const POINTER_EASE = 0.05;
const SCROLL_EASE = 0.08;
const MAX_FRAME_DT = 0.05;
const COLORS = { frost: new Color("#bcd3e3"), ice: new Color("#5d89a8"), ember: new Color("#ff5a36"), glow: new Color("#ffb38a") };

export type SceneHandle = {
  setPointer: (x: number, y: number) => void;
  setScroll: (progress: number) => void;
  pulse: () => void;
  setActive: (active: boolean) => void;
  dispose: () => void;
};

type Uniforms = ReturnType<typeof createUniforms>;
type Disposable = BufferGeometry | Material;

function createUniforms(dpr: number) {
  return {
    uTime: { value: 0 },
    uPulse: { value: 0 },
    uPixelRatio: { value: dpr },
    uFrost: { value: COLORS.frost },
    uIce: { value: COLORS.ice },
    uEmber: { value: COLORS.ember },
    uGlow: { value: COLORS.glow },
  };
}

function buildSparkGeometry(): BufferGeometry {
  const positions = new Float32Array(SPARK_COUNT * 3);
  const seeds = new Float32Array(SPARK_COUNT);
  for (let i = 0; i < SPARK_COUNT; i++) {
    const r = 1.8 + Math.random() * 3.2;
    const theta = Math.random() * Math.PI * 2;
    positions[i * 3] = Math.cos(theta) * r;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
    positions[i * 3 + 2] = Math.sin(theta) * r - 1;
    seeds[i] = Math.random();
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(positions, 3));
  geo.setAttribute("aSeed", new BufferAttribute(seeds, 1));
  return geo;
}

/** Crystal + wire shell in a rig group; sparks live in world space. Returns everything to dispose. */
function buildObjects(scene: Scene, uniforms: Uniforms) {
  const rig = new Group();
  scene.add(rig);
  const crystalGeo = new IcosahedronGeometry(CRYSTAL_RADIUS, CRYSTAL_DETAIL);
  const crystalMat = new ShaderMaterial({ uniforms, vertexShader: CRYSTAL_VERT, fragmentShader: CRYSTAL_FRAG, transparent: true });
  rig.add(new Mesh(crystalGeo, crystalMat));
  const shellSource = new IcosahedronGeometry(CRYSTAL_RADIUS * SHELL_SCALE, 1);
  const shellGeo = new EdgesGeometry(shellSource);
  const shellMat = new LineBasicMaterial({ color: COLORS.frost, transparent: true, opacity: 0.12 });
  const shell = new LineSegments(shellGeo, shellMat);
  rig.add(shell);
  const sparkGeo = buildSparkGeometry();
  const sparkMat = new ShaderMaterial({ uniforms, vertexShader: SPARK_VERT, fragmentShader: SPARK_FRAG, transparent: true, depthWrite: false, blending: AdditiveBlending });
  scene.add(new Points(sparkGeo, sparkMat));
  const disposables: Disposable[] = [crystalGeo, shellSource, shellGeo, sparkGeo, crystalMat, shellMat, sparkMat];
  return { rig, shell, disposables };
}

/**
 * Keep the crystal clear of the headline: far right (bleeding off-canvas, igloo-style) on
 * wide screens, slightly smaller on mid widths, centred on narrow ones.
 */
export function crystalLayout(aspect: number): { x: number; scale: number } {
  if (aspect > 1.5) return { x: 2.8, scale: 0.92 };
  if (aspect > 1.2) return { x: 1.85, scale: 0.8 };
  return { x: 0, scale: 1 };
}

type MotionState = { pointer: { x: number; y: number; tx: number; ty: number }; scroll: { v: number; t: number }; baseScale: number; elapsed: number };

/** One animation step: ease inputs toward their targets and pose the rig + camera. */
function applyMotion(m: MotionState, dt: number, rig: Group, shell: LineSegments, camera: PerspectiveCamera, uniforms: Uniforms): void {
  m.elapsed += dt;
  uniforms.uTime.value = m.elapsed;
  uniforms.uPulse.value *= 0.94;
  m.pointer.x += (m.pointer.tx - m.pointer.x) * POINTER_EASE;
  m.pointer.y += (m.pointer.ty - m.pointer.y) * POINTER_EASE;
  m.scroll.v += (m.scroll.t - m.scroll.v) * SCROLL_EASE;
  rig.rotation.y = m.elapsed * 0.12 + m.pointer.x * 0.5 + m.scroll.v * 1.4;
  rig.rotation.x = m.pointer.y * 0.35 + m.scroll.v * 0.5;
  shell.rotation.y = -m.elapsed * 0.05;
  rig.scale.setScalar(m.baseScale * (1 - m.scroll.v * 0.25));
  rig.position.y = m.scroll.v * 0.9;
  camera.position.x = m.pointer.x * 0.25;
  camera.position.y = -m.pointer.y * 0.18;
  camera.lookAt(rig.position.x * 0.35, 0, 0);
}

function createStage(canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  const renderer = new WebGLRenderer({ canvas, antialias: dpr < 1.5, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  const camera = new PerspectiveCamera(38, 1, 0.1, 50);
  camera.position.set(0, 0, 6.2);
  return { dpr, renderer, scene: new Scene(), camera };
}

export function mountEmberCrystal(canvas: HTMLCanvasElement): SceneHandle {
  const { dpr, renderer, scene, camera } = createStage(canvas);
  const uniforms = createUniforms(dpr);
  const { rig, shell, disposables } = buildObjects(scene, uniforms);
  const motion: MotionState = { pointer: { x: 0, y: 0, tx: 0, ty: 0 }, scroll: { v: 0, t: 0 }, baseScale: 1, elapsed: 0 };
  const loop = { active: true, frame: 0, last: performance.now() };

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    ({ x: rig.position.x, scale: motion.baseScale } = crystalLayout(camera.aspect));
    camera.updateProjectionMatrix();
  };
  const tick = (now: number) => {
    loop.frame = requestAnimationFrame(tick);
    const dt = Math.min((now - loop.last) / 1000, MAX_FRAME_DT);
    loop.last = now;
    if (!loop.active) return;
    applyMotion(motion, dt, rig, shell, camera, uniforms);
    renderer.render(scene, camera);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  loop.frame = requestAnimationFrame(tick);

  const dispose = () => {
    cancelAnimationFrame(loop.frame);
    ro.disconnect();
    disposables.forEach((d) => d.dispose());
    renderer.dispose();
  };
  return createHandle(motion, uniforms, loop, dispose);
}

function createHandle(motion: MotionState, uniforms: Uniforms, loop: { active: boolean; last: number }, dispose: () => void): SceneHandle {
  return {
    setPointer: (x, y) => {
      motion.pointer.tx = x;
      motion.pointer.ty = y;
    },
    setScroll: (p) => {
      motion.scroll.t = Math.max(0, Math.min(1, p));
    },
    pulse: () => {
      uniforms.uPulse.value = 1;
    },
    setActive: (a) => {
      loop.active = a;
      loop.last = performance.now();
    },
    dispose,
  };
}
