import { describe, expect, it, vi } from "vitest";
import { submitLead, submitMode } from "@/lib/submitLead";
import { leadSchema } from "@/lib/lead";

const lead = leadSchema.parse({ name: "Julie", email: "julie@resto.ca", restaurant: "Resto", locale: "fr", consent: true });
const endpoint = "https://abc.supabase.co/functions/v1/diagnostic-lead";
const respond = (status: number) => vi.fn(async () => new Response(null, { status })) as unknown as typeof fetch;

describe("submitMode", () => {
  it("prefers the edge function, then the anon insert, else none", () => {
    expect(submitMode({ endpoint, supabaseUrl: "u", supabaseAnonKey: "k" })).toBe("endpoint");
    expect(submitMode({ supabaseUrl: "u", supabaseAnonKey: "k" })).toBe("supabase");
    expect(submitMode({ endpoint: "http://insecure" })).toBe("none");
    expect(submitMode({})).toBe("none");
  });
});

describe("submitLead", () => {
  it("posts JSON to the endpoint and reports success", async () => {
    const f = respond(201);
    await expect(submitLead(lead, { endpoint }, f)).resolves.toEqual({ ok: true, via: "endpoint" });
    const [url, init] = (f as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls[0];
    expect(url).toBe(endpoint);
    expect(JSON.parse(init.body as string).email).toBe("julie@resto.ca");
  });

  it.each([
    [429, "rate_limited"],
    [422, "invalid"],
    [500, "server"],
  ])("maps HTTP %i to %s", async (status, reason) => {
    await expect(submitLead(lead, { endpoint }, respond(status))).resolves.toEqual({ ok: false, reason });
  });

  it("reports network failures instead of throwing", async () => {
    const f = vi.fn(async () => {
      throw new TypeError("offline");
    }) as unknown as typeof fetch;
    await expect(submitLead(lead, { endpoint }, f)).resolves.toEqual({ ok: false, reason: "network" });
  });

  it("returns not_configured when nothing is set", async () => {
    await expect(submitLead(lead, {})).resolves.toEqual({ ok: false, reason: "not_configured" });
  });
});
