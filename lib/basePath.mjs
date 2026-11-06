// Plain JavaScript on purpose: next.config.mjs imports this too, and it can't load TypeScript.

/** Where the site lives on GitHub Pages; pull-request previews build under preview/pr-N below it. */
export const PRODUCTION_BASE_PATH = "/restoboom-site";

const BASE_PATH_PATTERN = /^(\/[a-z0-9][a-z0-9._-]*)+$/i;

/**
 * The Next.js basePath for this build: production unless NEXT_PUBLIC_BASE_PATH
 * names another one (the preview workflow sets it).
 * @param {string | undefined} value the raw environment value
 * @returns {string}
 */
export function resolveBasePath(value) {
  if (!value) return PRODUCTION_BASE_PATH;
  if (!BASE_PATH_PATTERN.test(value)) {
    throw new Error(`Invalid NEXT_PUBLIC_BASE_PATH "${value}": use /segment/segment, no trailing slash`);
  }
  return value;
}

/**
 * Preview builds must not be indexed: NEXT_PUBLIC_NOINDEX=1 adds robots noindex to every page.
 * @param {string | undefined} value the raw environment value
 * @returns {boolean}
 */
export function isNoIndexBuild(value) {
  return value === "1";
}
