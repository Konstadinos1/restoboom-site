/**
 * Click-to-explore for the platform's module cubes: what the pointer is over,
 * which cube is open, and the small bits of maths the cubes animate with.
 * No three.js here, so it stays unit-testable.
 */

/** Fired on window when a cube opens (index) or closes (null). */
export const EXPLORE_EVENT = "rb:explore";
/** Fired on window by the page (the readout's close button) to close the open cube. */
export const EXPLORE_CLOSE_EVENT = "rb:explore-close";
/** <html data-cursor="explore"> while the pointer is over a cube: the cursor shows its label and a hand. */
export const EXPLORE_CURSOR = "explore";
/** The module cards carry data-explore-index: hovering one lights its cube. */
export const EXPLORE_INDEX_ATTRIBUTE = "data-explore-index";

export type ExploreState = { hovered: number | null; opened: number | null };
export type ExploreAction =
  | { type: "hover"; index: number | null }
  /** A click, with the item under the pointer at that moment (null: empty space). */
  | { type: "click"; index: number | null }
  | { type: "escape" }
  /** The camera left the station. */
  | { type: "leave" };

export const EXPLORE_IDLE: ExploreState = { hovered: null, opened: null };

export function exploreReducer(state: ExploreState, action: ExploreAction): ExploreState {
  switch (action.type) {
    case "hover":
      return action.index === state.hovered ? state : { ...state, hovered: action.index };
    case "click":
      // Clicking the open cube again, or anywhere else, closes it.
      return { ...state, opened: action.index === null || action.index === state.opened ? null : action.index };
    case "escape":
      return state.opened === null ? state : { ...state, opened: null };
    case "leave":
      return state.hovered === null && state.opened === null ? state : EXPLORE_IDLE;
  }
}

/** Frame-rate independent easing towards a target: `rate` is how fast it closes the gap, per second. */
export function approach(current: number, target: number, dt: number, rate: number): number {
  return current + (target - current) * (1 - Math.exp(-Math.max(0, dt) * rate));
}

const TAU = Math.PI * 2;

/** Blend from angle `a` to angle `b` (radians) the short way round. */
export function lerpAngle(a: number, b: number, t: number): number {
  const delta = ((((b - a + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
  return a + delta * t;
}

/** Where a pointer position lands in normalised device coordinates (-1..1, y up). */
export function toDeviceCoords(clientX: number, clientY: number, width: number, height: number): { x: number; y: number } {
  return { x: (clientX / Math.max(1, width)) * 2 - 1, y: -(clientY / Math.max(1, height)) * 2 + 1 };
}
