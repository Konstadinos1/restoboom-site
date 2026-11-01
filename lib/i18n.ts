import { ROUTE_PAIRS } from "./site";

export type Locale = "fr" | "en";

function stripTrailingSlash(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

/** Opposite-locale path for the language toggle; unknown paths fall back to the other home page. */
export function langSwitchHref(current: { locale: Locale; path: string }): string {
  const needle = stripTrailingSlash(current.path || "/");
  const pair = ROUTE_PAIRS.find((p) => stripTrailingSlash(p[current.locale]) === needle);
  if (pair) return current.locale === "fr" ? pair.en : pair.fr;
  return current.locale === "fr" ? "/en/" : "/";
}

/** Home page for a locale — in-page anchors must target the same-language home. */
export function homeHref(locale: Locale): string {
  return locale === "fr" ? "/" : "/en/";
}

/** Anchor on the locale's own home page (fixes EN nav previously jumping to the FR page). */
export function homeAnchor(locale: Locale, anchor: string): string {
  return `${homeHref(locale)}#${anchor}`;
}
