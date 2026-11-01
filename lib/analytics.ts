/**
 * Consent-first, cookieless analytics (Law 25).
 *
 * Nothing is sent unless BOTH: an endpoint is configured at build time
 * (NEXT_PUBLIC_ANALYTICS_ENDPOINT, Plausible-compatible /api/event — self-host
 * it in Canada to keep the "data in Canada" promise) AND the visitor opted in.
 */
export type ConsentState = "granted" | "denied" | "unset";
export type EventProps = Record<string, string | number | boolean>;

export const CONSENT_STORAGE_KEY = "rb_consent";
export const CONSENT_EVENT = "rb:consent";
const ANALYTICS_ENDPOINT = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || "";
const ANALYTICS_DOMAIN = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN || "";

export function analyticsConfigured(endpoint = ANALYTICS_ENDPOINT): boolean {
  return endpoint.startsWith("https://");
}

export function readConsent(storage: Pick<Storage, "getItem"> | null): ConsentState {
  const value = storage?.getItem(CONSENT_STORAGE_KEY);
  return value === "granted" || value === "denied" ? value : "unset";
}

export function writeConsent(storage: Pick<Storage, "setItem">, state: Exclude<ConsentState, "unset">): void {
  storage.setItem(CONSENT_STORAGE_KEY, state);
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
}

export type AnalyticsPayload = { n: string; u: string; d: string; r: string | null; p?: EventProps };

/** Build the Plausible-compatible body. Query strings are stripped: they can carry personal data. */
export function buildPayload(name: string, href: string, referrer: string, props?: EventProps): AnalyticsPayload {
  const url = new URL(href);
  url.search = "";
  url.hash = "";
  return { n: name, u: url.toString(), d: ANALYTICS_DOMAIN || url.hostname, r: referrer || null, ...(props ? { p: props } : {}) };
}

function safeStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Fire-and-forget event. Silently no-ops without consent or config — by design, never throws. */
export function track(name: string, props?: EventProps): boolean {
  if (typeof window === "undefined" || !analyticsConfigured()) return false;
  if (readConsent(safeStorage()) !== "granted") return false;
  const body = JSON.stringify(buildPayload(name, window.location.href, document.referrer, props));
  try {
    const sent = navigator.sendBeacon?.(ANALYTICS_ENDPOINT, new Blob([body], { type: "text/plain" }));
    if (!sent) void fetch(ANALYTICS_ENDPOINT, { method: "POST", body, keepalive: true }).catch(() => undefined);
    return true;
  } catch {
    return false;
  }
}
