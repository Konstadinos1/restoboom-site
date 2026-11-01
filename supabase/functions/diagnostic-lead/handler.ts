/**
 * Lead intake for the static marketing site (see index.ts for deployment notes).
 *
 * - Validates with the same Zod schema as the browser form (../_shared/lead-schema.ts)
 * - Honeypot + per-IP rate limit (hashed IP, never stored raw — Law 25 minimisation)
 * - Inserts with the service-role key (function secret, never shipped to the browser)
 * - Optional fan-out to LEAD_WEBHOOK_URL (outreach pipeline / Slack / n8n)
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { leadSchema } from "../_shared/lead-schema.ts";

const RATE_LIMIT_WINDOW_MINUTES = 60;
const RATE_LIMIT_MAX = 5;
const MAX_BODY_BYTES = 8_192;
const DEFAULT_ORIGIN = "https://konstadinos1.github.io";

type Guard = { ok: true; body: unknown } | { ok: false; response: Response };

/** Read per request (not at import) so secrets rotate without a redeploy and tests can set them. */
function allowedOrigins(): string[] {
  return (Deno.env.get("ALLOWED_ORIGINS") ?? DEFAULT_ORIGIN).split(",").map((o) => o.trim()).filter(Boolean);
}

function corsHeaders(origin: string | null): HeadersInit {
  const allowed = allowedOrigins();
  return {
    "access-control-allow-origin": origin && allowed.includes(origin) ? origin : allowed[0],
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    vary: "origin",
  };
}

function json(status: number, body: unknown, origin: string | null): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(origin), "content-type": "application/json" } });
}

export async function hashIp(ip: string): Promise<string> {
  const salt = Deno.env.get("IP_HASH_SALT") ?? "";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${ip}`));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function notifyWebhook(lead: Record<string, unknown>): Promise<void> {
  const url = Deno.env.get("LEAD_WEBHOOK_URL");
  if (!url) return;
  try {
    const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type: "diagnostic_lead", lead }) });
    await res.body?.cancel();
  } catch (err) {
    // The lead is already stored; a failed notification must not fail the request.
    console.error("lead webhook failed", err);
  }
}

/** Method, origin, size and JSON checks before any database work. */
async function guardRequest(req: Request, origin: string | null): Promise<Guard> {
  if (req.method !== "POST") return { ok: false, response: json(405, { error: "method_not_allowed" }, origin) };
  if (origin && !allowedOrigins().includes(origin)) return { ok: false, response: json(403, { error: "origin_not_allowed" }, origin) };
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return { ok: false, response: json(413, { error: "payload_too_large" }, origin) };
  try {
    return { ok: true, body: JSON.parse(raw) };
  } catch {
    return { ok: false, response: json(400, { error: "invalid_json" }, origin) };
  }
}

/** true when this hashed IP already sent RATE_LIMIT_MAX leads in the window; throws on query failure. */
async function isRateLimited(supabase: SupabaseClient, ipHash: string): Promise<boolean> {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60_000).toISOString();
  const { count, error } = await supabase.from("diagnostic_leads").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", since);
  if (error) throw error;
  return (count ?? 0) >= RATE_LIMIT_MAX;
}

export async function handleLeadRequest(req: Request): Promise<Response> {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });
  const guard = await guardRequest(req, origin);
  if (!guard.ok) return guard.response;

  const parsed = leadSchema.safeParse(guard.body);
  if (!parsed.success) return json(422, { error: "invalid", issues: parsed.error.issues.map((i) => i.path.join(".")) }, origin);
  const { company_website: _honeypot, consent: _consent, ...lead } = parsed.data;

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const ipHash = await hashIp(req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown");
  try {
    if (await isRateLimited(supabase, ipHash)) return json(429, { error: "rate_limited" }, origin);
    const row = { ...lead, source: lead.source ?? "marketing-site", ip_hash: ipHash, consent_at: new Date().toISOString() };
    const { error } = await supabase.from("diagnostic_leads").insert(row);
    if (error) throw error;
    await notifyWebhook({ ...lead, created_at: row.consent_at });
    return json(201, { ok: true }, origin);
  } catch (err) {
    console.error("diagnostic-lead failed", err);
    return json(500, { error: "server" }, origin);
  }
}
