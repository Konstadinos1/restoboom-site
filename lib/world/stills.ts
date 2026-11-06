/**
 * Rendered stills of the 3D world (scripts/render-stills.mjs writes them into
 * public/world/). Visitors who don't get the live 3D (reduced motion,
 * Save-Data, no GPU) see the home one in its place; the other pages and the
 * 404 use them as backdrops, since the live 3D only runs on the home page.
 */
export type StillName = "home" | "pricing" | "vault" | "lost";

export type StillImage = {
  /** Path under public/ (prefix with assetPath for <img> and CSS). */
  src: string;
  width: number;
  height: number;
  /** CSS object-position that keeps the subject in frame when the image is cropped. */
  focus: string;
};

export type Still = StillImage & {
  /** Where to crop the landscape image on a phone-width band. */
  phoneFocus: string;
  /** A separate upright render for phones, when the landscape one would crop the subject. */
  phone?: StillImage;
};

/** Phones: the backdrop becomes a band above the title (matches the md breakpoint in globals.css). */
export const PHONE_MEDIA = "(max-width: 767px)";

const LANDSCAPE = { width: 1600, height: 1000 } as const;

const PORTRAIT = { width: 900, height: 1600 } as const;

/** The home still framed for a phone held upright (the live 3D lifts the bistro the same way). */
export const HOME_PORTRAIT_STILL: StillImage = { src: "/world/home-portrait.webp", ...PORTRAIT, focus: "50% 22%" };
/** The 404's question mark sits low in the landscape render: phones get an upright one. */
export const LOST_PORTRAIT_STILL: StillImage = { src: "/world/lost-portrait.webp", ...PORTRAIT, focus: "50% 0%" };

export const STILLS: Record<StillName, Still> = {
  home: { src: "/world/home-landscape.webp", ...LANDSCAPE, focus: "80% 50%", phoneFocus: "96% 50%", phone: HOME_PORTRAIT_STILL },
  pricing: { src: "/world/pricing-landscape.webp", ...LANDSCAPE, focus: "66% 55%", phoneFocus: "80% 55%" },
  vault: { src: "/world/vault-landscape.webp", ...LANDSCAPE, focus: "68% 52%", phoneFocus: "70% 52%" },
  lost: { src: "/world/lost-landscape.webp", ...LANDSCAPE, focus: "30% 52%", phoneFocus: "28% 52%", phone: LOST_PORTRAIT_STILL },
};
