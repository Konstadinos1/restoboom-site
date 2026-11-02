import { ACESFilmicToneMapping, HalfFloatType, PCFSoftShadowMap, SRGBColorSpace, Vector2, WebGLRenderer, WebGLRenderTarget, type PerspectiveCamera, type Scene } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { portraitLensShift } from "../director";
import type { TierConfig } from "../tiers";
import { LensShader } from "./post";

/** Only HDR emitters (the warm interior, sign, seams at ~3.2) cross the threshold; lit snow sits near 0.8. */
const BLOOM = { strength: 0.7, radius: 0.5, threshold: 1.0 } as const;
const EXPOSURE = 0.8;

export type Pipeline = {
  renderer: WebGLRenderer;
  composer: EffectComposer;
  lens: ShaderPass;
  resize: (width: number, height: number) => void;
  dispose: () => void;
};

export function createRenderer(canvas: HTMLCanvasElement, cfg: TierConfig): WebGLRenderer {
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, stencil: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cfg.maxDpr));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = EXPOSURE;
  renderer.shadowMap.enabled = cfg.shadows;
  renderer.shadowMap.type = PCFSoftShadowMap;
  return renderer;
}

/** Bloom renders at a fraction of the screen: the glow is soft anyway, and it is the costliest pass. */
function scaledBloom(cfg: TierConfig): UnrealBloomPass {
  const bloom = new UnrealBloomPass(new Vector2(256, 256), BLOOM.strength, BLOOM.radius, BLOOM.threshold);
  const setSize = bloom.setSize.bind(bloom);
  bloom.setSize = (w: number, h: number) => setSize(Math.max(64, Math.round(w * cfg.bloomScale)), Math.max(64, Math.round(h * cfg.bloomScale)));
  return bloom;
}

export function createPipeline(renderer: WebGLRenderer, scene: Scene, camera: PerspectiveCamera, cfg: TierConfig): Pipeline {
  const dpr = renderer.getPixelRatio();
  const target = new WebGLRenderTarget(2, 2, { type: HalfFloatType, samples: cfg.msaaSamples });
  const composer = new EffectComposer(renderer, target);
  composer.setPixelRatio(dpr);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(scaledBloom(cfg));
  const lens = new ShaderPass(LensShader);
  composer.addPass(lens);
  composer.addPass(new OutputPass());
  const resize = (width: number, height: number) => {
    renderer.setSize(width, height, false);
    composer.setSize(width, height);
    lens.uniforms.uResolution.value = new Vector2(width * dpr, height * dpr);
    camera.aspect = width / Math.max(1, height);
    // Shift the visible window down so the picture sits higher on upright phones (no-op on landscape).
    camera.setViewOffset(width, height, 0, portraitLensShift(camera.aspect) * height, width, height);
    camera.updateProjectionMatrix();
  };
  return { renderer, composer, lens, resize, dispose: () => { composer.dispose(); renderer.dispose(); } };
}
