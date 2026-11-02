/**
 * Ice for the bricks, awning slats, sign plaque and stations. The high tier
 * refracts (transmission); every tier gets a view-angle shade that keeps the
 * faces a deeper blue and lights up the edges, which is what makes a block
 * read as ice rather than grey plastic.
 */
import { Color, MeshPhysicalMaterial, MeshStandardMaterial, type InstancedMesh } from "three";
import { WORLD } from "../palette";
import { createRng } from "../random";
import type { TierConfig } from "../tiers";

const ICE_PROGRAM_KEY = "restoboom-ice-v1";
const TINT_SPREAD = 0.18;

// Runs after lighting, before tone mapping: faces facing the camera look into the ice (bluer, darker),
// grazing faces and rounded edges catch the cold sky (brighter). Refractive ice already darkens by
// absorbing light, so it only takes a light touch of the facing tint.
const iceShade = (depthTint: string) => /* glsl */ `
  float iceFacing = clamp(dot(normalize(vViewPosition), normal), 0.0, 1.0);
  float iceRim = pow(1.0 - iceFacing, 2.5);
  outgoingLight = outgoingLight * mix(vec3(${depthTint}), vec3(1.0), iceRim) + vec3(0.09, 0.12, 0.15) * iceRim;
  #include <opaque_fragment>`;
const SOLID_DEPTH_TINT = "0.8, 0.88, 0.97";
const REFRACTIVE_DEPTH_TINT = "0.95, 0.98, 1.0";

function withIceShading<T extends MeshStandardMaterial>(material: T, depthTint: string): T {
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace("#include <opaque_fragment>", iceShade(depthTint));
  };
  material.customProgramCacheKey = () => `${ICE_PROGRAM_KEY}-${depthTint}`;
  return material;
}

export function createIceMaterial(cfg: TierConfig): MeshStandardMaterial {
  if (cfg.transmission) {
    return withIceShading(
      new MeshPhysicalMaterial({
        color: WORLD.iceClear, roughness: 0.2, metalness: 0, transmission: 0.78, thickness: 0.4, ior: 1.31,
        attenuationColor: new Color(WORLD.iceAttenuation), attenuationDistance: 1.6, clearcoat: 0.6, clearcoatRoughness: 0.22, envMapIntensity: 0.6,
      }),
      REFRACTIVE_DEPTH_TINT,
    );
  }
  return withIceShading(new MeshStandardMaterial({ color: WORLD.iceTint, roughness: 0.18, metalness: 0.02, envMapIntensity: 0.8 }), SOLID_DEPTH_TINT);
}

const SHELL_OPACITY = 0.3;

/** See-through ice that the station objects are frozen in: clearer than the bricks so the object reads. */
export function createShellMaterial(cfg: TierConfig): MeshStandardMaterial {
  if (cfg.transmission) {
    return withIceShading(
      new MeshPhysicalMaterial({
        color: WORLD.iceClear, roughness: 0.12, metalness: 0, transmission: 0.95, thickness: 0.6, ior: 1.31,
        attenuationColor: new Color(WORLD.iceAttenuation), attenuationDistance: 2.4, clearcoat: 0.5, clearcoatRoughness: 0.2, envMapIntensity: 0.6,
      }),
      REFRACTIVE_DEPTH_TINT,
    );
  }
  const shell = new MeshStandardMaterial({ color: WORLD.iceTint, roughness: 0.15, metalness: 0.02, envMapIntensity: 0.9 });
  // Without refraction, the only way to see what is frozen inside is plain transparency.
  Object.assign(shell, { transparent: true, opacity: SHELL_OPACITY, depthWrite: false });
  return withIceShading(shell, SOLID_DEPTH_TINT);
}

/** Natural variation between blocks: each one a little brighter, greyer or bluer, fixed per seed. */
export function tintInstances(mesh: InstancedMesh, seed: number): void {
  const rng = createRng(seed);
  const tint = new Color();
  for (let i = 0; i < mesh.count; i++) {
    const k = 1 - TINT_SPREAD / 2 + rng() * TINT_SPREAD;
    mesh.setColorAt(i, tint.setRGB(k * (0.96 + rng() * 0.04), k, k * (1 + rng() * 0.05)));
  }
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}
