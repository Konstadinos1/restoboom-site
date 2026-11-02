/**
 * 5×7 dot-matrix lettering for the RestoBoom wordmark (HUD logo and the glowing
 * 3D sign on the bistro). Original glyphs; only the characters we render.
 */
export const GLYPH_COLS = 5;
export const GLYPH_ROWS = 7;
const LETTER_GAP = 1;

const GLYPHS: Record<string, readonly string[]> = {
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
};

export type Dot = { col: number; row: number; char: string };

/** Lit dots for a word, in grid units (col grows right, row grows down). */
export function layoutDots(text: string): { dots: Dot[]; cols: number; rows: number } {
  const dots: Dot[] = [];
  let x = 0;
  for (const raw of text.toUpperCase()) {
    const glyph = GLYPHS[raw];
    if (!glyph) throw new Error(`dotMatrix: no glyph for "${raw}"`);
    glyph.forEach((line, row) => {
      [...line].forEach((bit, col) => bit === "1" && dots.push({ col: x + col, row, char: raw }));
    });
    x += GLYPH_COLS + LETTER_GAP;
  }
  return { dots, cols: Math.max(0, x - LETTER_GAP), rows: GLYPH_ROWS };
}

const PATH_DECIMALS = 100;
const tidy = (n: number) => Math.round(n * PATH_DECIMALS) / PATH_DECIMALS;

/**
 * One SVG path drawing every dot as a square of side `size`, `inset` from its
 * cell's top-left corner (centred by default): a single element instead of
 * one <rect> per dot keeps the DOM small.
 */
export function dotsPath(dots: readonly Dot[], size: number, inset = (1 - size) / 2): string {
  const side = tidy(size);
  const offset = tidy(inset);
  return dots.map((d) => `M${tidy(d.col + offset)} ${tidy(d.row + offset)}h${side}v${side}h-${side}z`).join("");
}

export function supportedGlyphs(): string[] {
  return Object.keys(GLYPHS);
}
