/**
 * Final image treatment: film grain, soft vignette, chromatic aberration and
 * the prismatic, pixel-dithered light streaks that flare during transitions.
 */
export const LensShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uPrism: { value: 0 },
    uGrain: { value: 0.05 },
    uResolution: { value: [1, 1] },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uPrism;
    uniform float uGrain;
    uniform vec2 uResolution;
    varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    vec3 hue(float h) { return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); }
    void main() {
      vec2 c = vUv - 0.5;
      float ca = 0.0015 + uPrism * 0.014;
      vec3 col = vec3(texture2D(tDiffuse, vUv + c * ca).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - c * ca).b);
      // Prismatic streaks, quantised to chunky pixels like light through ice.
      vec2 px = floor(vUv * uResolution / 6.0) * 6.0 / uResolution;
      vec2 dir = normalize(vec2(1.0, -0.62));
      float d = dot(px - 0.5, dir) + sin(uTime * 0.7) * 0.08;
      float band = smoothstep(0.11, 0.0, abs(d - 0.12)) + 0.6 * smoothstep(0.06, 0.0, abs(d + 0.21));
      float flicker = step(0.35, hash(px + floor(uTime * 12.0)));
      col += hue(d * 3.2 + uTime * 0.15) * band * flicker * uPrism * 0.55;
      float vig = smoothstep(0.95, 0.25, length(c * vec2(1.0, 0.85)));
      col *= mix(0.86, 1.0, vig);
      col += (hash(vUv * uResolution + fract(uTime) * 61.0) - 0.5) * uGrain;
      gl_FragColor = vec4(col, 1.0);
    }`,
};
