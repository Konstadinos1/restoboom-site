/**
 * Colours of the 3D world: igloo-style cold fog and ice, with RestoBoom's warm
 * orange glowing from inside the bistro (the user's choice, Nov 2026).
 */
export const WORLD = {
  fog: "#aeb6c1",
  skyTop: "#dbe1e8",
  skyHorizon: "#a9b1bd",
  snow: "#dfe5ec",
  hemiSky: "#f1f5f9",
  hemiGround: "#8f98a8",
  iceTint: "#b7c7d5",
  /** Refractive ice (high tier) tints the light passing through it, so it starts paler. */
  iceClear: "#d3dee8",
  iceAttenuation: "#cddfec",
  ember: "#ff6a3d",
  emberHot: "#ffb27a",
  line: "#fff4ea",
  furniture: "#3b2d27",
} as const;

/** HDR multiplier for small hot things that must bloom (sign, lamps, the heart). */
export const GLOW_INTENSITY = 3.2;
/**
 * The room seen through the openings: large surfaces stay below the bloom
 * threshold so ACES keeps them a saturated orange instead of washing to peach.
 */
export const ROOM_GLOW = 1.15;
