import { describe, expect, it } from "vitest";
import {
  clockHandAngles, crackPath, heartOutline, mapleLeafOutline, pricingVillage, speechBubbleOutline, starOutline, steppingStones,
} from "@/lib/world/stationShapes";

const closeTo = (a: number, b: number) => Math.abs(a - b) < 1e-9;

describe("station outlines", () => {
  it("draws a five-point star with its first tip straight up", () => {
    const star = starOutline(5, 1, 0.45);
    expect(star).toHaveLength(10);
    expect(closeTo(star[0].x, 0) && closeTo(star[0].y, 1)).toBe(true);
    star.forEach((p, i) => expect(Math.hypot(p.x, p.y)).toBeCloseTo(i % 2 === 0 ? 1 : 0.45));
    expect(() => starOutline(2, 1, 0.5)).toThrow(/at least 3/);
  });

  it("draws a closed maple leaf that is symmetric about its stem", () => {
    const leaf = mapleLeafOutline(2);
    expect(leaf).toHaveLength(25);
    expect(leaf[0]).toEqual({ x: 0, y: 2 });
    const xs = leaf.map((p) => p.x).sort((a, b) => a - b);
    expect(xs[0]).toBeCloseTo(-xs[xs.length - 1]);
    // Every point on the right has a mirror twin on the left.
    for (const p of leaf.filter((q) => q.x > 0)) expect(leaf.some((q) => closeTo(q.x, -p.x) && closeTo(q.y, p.y))).toBe(true);
  });

  it("samples a heart about the requested width", () => {
    const heart = heartOutline(1.7, 64);
    expect(heart).toHaveLength(64);
    const width = Math.max(...heart.map((p) => p.x)) - Math.min(...heart.map((p) => p.x));
    expect(width).toBeCloseTo(1.6, 1);
  });

  it("gives the chat bubble a tail below its body", () => {
    const bubble = speechBubbleOutline(2, 1, 0.2, 4);
    expect(bubble).toHaveLength(4 * 5 + 2);
    expect(Math.min(...bubble.map((p) => p.y))).toBeLessThan(-0.5);
    expect(Math.max(...bubble.map((p) => Math.abs(p.x)))).toBeCloseTo(1);
  });
});

describe("crack paths", () => {
  it("is deterministic per seed and travels about the requested length", () => {
    const a = crackPath(3, { x: 0, y: 0 }, 0, 2, 8, 0.4);
    expect(a).toEqual(crackPath(3, { x: 0, y: 0 }, 0, 2, 8, 0.4));
    expect(a).toHaveLength(9);
    const travelled = a.slice(1).reduce((sum, p, i) => sum + Math.hypot(p.x - a[i].x, p.y - a[i].y), 0);
    expect(travelled).toBeCloseTo(2);
    expect(a[a.length - 1].x).toBeGreaterThan(1.5);
  });

  it("runs straight with no jitter", () => {
    const straight = crackPath(1, { x: 0, y: 0 }, Math.PI / 2, 1, 4, 0);
    expect(straight.every((p) => closeTo(p.x, 0))).toBe(true);
  });
});

describe("clock hands", () => {
  it("puts 12 h 15 at a quarter turn for the minutes, just past 12 for the hours", () => {
    const { hour, minute } = clockHandAngles(12, 15);
    expect(minute).toBeCloseTo(Math.PI / 2);
    expect(hour).toBeCloseTo((15 / 720) * Math.PI * 2);
  });

  it("wraps at 12 and 60", () => {
    expect(clockHandAngles(0, 0)).toEqual({ hour: 0, minute: 0 });
    expect(clockHandAngles(15, 30).hour).toBeCloseTo(clockHandAngles(3, 30).hour);
  });
});

describe("layouts", () => {
  it("places 1, 3 or 7 little bistros on a pricing pillar", () => {
    expect(pricingVillage(1, 0.5)).toEqual([{ x: 0, y: 0 }]);
    const three = pricingVillage(3, 0.5);
    expect(three).toHaveLength(3);
    three.forEach((p) => expect(Math.hypot(p.x, p.y)).toBeCloseTo(0.5));
    const seven = pricingVillage(7, 0.5);
    expect(seven).toHaveLength(7);
    expect(seven[0]).toEqual({ x: 0, y: 0 });
  });

  it("climbs stepping stones left to right", () => {
    const stones = steppingStones(3, 4, 1.2);
    expect(stones.map((s) => s.x)).toEqual([-2, 0, 2]);
    expect(stones[0].y).toBeLessThan(stones[2].y);
    expect(steppingStones(1, 4, 1.2)[0]).toEqual({ x: 0, y: 0, z: 0.3 });
  });
});
