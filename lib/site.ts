/**
 * Single source of truth for site-wide constants. Everything that builds an
 * absolute URL (canonical, sitemap, JSON-LD, OG) must go through here so the
 * GitHub Pages basePath and a future custom domain only change in one place.
 */
export const SITE_ORIGIN = "https://konstadinos1.github.io";
export const BASE_PATH = "/restoboom-site";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || `${SITE_ORIGIN}${BASE_PATH}`).replace(/\/$/, "");
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "bonjour@restoboom.ca";
export const BRAND_NAME = "RestoBoom";

export type RoutePair = { fr: string; en: string; priority: number };

/** Every indexable page, as FR ↔ EN pairs. Paths end with "/" (trailingSlash: true). */
export const ROUTE_PAIRS: readonly RoutePair[] = [
  { fr: "/", en: "/en/", priority: 1 },
  { fr: "/tarifs/", en: "/en/pricing/", priority: 0.9 },
  { fr: "/diagnostic/", en: "/en/diagnostic/", priority: 0.9 },
  { fr: "/confidentialite/", en: "/en/privacy/", priority: 0.3 },
  { fr: "/conditions/", en: "/en/terms/", priority: 0.3 },
];

/** Absolute URL for a site path, basePath included. */
export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

/** Path of a file in /public, prefixed with basePath (plain <img>/<link> don't get it automatically). */
export function assetPath(path: string): string {
  return `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}
