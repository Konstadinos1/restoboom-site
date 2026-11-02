import { describe, expect, it } from "vitest";
import { createRng, fbm2D, valueNoise2D } from "@/lib/world/random";
import { chooseTier, classifyWebGL, TIER_CONFIG, type TierSignals } from "@/lib/world/tiers";
import { dotsPath, GLYPH_COLS, layoutDots, supportedGlyphs } from "@/lib/world/dotMatrix";
import { BISTRO, BRICK, buildBistroLayout, inOpening, OPENINGS, WALL_HEIGHT } from "@/lib/world/bistroLayout";
import { assemblyAmount, deconstructAmount, displacedPose, hoverOffset, type BrickRandom } from "@/lib/world/explode";
import { cameraAt, frameForAspect, scrollCursor, sectionProgress, SETTLE, type StationCamera } from "@/lib/world/director";
import { scrambleText } from "@/lib/world/scramble";

describe("seeded randomness and noise", () => {
  it("is deterministic per seed and stays in [0, 1)", () => {
    const a = createRng(42);
    const b = createRng(42);
    const values = Array.from({ length: 1000 }, () => a());
    expect(values).toEqual(Array.from({ length: 1000 }, () => b()));
    expect(values.every((v) => v >= 0 && v < 1)).toBe(true);
    expect(createRng(43)()).not.toBe(createRng(42)());
  });

  it("noise is continuous and bounded", () => {
    const n1 = valueNoise2D(3.2, 7.9);
    const n2 = valueNoise2D(3.2001, 7.9);
    expect(Math.abs(n1 - n2)).toBeLessThan(0.01);
    for (let i = 0; i < 200; i++) {
      const f = fbm2D(i * 0.37, i * 0.11);
      expect(f).toBeGreaterThanOrEqual(0);
      expect(f).toBeLessThan(1);
    }
  });
});

describe("chooseTier", () => {
  const desktop: TierSignals = {
    viewportWidth: 1440, reducedMotion: false, saveData: false, hardwareConcurrency: 8, deviceMemory: 8, webgl: "hardware", force3d: false, coarsePointer: false,
  };
  it.each([
    ["capable desktop", desktop, "high"],
    ["mid laptop", { ...desktop, hardwareConcurrency: 6 }, "medium"],
    ["narrow desktop window", { ...desktop, viewportWidth: 1000 }, "medium"],
    ["phone", { ...desktop, viewportWidth: 390, coarsePointer: true }, "low"],
    ["4-core machine", { ...desktop, hardwareConcurrency: 4 }, "low"],
    ["4 GB RAM", { ...desktop, deviceMemory: 4 }, "low"],
    ["reduced motion", { ...desktop, reducedMotion: true }, "static"],
    ["save-data", { ...desktop, saveData: true }, "static"],
    ["no WebGL2", { ...desktop, webgl: "none" }, "static"],
    ["software WebGL (no GPU)", { ...desktop, webgl: "software" }, "static"],
    ["software WebGL forced with ?3d=on", { ...desktop, webgl: "software", force3d: true }, "high"],
    ["forced, but reduced motion still wins", { ...desktop, webgl: "software", force3d: true, reducedMotion: true }, "static"],
    ["forced, but no WebGL2 at all", { ...desktop, webgl: "none", force3d: true }, "static"],
  ] as const)("%s → %s", (_label, signals, tier) => {
    expect(chooseTier(signals)).toBe(tier);
  });

  it.each([
    ["ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)", "software"],
    ["llvmpipe (LLVM 15.0.7, 256 bits)", "software"],
    ["ANGLE (Microsoft, Microsoft Basic Render Driver Direct3D11 vs_5_0 ps_5_0, D3D11)", "software"],
    ["ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version)", "hardware"],
    ["ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)", "hardware"],
    ["Apple GPU", "hardware"],
    ["Adreno (TM) 730", "hardware"],
  ] as const)("renderer %s → %s WebGL", (renderer, support) => {
    expect(classifyWebGL(true, true, renderer)).toBe(support);
  });

  it("treats a refused strict probe as software and no context at all as none", () => {
    expect(classifyWebGL(false, true, "ANGLE (Intel, Intel(R) UHD Graphics 620)")).toBe("software");
    expect(classifyWebGL(false, false, "")).toBe("none");
  });

  it("phones still get 3D, just lighter than desktops", () => {
    expect(TIER_CONFIG.low.snowParticles).toBeLessThan(TIER_CONFIG.high.snowParticles);
    expect(TIER_CONFIG.low.maxDpr).toBeLessThanOrEqual(1);
    expect(TIER_CONFIG.low.transmission).toBe(false);
  });
});

describe("dot-matrix wordmark", () => {
  it("lays out RESTOBOOM. with the expected width and lit dots", () => {
    const { dots, cols, rows } = layoutDots("RESTOBOOM.");
    expect(rows).toBe(7);
    expect(cols).toBe(10 * GLYPH_COLS + 9);
    expect(dots.length).toBeGreaterThan(150);
    expect(dots.every((d) => d.col >= 0 && d.col < cols && d.row >= 0 && d.row < 7)).toBe(true);
  });

  it("refuses characters it has no glyph for", () => {
    expect(() => layoutDots("RESTO?")).toThrow(/no glyph/);
    expect(supportedGlyphs()).toEqual(expect.arrayContaining(["R", "E", "S", "T", "O", "B", "M", "."]));
  });

  it("draws every dot as one centred square in a single path", () => {
    expect(dotsPath([{ col: 2, row: 3, char: "R" }], 0.82)).toBe("M2.09 3.09h0.82v0.82h-0.82z");
    expect(dotsPath([], 0.82)).toBe("");
    const { dots } = layoutDots("RESTOBOOM.");
    expect(dotsPath(dots, 0.82).match(/M/g)).toHaveLength(dots.length);
  });
});

describe("bistro layout", () => {
  const bricks = buildBistroLayout();

  it("is deterministic and sizeable", () => {
    expect(buildBistroLayout()).toEqual(bricks);
    expect(bricks.length).toBeGreaterThan(250);
    expect(new Set(bricks.map((b) => b.wall))).toEqual(new Set(["front", "back", "left", "right", "roof", "parapet"]));
  });

  it("keeps every brick inside the footprint and above the ground", () => {
    for (const b of bricks) {
      expect(Math.abs(b.x)).toBeLessThanOrEqual(BISTRO.width / 2 + 0.05);
      expect(Math.abs(b.z)).toBeLessThanOrEqual(BISTRO.depth / 2 + 0.05);
      expect(b.y - b.sy / 2).toBeGreaterThanOrEqual(-0.02);
    }
  });

  it("leaves the window and the door open on the storefront", () => {
    const front = bricks.filter((b) => b.wall === "front");
    for (const o of OPENINGS) {
      const blocking = front.filter((b) => b.x > o.x0 + 0.1 && b.x < o.x1 - 0.1 && b.y > o.y0 + 0.05 && b.y < o.y1 - 0.05);
      expect(blocking, o.name).toHaveLength(0);
    }
    expect(inOpening(-1.3, BRICK.length, 1.2)).toBe(true);
    expect(inOpening(-1.3, BRICK.length, 2.6)).toBe(false);
  });

  it("builds walls nine courses high under the roof", () => {
    expect(Math.max(...bricks.filter((b) => b.wall === "back").map((b) => b.row))).toBe(BISTRO.rows - 1);
    expect(Math.min(...bricks.filter((b) => b.wall === "roof").map((b) => b.y))).toBeGreaterThan(WALL_HEIGHT);
  });
});

describe("brick motion", () => {
  const rnd: BrickRandom = [0.5, 0.5, 0.5, 0.5, 0.5];
  const home = { x: 2, y: 1, z: 1 };
  const center = { x: 0, y: 1.5, z: 0 };

  it("is exactly home at amount 0 and moves outward and up at amount 1", () => {
    expect(displacedPose(home, center, rnd, 0)).toEqual({ ...home, rx: 0, ry: 0, rz: 0 });
    const out = displacedPose(home, center, rnd, 1);
    expect(Math.hypot(out.x, out.z)).toBeGreaterThan(Math.hypot(home.x, home.z));
    expect(out.y).toBeGreaterThan(home.y);
  });

  it("bends every path by the drift so the walls open away from the headline", () => {
    const leftWall = { x: -2.7, y: 1, z: 0 };
    const plain = displacedPose(leftWall, center, rnd, 1);
    const drifted = displacedPose(leftWall, center, rnd, 1, { x: 0.9, y: 0, z: -0.7 });
    expect(drifted.x).toBeGreaterThan(plain.x);
    expect(drifted.z).toBeLessThan(plain.z);
    // Same distance travelled, only the heading changes.
    expect(Math.hypot(drifted.x - leftWall.x, drifted.z - leftWall.z)).toBeCloseTo(Math.hypot(plain.x - leftWall.x, plain.z - leftWall.z));
  });

  it("only hovers bricks that are apart", () => {
    expect(hoverOffset(rnd, 0, 3.2)).toBe(0);
    const offsets = Array.from({ length: 40 }, (_, i) => hoverOffset(rnd, 1, i * 0.25));
    expect(Math.max(...offsets.map(Math.abs))).toBeLessThanOrEqual(0.09 + 1e-9);
    expect(new Set(offsets.map((o) => o.toFixed(4))).size).toBeGreaterThan(5);
  });

  it("deconstructs the top first and assembles the bottom first", () => {
    expect(deconstructAmount(0.3, 1)).toBeGreaterThan(deconstructAmount(0.3, 0));
    expect(assemblyAmount(0.3, 0)).toBeLessThan(assemblyAmount(0.3, 1));
    expect(deconstructAmount(0, 1)).toBe(0);
    expect(deconstructAmount(1, 0)).toBe(1);
    expect(assemblyAmount(1, 1)).toBe(0);
    expect(assemblyAmount(0, 0)).toBe(1);
  });
});

describe("scroll director", () => {
  const pose = (z: number) => ({ pos: { x: 0, y: 0, z }, target: { x: 0, y: 0, z: z - 10 }, fov: 40 });
  const stations: StationCamera[] = [
    { from: pose(10), to: pose(6), fog: 0.02 },
    { from: pose(-50), to: pose(-54), fog: 0.05 },
  ];

  it("measures section progress from mid-screen", () => {
    expect(sectionProgress(500, 1000, 1000)).toBe(0);
    expect(sectionProgress(0, 1000, 1000)).toBe(0.5);
    expect(sectionProgress(-500, 1000, 1000)).toBe(1);
    expect(sectionProgress(0, 0, 1000)).toBe(0);
  });

  it("starts the first section at rest when the page opens at the top", () => {
    expect(sectionProgress(0, 2000, 1000, 0)).toBe(0);
    expect(sectionProgress(-750, 2000, 1000, 0)).toBe(0.5);
    // Ends where every other section ends: its bottom at mid-screen.
    expect(sectionProgress(-1500, 2000, 1000, 0)).toBe(1);
    expect(sectionProgress(0, 400, 1000, 0)).toBe(0);
  });

  it("turns section progresses into one continuous cursor", () => {
    expect(scrollCursor([0, 0])).toBe(0);
    expect(scrollCursor([0.5, 0])).toBe(0.5);
    expect(scrollCursor([1, 0.25])).toBe(1.25);
  });

  it("settles within a station, then dives with a prism burst", () => {
    expect(cameraAt(0, stations).pos.z).toBe(10);
    const settled = cameraAt(SETTLE, stations);
    expect(settled.pos.z).toBeCloseTo(6);
    expect(settled.prism).toBe(0);
    const diving = cameraAt(SETTLE + (1 - SETTLE) / 2, stations);
    expect(diving.prism).toBeCloseTo(1);
    expect(diving.pos.z).toBeLessThan(6);
    expect(diving.pos.z).toBeGreaterThan(-50);
    expect(cameraAt(1, stations).pos.z).toBe(-50);
  });

  it("clamps past the last station", () => {
    expect(cameraAt(7, stations).station).toBe(1);
  });

  it("leaves landscape framing alone and pulls back + centres on portrait", () => {
    const f = { pos: { x: 2, y: 1, z: 10 }, target: { x: -1.6, y: 0, z: 0 }, fov: 36 };
    expect(frameForAspect(f, 1.6)).toEqual(f);
    const p = frameForAspect(f, 0.46);
    expect(p.target.x).toBeCloseTo(0);
    expect(Math.hypot(p.pos.x - p.target.x, p.pos.z - p.target.z)).toBeGreaterThan(Math.hypot(f.pos.x - f.target.x, f.pos.z - f.target.z));
    expect(p.fov).toBeGreaterThan(f.fov);
  });
});

describe("scrambleText", () => {
  it("reveals left to right and keeps spaces", () => {
    expect(scrambleText("TEMP -3", 1, 1)).toBe("TEMP -3");
    const half = scrambleText("ABCDEFGH", 0.5, 9);
    expect(half.slice(0, 4)).toBe("ABCD");
    expect(half).toHaveLength(8);
    expect(scrambleText("A B", 0, 2)[1]).toBe(" ");
  });
});
