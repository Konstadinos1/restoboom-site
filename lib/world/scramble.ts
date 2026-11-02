/** igloo-style "decoding" HUD text: characters resolve left to right out of glyph noise. */
import { createRng } from "./random";

export const SCRAMBLE_GLYPHS = "/\\|#*+=-_<>[]{}01";

export function scrambleText(target: string, progress: number, seed: number, glyphs = SCRAMBLE_GLYPHS): string {
  const chars = [...target];
  const revealed = Math.floor(Math.min(1, Math.max(0, progress)) * chars.length);
  const rng = createRng(seed);
  return chars
    .map((ch, i) => {
      const noise = glyphs[Math.floor(rng() * glyphs.length)];
      if (i < revealed || ch === " ") return ch;
      return noise;
    })
    .join("");
}
