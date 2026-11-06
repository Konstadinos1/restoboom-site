import { describe, expect, it } from "vitest";
import { CHIME_PARTIALS, chimeFrequency, humLevel, MASTER_LEVEL, pinkNoise, TICKS, windCutoff, windLevel } from "@/lib/sound/score";
import { STATION_IDS } from "@/lib/world/stations";

const semitonesBetween = (a: number, b: number) => 12 * Math.log2(b / a);

describe("section chimes", () => {
  it("starts on D4 and climbs the D major pentatonic, one note per section", () => {
    expect(chimeFrequency(0)).toBeCloseTo(293.66, 2);
    const steps = [1, 2, 3, 4, 5].map((i) => Math.round(semitonesBetween(chimeFrequency(0), chimeFrequency(i))));
    expect(steps).toEqual([2, 4, 7, 9, 12]);
  });

  it("rises with every section and stays in a soft register", () => {
    const notes = STATION_IDS.map((_, i) => chimeFrequency(i));
    notes.slice(1).forEach((f, i) => expect(f).toBeGreaterThan(notes[i]));
    expect(Math.max(...notes)).toBeLessThan(1000);
    // Even the highest overtone of the highest note stays below 6 kHz.
    expect(Math.max(...notes) * CHIME_PARTIALS[CHIME_PARTIALS.length - 1].ratio).toBeLessThan(6000);
  });

  it("treats out-of-range indices as the first section rather than producing silence or NaN", () => {
    expect(chimeFrequency(-3)).toBe(chimeFrequency(0));
    expect(chimeFrequency(2.7)).toBe(chimeFrequency(2));
  });
});

describe("wind and hum", () => {
  it("swell and brighten as the camera dives, and stay put outside 0..1", () => {
    expect(windLevel(1)).toBeGreaterThan(windLevel(0) * 3);
    expect(windCutoff(1)).toBeGreaterThan(windCutoff(0) * 2);
    expect(humLevel(1)).toBeGreaterThan(humLevel(0));
    expect(windLevel(-1)).toBe(windLevel(0));
    expect(windLevel(7)).toBe(windLevel(1));
  });

  it("never gets louder than a background bed", () => {
    expect(windLevel(1) + humLevel(1)).toBeLessThan(0.35);
    for (const t of Object.values(TICKS)) expect(t.level).toBeLessThan(0.05);
    expect(MASTER_LEVEL).toBeLessThanOrEqual(0.6);
  });
});

describe("pink noise for the wind", () => {
  const noise = pinkNoise(48_000, 2026);

  it("is the same on every visit and peaks at exactly ±1", () => {
    expect(pinkNoise(1000, 2026)).toEqual(pinkNoise(1000, 2026));
    expect(Math.max(...noise.map(Math.abs))).toBeCloseTo(1, 6);
  });

  it("is centred on zero", () => {
    const mean = noise.reduce((s, v) => s + v, 0) / noise.length;
    expect(Math.abs(mean)).toBeLessThan(0.05);
  });

  it("leans to the low end, like wind (neighbouring samples move together, unlike white noise)", () => {
    let together = 0;
    let energy = 0;
    for (let i = 1; i < noise.length; i++) {
      together += noise[i] * noise[i - 1];
      energy += noise[i] * noise[i];
    }
    expect(together / energy).toBeGreaterThan(0.5);
  });

  it("handles an empty buffer", () => {
    expect(pinkNoise(0, 1)).toHaveLength(0);
  });
});
