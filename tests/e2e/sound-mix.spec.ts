import { build } from "esbuild";
import { expect, test } from "@playwright/test";

/**
 * Renders the real sound engine offline in the browser and measures the mix, so a change to the
 * score that makes the sound inaudible, flat or clipping fails here rather than in someone's ears.
 */
/** rms and peak of the signal; bright: rms of its first difference, which weights high frequencies (a tick) over the low bed. */
type Window = { rms: number; peak: number; bright: number };
type Levels = { rest: Window; dive: Window; chime: Window; beforeTick: Window; tick: Window; peak: number };

const dB = (value: number) => 20 * Math.log10(Math.max(value, 1e-9));

async function engineBundle(): Promise<string> {
  const result = await build({ entryPoints: ["lib/sound/engine.ts"], bundle: true, write: false, format: "iife", globalName: "RestoBoomSound", platform: "browser" });
  return result.outputFiles[0].text;
}

test("the sound mix is audible, swells in the dives, lets chimes through and never clips @desktop-only", async ({ page }) => {
  await page.goto("about:blank");
  await page.addScriptTag({ content: await engineBundle() });
  const levels: Levels = await page.evaluate(async () => {
    const rate = 44_100;
    const ctx = new OfflineAudioContext(2, rate * 9, rate);
    const { createSoundEngine } = (window as unknown as { RestoBoomSound: typeof import("../../lib/sound/engine") }).RestoBoomSound;
    const engine = createSoundEngine(ctx);
    await engine.start();
    const at = (t: number, fn: () => void) => ctx.suspend(t).then(() => (fn(), ctx.resume()));
    void at(3, () => engine.setMotion(1));
    void at(5, () => engine.setMotion(0));
    void at(6.5, () => engine.chime(4));
    void at(8, () => engine.tick("hover"));
    const data = (await ctx.startRendering()).getChannelData(0);
    const measure = (from: number, to: number) => {
      let sum = 0;
      let bright = 0;
      let peak = 0;
      const n = Math.floor((to - from) * rate);
      for (let i = Math.floor(from * rate); i < Math.floor(from * rate) + n; i++) {
        sum += data[i] * data[i];
        bright += (data[i] - data[i - 1]) ** 2;
        peak = Math.max(peak, Math.abs(data[i]));
      }
      return { rms: Math.sqrt(sum / n), peak, bright: Math.sqrt(bright / n) };
    };
    return { rest: measure(1.5, 3), dive: measure(4, 5), chime: measure(6.5, 7.5), beforeTick: measure(7.9, 7.94), tick: measure(8, 8.04), peak: measure(0.01, 9).peak };
  });
  // A background bed: clearly there, well under full scale.
  expect(dB(levels.rest.rms)).toBeGreaterThan(-32);
  expect(dB(levels.rest.rms)).toBeLessThan(-20);
  // The camera's dive is heard.
  expect(dB(levels.dive.rms) - dB(levels.rest.rms)).toBeGreaterThan(4);
  // A chime rises well above the bed; a tick stands out in the high end, where the bed is quiet.
  expect(dB(levels.chime.peak) - dB(levels.rest.peak)).toBeGreaterThan(4);
  expect(dB(levels.tick.bright) - dB(levels.beforeTick.bright)).toBeGreaterThan(6);
  // Headroom: never within 3 dB of clipping.
  expect(dB(levels.peak)).toBeLessThan(-3);
});
