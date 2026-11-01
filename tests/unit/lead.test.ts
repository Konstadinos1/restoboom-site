import { describe, expect, it } from "vitest";
import { captureUtm, formatNanpPhone, leadFieldErrors, leadSchema, normalizeNanpPhone, parseUtm } from "@/lib/lead";

const valid = { name: "Julie Tremblay", email: "Julie@Resto.ca", restaurant: "Resto du Coin", locale: "fr" as const, consent: true as const };

describe("normalizeNanpPhone", () => {
  it.each([
    ["(514) 555-0123", "+15145550123"],
    ["450-555-0199", "+14505550199"],
    ["438 555 0100", "+14385550100"],
    ["1 (514) 555-0123", "+15145550123"],
    ["+1 514.555.0123", "+15145550123"],
  ])("normalizes quebec number %s to E.164", (input, expected) => {
    expect(normalizeNanpPhone(input)).toBe(expected);
  });

  it.each(["555-0123", "(014) 555-0123", "(514) 155-0123", "2 514 555 0123", "", "abc"])("rejects invalid number %s", (input) => {
    expect(normalizeNanpPhone(input)).toBeNull();
  });

  it("formats E.164 back to the quebec display convention", () => {
    expect(formatNanpPhone("+15145550123")).toBe("(514) 555-0123");
  });
});

describe("leadSchema", () => {
  it("accepts a minimal valid lead and normalizes email + optional fields", () => {
    const out = leadSchema.parse(valid);
    expect(out.email).toBe("julie@resto.ca");
    expect(out.phone).toBeNull();
    expect(out.website_url).toBeNull();
    expect(out.locations).toBeNull();
  });

  it("stores a quebec phone as E.164", () => {
    expect(leadSchema.parse({ ...valid, phone: "(450) 555-0199" }).phone).toBe("+14505550199");
  });

  it("flags an invalid phone with a specific code", () => {
    const r = leadSchema.safeParse({ ...valid, phone: "12345" });
    expect(r.success).toBe(false);
    if (!r.success) expect(leadFieldErrors(r.error).phone).toBe("invalid_phone");
  });

  it("requires consent (CASL)", () => {
    const r = leadSchema.safeParse({ ...valid, consent: false });
    expect(r.success).toBe(false);
    if (!r.success) expect(Object.keys(leadFieldErrors(r.error))).toContain("consent");
  });

  it("rejects whitespace-only required fields", () => {
    const r = leadSchema.safeParse({ ...valid, name: "   ", restaurant: "" });
    expect(r.success).toBe(false);
    if (!r.success) expect(Object.keys(leadFieldErrors(r.error)).sort()).toEqual(["name", "restaurant"]);
  });

  it("rejects malformed email and non-http URLs", () => {
    const r = leadSchema.safeParse({ ...valid, email: "julie@", website_url: "javascript:alert(1)" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const errs = leadFieldErrors(r.error);
      expect(errs.email).toBeDefined();
      expect(errs.website_url).toBe("invalid_url");
    }
  });

  it("rejects an unknown location bucket and a filled honeypot", () => {
    expect(leadSchema.safeParse({ ...valid, locations: "50" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...valid, company_website: "spam.example" }).success).toBe(false);
  });

  it("enforces the maximum text length boundary", () => {
    expect(leadSchema.safeParse({ ...valid, name: "a".repeat(200) }).success).toBe(true);
    expect(leadSchema.safeParse({ ...valid, name: "a".repeat(201) }).success).toBe(false);
  });
});

describe("UTM attribution", () => {
  const memoryStorage = () => {
    const m = new Map<string, string>();
    return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
  };

  it("parses only known utm keys", () => {
    expect(parseUtm("?utm_source=google&utm_medium=cpc&foo=bar")).toEqual({ utm_source: "google", utm_medium: "cpc" });
  });

  it("keeps first-touch params for later pages in the session", () => {
    const s = memoryStorage();
    captureUtm(s, "?utm_campaign=laval-fall");
    expect(captureUtm(s, "")).toEqual({ utm_campaign: "laval-fall" });
  });

  it("survives corrupted storage", () => {
    const s = memoryStorage();
    s.setItem("rb_utm", "{not json");
    expect(captureUtm(s, "")).toEqual({});
  });
});
