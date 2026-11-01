/** GLSL for the ember-crystal hero. Plain strings: no three.js import, trivially tree-shaken with it. */

const NOISE_GLSL = /* glsl */ `
float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vnoise(vec3 x){
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p *= 2.03; a *= 0.5; } return s; }
`;

export const CRYSTAL_VERT = /* glsl */ `
uniform float uTime;
uniform float uPulse;
varying vec3 vWorldPos;
varying vec3 vObjPos;
${NOISE_GLSL}
void main(){
  vec3 p = position;
  float n = fbm(p * 1.35 + vec3(0.0, uTime * 0.12, uTime * 0.07));
  p += normal * (n - 0.5) * (0.42 + uPulse * 0.08);
  vObjPos = p;
  vec4 world = modelMatrix * vec4(p, 1.0);
  vWorldPos = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

export const CRYSTAL_FRAG = /* glsl */ `
uniform vec3 uFrost; uniform vec3 uIce; uniform vec3 uEmber; uniform vec3 uGlow;
uniform float uTime; uniform float uPulse;
varying vec3 vWorldPos;
varying vec3 vObjPos;
${NOISE_GLSL}
void main(){
  // Faceted normals from screen-space derivatives: the "cut ice" look.
  vec3 N = normalize(cross(dFdx(vWorldPos), dFdy(vWorldPos)));
  vec3 V = normalize(cameraPosition - vWorldPos);
  float facing = clamp(dot(N, V), 0.0, 1.0);
  float fresnel = pow(1.0 - facing, 2.6);
  vec3 L = normalize(vec3(-0.6, 0.8, 0.5));
  float spec = pow(max(dot(reflect(-L, N), V), 0.0), 48.0);
  // Ember core shows through faces that look at the camera, breathing slowly.
  float core = smoothstep(0.35, 1.0, facing) * (0.55 + 0.45 * fbm(vObjPos * 2.2 + uTime * 0.25));
  float breathe = 0.82 + 0.18 * sin(uTime * 1.3) + uPulse * 0.25;
  vec3 col = mix(uIce * 0.18, uIce * 0.55, fresnel);
  col += mix(uEmber, uGlow, core) * core * breathe * 0.95;
  col += uFrost * fresnel * 0.85 + vec3(spec) * 0.9;
  gl_FragColor = vec4(col, 0.94);
}`;

export const SPARK_VERT = /* glsl */ `
uniform float uTime; uniform float uPixelRatio;
attribute float aSeed;
varying float vSeed; varying float vFade;
void main(){
  vec3 p = position;
  float t = uTime * (0.05 + aSeed * 0.08);
  p.y = mod(p.y + t * 2.0 + 3.0, 6.0) - 3.0;
  p.x += sin(t * 3.0 + aSeed * 10.0) * 0.15;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (1.2 + aSeed * 2.6) * uPixelRatio * (6.0 / -mv.z);
  vSeed = aSeed;
  vFade = smoothstep(3.0, 1.6, abs(p.y));
}`;

export const SPARK_FRAG = /* glsl */ `
uniform vec3 uFrost; uniform vec3 uEmber;
varying float vSeed; varying float vFade;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d) * vFade * 0.75;
  gl_FragColor = vec4(mix(uFrost, uEmber, step(0.72, vSeed)), a);
}`;
