/**
 * The sound design as numbers: a winter wind and a low open-fifth hum that
 * swell while the camera dives between sections, a glass chime per section
 * and faint ticks on buttons. Pure (no Web Audio) so it is unit-tested;
 * engine.ts turns it into audio nodes. Everything is synthesized: no files.
 */
import { clamp01, createRng } from "../world/random";

/** Overall loudness once switched on, and how long switching on or off takes (seconds). */
export const MASTER_LEVEL = 0.8;
export const FADE_SECONDS = 0.6;
/** How quickly the wind and hum follow the camera (setTargetAtTime time constant, seconds). */
export const MOTION_SMOOTHING = 0.25;

/** D major pentatonic from D4: section n chimes the n-th note up, so the tour climbs as you scroll. */
const CHIME_ROOT_HZ = 293.66;
const PENTATONIC_STEPS = [0, 2, 4, 7, 9] as const;
const SEMITONES_PER_OCTAVE = 12;

export function chimeFrequency(stationIndex: number): number {
  const i = Math.max(0, Math.floor(stationIndex));
  const octave = Math.floor(i / PENTATONIC_STEPS.length);
  const semitones = PENTATONIC_STEPS[i % PENTATONIC_STEPS.length] + SEMITONES_PER_OCTAVE * octave;
  return CHIME_ROOT_HZ * 2 ** (semitones / SEMITONES_PER_OCTAVE);
}

/** A struck glass: inharmonic partials (ratio to the note, loudness, ring time in seconds). */
export const CHIME_PARTIALS = [
  { ratio: 1, level: 0.18, decay: 2.6 },
  { ratio: 2.76, level: 0.066, decay: 1.3 },
  { ratio: 5.4, level: 0.024, decay: 0.6 },
] as const;
export const CHIME_ATTACK = 0.008;
/** A short echo, as if the chime rang inside the ice. */
export const ECHO = { delay: 0.31, feedback: 0.28, cutoff: 2800 } as const;

/** Wind: filtered pink noise. Louder and brighter while the camera dives through the fog. */
export function windLevel(motion: number): number {
  return 0.25 + 0.5 * clamp01(motion);
}

export function windCutoff(motion: number): number {
  return 420 + 1100 * clamp01(motion);
}

/** Slow gusts: the wind's filter wanders this far (Hz) at this rate (Hz). */
export const GUST = { depth: 240, rate: 0.09, q: 0.8 } as const;

/** Hum: an open fifth (D2, A2, D3) under a low-pass, barely there until the camera moves. */
export const HUM_NOTES_HZ = [73.42, 110, 146.83] as const;
export const HUM_CUTOFF = 420;

export function humLevel(motion: number): number {
  return 0.03 + 0.03 * clamp01(motion);
}

/** Button ticks: a short high blip on hover, a lower one on press. */
export const TICKS = {
  hover: { frequency: 2600, level: 0.04, duration: 0.03 },
  press: { frequency: 1400, level: 0.055, duration: 0.06 },
} as const;
export type TickKind = keyof typeof TICKS;

/**
 * Pink noise (Paul Kellet's economy filter over seeded white noise), peak-normalised to ±1.
 * Seeded so the wind sounds the same on every visit.
 */
export function pinkNoise(length: number, seed: number): Float32Array<ArrayBuffer> {
  const rng = createRng(seed);
  const out = new Float32Array(length);
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let peak = 0;
  for (let i = 0; i < length; i++) {
    const white = rng() * 2 - 1;
    b0 = 0.99765 * b0 + white * 0.099046;
    b1 = 0.963 * b1 + white * 0.2965164;
    b2 = 0.57 * b2 + white * 1.0526913;
    out[i] = b0 + b1 + b2 + white * 0.1848;
    peak = Math.max(peak, Math.abs(out[i]));
  }
  return peak > 0 ? out.map((v) => v / peak) : out;
}
