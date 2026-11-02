/**
 * End-to-end tests for the lead handler against a local fake of Supabase's REST API
 * (PostgREST): real supabase-js client, real HTTP, no network beyond localhost.
 * Run: deno test --allow-env --allow-net supabase/functions/diagnostic-lead/
 */
import { assert, assertEquals } from "jsr:@std/assert@1";
import { handleLeadRequest, hashIp } from "./handler.ts";

const ORIGIN = "https://konstadinos1.github.io";
type Row = Record<string, unknown>;
type Fake = { rows: Row[]; webhooks: unknown[]; failInsert: boolean; url: string; close: () => Promise<void> };

/** Minimal PostgREST: HEAD count (Content-Range) + POST insert, plus a webhook sink. */
function startFakeSupabase(): Fake {
  const fake = { rows: [] as Row[], webhooks: [] as unknown[], failInsert: false } as Fake;
  const server = Deno.serve({ port: 0, onListen: () => {} }, async (req) => {
    const url = new URL(req.url);
    if (url.pathname === "/webhook") {
      fake.webhooks.push(await req.json());
      return new Response(null, { status: 204 });
    }
    if (req.method === "HEAD") {
      const ip = url.searchParams.get("ip_hash")?.replace(/^eq\./, "");
      const n = fake.rows.filter((r) => r.ip_hash === ip).length;
      return new Response(null, { status: 200, headers: { "content-range": `*/${n}` } });
    }
    if (req.method === "POST") {
      if (fake.failInsert) return Response.json({ message: "db down", code: "XX000" }, { status: 500 });
      const body = await req.json();
      fake.rows.push(...(Array.isArray(body) ? body : [body]));
      return new Response(null, { status: 201 });
    }
    return new Response("unexpected", { status: 400 });
  });
  fake.url = `http://localhost:${server.addr.port}`;
  fake.close = () => server.shutdown();
  return fake;
}

function setEnv(fake: Fake): void {
  Deno.env.set("SUPABASE_URL", fake.url);
  Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "test-service-role");
  Deno.env.set("ALLOWED_ORIGINS", ORIGIN);
  Deno.env.set("IP_HASH_SALT", "pepper");
  Deno.env.set("LEAD_WEBHOOK_URL", `${fake.url}/webhook`);
}

const validLead = { name: "Julie Tremblay", email: "Julie@Resto.ca", restaurant: "Resto du Coin", phone: "(450) 555-0199", locale: "fr", consent: true, utm_source: "google" };

function post(body: unknown, ip = "203.0.113.7", origin = ORIGIN): Request {
  return new Request("http://fn.local/diagnostic-lead", {
    method: "POST",
    headers: { origin, "content-type": "application/json", "x-forwarded-for": `${ip}, 10.0.0.1` },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

Deno.test("diagnostic-lead handler", async (t) => {
  const fake = startFakeSupabase();
  setEnv(fake);
  try {
    await t.step("answers the CORS preflight for the allowed origin", async () => {
      const res = await handleLeadRequest(new Request("http://fn.local/", { method: "OPTIONS", headers: { origin: ORIGIN } }));
      assertEquals(res.status, 204);
      assertEquals(res.headers.get("access-control-allow-origin"), ORIGIN);
      assertEquals(res.headers.get("access-control-allow-headers"), "content-type");
    });

    await t.step("rejects other methods, foreign origins and malformed JSON", async () => {
      assertEquals((await handleLeadRequest(new Request("http://fn.local/", { method: "GET" }))).status, 405);
      assertEquals((await handleLeadRequest(post(validLead, "1.1.1.1", "https://evil.example"))).status, 403);
      assertEquals((await handleLeadRequest(post("{not json"))).status, 400);
      assertEquals((await handleLeadRequest(post("x".repeat(9000)))).status, 413);
    });

    await t.step("rejects invalid leads and a filled honeypot with 422, storing nothing", async () => {
      const bad = await handleLeadRequest(post({ ...validLead, email: "julie@", consent: false }));
      assertEquals(bad.status, 422);
      assertEquals((await bad.json()).issues.sort(), ["consent", "email"]);
      assertEquals((await handleLeadRequest(post({ ...validLead, company_website: "spam.example" }))).status, 422);
      assertEquals(fake.rows.length, 0);
    });

    await t.step("stores a valid lead with a hashed IP only, and notifies the webhook", async () => {
      const res = await handleLeadRequest(post(validLead));
      assertEquals(res.status, 201);
      assertEquals(fake.rows.length, 1);
      const row = fake.rows[0];
      assertEquals(row.email, "julie@resto.ca");
      assertEquals(row.phone, "+14505550199");
      assertEquals(row.ip_hash, await hashIp("203.0.113.7"));
      assert(!JSON.stringify(row).includes("203.0.113.7"), "raw IP must never be stored");
      assert(!("consent" in row) && !("company_website" in row), "form-only fields are not columns");
      assert(typeof row.consent_at === "string");
      assertEquals(fake.webhooks.length, 1);
    });

    await t.step("rate-limits the 6th lead from the same IP within the hour", async () => {
      for (let i = 0; i < 4; i++) assertEquals((await handleLeadRequest(post(validLead))).status, 201);
      assertEquals((await handleLeadRequest(post(validLead))).status, 429);
      assertEquals((await handleLeadRequest(post(validLead, "198.51.100.9"))).status, 201, "other IPs are unaffected");
    });

    await t.step("returns 500 (not a crash) when the insert fails", async () => {
      fake.failInsert = true;
      assertEquals((await handleLeadRequest(post(validLead, "192.0.2.44"))).status, 500);
      fake.failInsert = false;
    });
  } finally {
    await fake.close();
  }
});
