import { describe, expect, it, vi } from "vitest";
import { leadSchema } from "@/lib/lead";

const insert = vi.fn();
vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({ from: () => ({ insert }) }) }));

const lead = leadSchema.parse({ name: "Julie", email: "julie@resto.ca", restaurant: "Resto", locale: "en", consent: true, phone: "514-555-0123", utm_source: "google" });
const config = { supabaseUrl: "https://x.supabase.co", supabaseAnonKey: "anon" };

describe("submitLead via the legacy anon insert", () => {
  it("inserts only v1 columns so it works before the v2 migration", async () => {
    insert.mockResolvedValueOnce({ error: null });
    const { submitLead } = await import("@/lib/submitLead");
    await expect(submitLead(lead, config)).resolves.toEqual({ ok: true, via: "supabase" });
    expect(Object.keys(insert.mock.calls[0][0]).sort()).toEqual(["email", "locale", "name", "restaurant", "source", "website_url"]);
  });

  it("reports a server error from Supabase", async () => {
    insert.mockResolvedValueOnce({ error: { message: "rls" } });
    const { submitLead } = await import("@/lib/submitLead");
    await expect(submitLead(lead, config)).resolves.toEqual({ ok: false, reason: "server" });
  });

  it("reports a network error when the client throws", async () => {
    insert.mockRejectedValueOnce(new Error("offline"));
    const { submitLead } = await import("@/lib/submitLead");
    await expect(submitLead(lead, config)).resolves.toEqual({ ok: false, reason: "network" });
  });
});
