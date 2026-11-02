export * from "../supabase/functions/_shared/lead-schema";

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;
export type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>;
const UTM_STORAGE_KEY = "rb_utm";

/** Extract known UTM params from a query string. */
export function parseUtm(search: string): UtmParams {
  const params = new URLSearchParams(search);
  const out: UtmParams = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim();
    if (value) out[key] = value.slice(0, 100);
  }
  return out;
}

/**
 * First-touch attribution: remember the UTM params of the landing page for the
 * session so a visitor who browses to /diagnostic is still attributed.
 */
export function captureUtm(storage: Pick<Storage, "getItem" | "setItem">, search: string): UtmParams {
  const fresh = parseUtm(search);
  if (Object.keys(fresh).length > 0) {
    storage.setItem(UTM_STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }
  try {
    return JSON.parse(storage.getItem(UTM_STORAGE_KEY) || "{}") as UtmParams;
  } catch {
    return {};
  }
}
