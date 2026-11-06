import { describe, expect, it } from "vitest";
import { approach, EXPLORE_IDLE, exploreReducer, lerpAngle, toDeviceCoords, type ExploreState } from "@/lib/world/explore";

describe("click-to-explore state", () => {
  const opened = (index: number, hovered: number | null = index): ExploreState => ({ hovered, opened: index });

  it("tracks the cube under the pointer without touching the open one", () => {
    expect(exploreReducer(EXPLORE_IDLE, { type: "hover", index: 2 })).toEqual({ hovered: 2, opened: null });
    expect(exploreReducer(opened(1), { type: "hover", index: 3 })).toEqual({ hovered: 3, opened: 1 });
  });

  it("returns the same state when nothing changes, so the scene and page aren't told twice", () => {
    const state = { hovered: 2, opened: null };
    expect(exploreReducer(state, { type: "hover", index: 2 })).toBe(state);
    expect(exploreReducer(EXPLORE_IDLE, { type: "escape" })).toBe(EXPLORE_IDLE);
    expect(exploreReducer(EXPLORE_IDLE, { type: "leave" })).toBe(EXPLORE_IDLE);
  });

  it("opens the clicked cube, switches to another one, and closes on a second click", () => {
    const first = exploreReducer(EXPLORE_IDLE, { type: "click", index: 0 });
    expect(first.opened).toBe(0);
    const second = exploreReducer(first, { type: "click", index: 3 });
    expect(second.opened).toBe(3);
    expect(exploreReducer(second, { type: "click", index: 3 }).opened).toBeNull();
  });

  it("closes when clicking empty space or pressing Escape", () => {
    expect(exploreReducer(opened(2), { type: "click", index: null }).opened).toBeNull();
    expect(exploreReducer(opened(2), { type: "escape" })).toEqual({ hovered: 2, opened: null });
  });

  it("forgets everything once the camera leaves the station", () => {
    expect(exploreReducer(opened(1, 3), { type: "leave" })).toEqual(EXPLORE_IDLE);
  });
});

describe("cube animation maths", () => {
  it("eases towards a target at the same pace whatever the frame rate", () => {
    const oneStep = approach(0, 1, 0.2, 7);
    let twoSteps = approach(0, 1, 0.1, 7);
    twoSteps = approach(twoSteps, 1, 0.1, 7);
    expect(twoSteps).toBeCloseTo(oneStep, 12);
    expect(approach(0.3, 1, 0, 7)).toBe(0.3);
    expect(approach(0.3, 1, -1, 7)).toBe(0.3);
    expect(approach(0, 1, 10, 7)).toBeCloseTo(1, 9);
  });

  it("blends angles the short way round", () => {
    expect(lerpAngle(0, Math.PI / 2, 0.5)).toBeCloseTo(Math.PI / 4);
    // From just below a full turn to just above zero: forwards by 0.2 rad, not backwards by 2π - 0.2.
    expect(lerpAngle(2 * Math.PI - 0.1, 0.1, 1)).toBeCloseTo(2 * Math.PI + 0.1);
    expect(lerpAngle(25, 0.3, 0)).toBe(25);
  });

  it("maps screen pixels to device coordinates with y pointing up", () => {
    expect(toDeviceCoords(0, 0, 1440, 900)).toEqual({ x: -1, y: 1 });
    expect(toDeviceCoords(720, 450, 1440, 900)).toEqual({ x: 0, y: 0 });
    expect(toDeviceCoords(1440, 900, 1440, 900)).toEqual({ x: 1, y: -1 });
    expect(toDeviceCoords(10, 10, 0, 0)).toEqual({ x: 19, y: -19 });
  });
});
