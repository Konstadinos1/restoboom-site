import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { STILLS, type StillImage } from "@/lib/world/stills";

const PUBLIC = join(__dirname, "../../public");

/** Width and height from a WebP file's header (lossy VP8, lossless VP8L or extended VP8X). */
function webpSize(bytes: Buffer): { width: number; height: number } {
  if (bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP") throw new Error("not a WebP file");
  const chunk = bytes.toString("ascii", 12, 16);
  if (chunk === "VP8 ") return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
  if (chunk === "VP8L") {
    const bits = bytes.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8X") return { width: bytes.readUIntLE(24, 3) + 1, height: bytes.readUIntLE(27, 3) + 1 };
  throw new Error(`unknown WebP chunk ${chunk}`);
}

const images: [string, StillImage][] = Object.entries(STILLS).flatMap(([name, still]) => [
  [name, still] as [string, StillImage],
  ...(still.phone ? [[`${name} (phone)`, still.phone] as [string, StillImage]] : []),
]);

describe("rendered stills of the world", () => {
  it.each(images)("%s is a WebP in public/ at the size the markup declares", (_name, image) => {
    expect(image.src).toMatch(/^\/world\/[a-z-]+\.webp$/);
    expect(webpSize(readFileSync(join(PUBLIC, image.src)))).toEqual({ width: image.width, height: image.height });
  });

  it.each(images)("%s has a crop point in percentages", (_name, image) => {
    expect(image.focus).toMatch(/^\d{1,3}% \d{1,3}%$/);
  });

  it("gives every landscape still a phone crop point too", () => {
    for (const still of Object.values(STILLS)) expect(still.phoneFocus).toMatch(/^\d{1,3}% \d{1,3}%$/);
  });

  it("keeps the stills small enough to load early on a slow phone", () => {
    const MAX_BYTES = 60_000;
    for (const [name, image] of images) expect(readFileSync(join(PUBLIC, image.src)).length, name).toBeLessThan(MAX_BYTES);
  });
});
