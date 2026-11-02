import type { Lead } from "./lead";

export type SubmitConfig = {
  /** Supabase Edge Function URL (preferred: server-side validation, rate limit, notifications). */
  endpoint?: string;
  /** Legacy path: direct insert with the anon key into an insert-only RLS table. */
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

export type SubmitResult = { ok: true; via: "endpoint" | "supabase" } | { ok: false; reason: "not_configured" | "rate_limited" | "invalid" | "network" | "server" };

const RATE_LIMITED_STATUS = 429;
const INVALID_STATUS = 422;
const LEAD_TIMEOUT_MS = 12_000;

export function submitMode(config: SubmitConfig): "endpoint" | "supabase" | "none" {
  if (config.endpoint?.startsWith("https://")) return "endpoint";
  if (config.supabaseUrl && config.supabaseAnonKey) return "supabase";
  return "none";
}

async function postToEndpoint(endpoint: string, lead: Lead, fetchImpl: typeof fetch): Promise<SubmitResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LEAD_TIMEOUT_MS);
  try {
    const res = await fetchImpl(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(lead),
      signal: controller.signal,
    });
    if (res.ok) return { ok: true, via: "endpoint" };
    if (res.status === RATE_LIMITED_STATUS) return { ok: false, reason: "rate_limited" };
    if (res.status === INVALID_STATUS) return { ok: false, reason: "invalid" };
    return { ok: false, reason: "server" };
  } catch {
    return { ok: false, reason: "network" };
  } finally {
    clearTimeout(timer);
  }
}

/** Only the original v1 columns, so the legacy path works before the v2 migration runs. */
async function insertViaSupabase(config: Required<Pick<SubmitConfig, "supabaseUrl" | "supabaseAnonKey">>, lead: Lead): Promise<SubmitResult> {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
    const { error } = await supabase.from("diagnostic_leads").insert({
      name: lead.name,
      email: lead.email,
      restaurant: lead.restaurant,
      website_url: lead.website_url,
      locale: lead.locale,
      source: lead.source ?? "marketing-site",
    });
    return error ? { ok: false, reason: "server" } : { ok: true, via: "supabase" };
  } catch {
    return { ok: false, reason: "network" };
  }
}

export async function submitLead(lead: Lead, config: SubmitConfig, fetchImpl: typeof fetch = fetch): Promise<SubmitResult> {
  const mode = submitMode(config);
  if (mode === "endpoint") return postToEndpoint(config.endpoint as string, lead, fetchImpl);
  if (mode === "supabase") return insertViaSupabase({ supabaseUrl: config.supabaseUrl as string, supabaseAnonKey: config.supabaseAnonKey as string }, lead);
  return { ok: false, reason: "not_configured" };
}
