/**
 * Tiny client-side A/B framework for a static site.
 *
 * The variant is picked before first paint by an inline script (see
 * `experimentBootScript`) and written to <html data-ab-*>, so CSS can show the
 * right copy with zero layout shift and no hydration mismatch.
 */
export type Experiment = { id: string; variants: readonly string[] };

export const HERO_EXPERIMENT = { id: "hero", variants: ["a", "b"] } as const satisfies Experiment;
export const EXPERIMENTS: readonly Experiment[] = [HERO_EXPERIMENT];

const STORAGE_PREFIX = "rb_ab_";
/** FNV-1a 32-bit — stable, dependency-free hashing for bucketing. */
const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

export function hashString(input: string): number {
  let hash = FNV_OFFSET;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME) >>> 0;
  }
  return hash >>> 0;
}

/** Deterministic: the same visitor always lands in the same bucket of a given experiment. */
export function assignVariant(experiment: Experiment, visitorId: string): string {
  const bucket = hashString(`${experiment.id}:${visitorId}`) % experiment.variants.length;
  return experiment.variants[bucket];
}

/** `?ab_hero=b` forces a variant (QA, screenshots, paid-campaign landing pages). */
export function forcedVariant(experiment: Experiment, search: string): string | null {
  const value = new URLSearchParams(search).get(`ab_${experiment.id}`);
  return value && experiment.variants.includes(value) ? value : null;
}

export function readVariant(experiment: Experiment): string | null {
  if (typeof document === "undefined") return null;
  return document.documentElement.dataset[`ab${capitalize(experiment.id)}`] ?? null;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Inline <head> script. Self-contained (no imports) because it runs before the
 * JS bundle. Mirrors `assignVariant` + `forcedVariant`; unit tests keep them in sync.
 */
export function experimentBootScript(experiments: readonly Experiment[] = EXPERIMENTS): string {
  const config = JSON.stringify(experiments.map((e) => ({ id: e.id, v: e.variants })));
  return `(function(){try{var E=${config},d=document.documentElement,q=new URLSearchParams(location.search),s=localStorage,k="${STORAGE_PREFIX}vid",id=s.getItem(k);if(!id){id=Math.random().toString(36).slice(2)+Date.now().toString(36);s.setItem(k,id)}function h(t){var x=${FNV_OFFSET};for(var i=0;i<t.length;i++){x^=t.charCodeAt(i);x=Math.imul(x,${FNV_PRIME})>>>0}return x>>>0}E.forEach(function(e){var f=q.get("ab_"+e.id),v=f&&e.v.indexOf(f)>-1?f:e.v[h(e.id+":"+id)%e.v.length];d.setAttribute("data-ab-"+e.id,v)})}catch(_){}})();`;
}
