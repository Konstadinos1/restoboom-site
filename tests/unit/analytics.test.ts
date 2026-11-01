import { afterEach, describe, expect, it, vi } from "vitest";
import { analyticsConfigured, buildPayload, readConsent, track } from "@/lib/analytics";

describe("consent", () => {
  it("reads only explicit granted/denied values", () => {
    expect(readConsent({ getItem: () => "granted" })).toBe("granted");
    expect(readConsent({ getItem: () => "denied" })).toBe("denied");
    expect(readConsent({ getItem: () => "yes" })).toBe("unset");
    expect(readConsent(null)).toBe("unset");
  });

  it("requires an https endpoint", () => {
    expect(analyticsConfigured("")).toBe(false);
    expect(analyticsConfigured("http://insecure.example/api/event")).toBe(false);
    expect(analyticsConfigured("https://stats.example.ca/api/event")).toBe(true);
  });
});

describe("buildPayload", () => {
  it("strips query strings and hashes, which can carry personal data", () => {
    const p = buildPayload("pageview", "https://site.ca/restoboom-site/diagnostic/?email=a@b.ca#x", "", { ab_hero: "b" });
    expect(p.u).toBe("https://site.ca/restoboom-site/diagnostic/");
    expect(p.r).toBeNull();
    expect(p.p).toEqual({ ab_hero: "b" });
  });
});

describe("track", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("never sends on the server or without configuration", () => {
    expect(track("pageview")).toBe(false);
    vi.stubGlobal("window", { localStorage: { getItem: () => "granted" }, location: { href: "https://x.ca/" } });
    expect(track("pageview")).toBe(false);
  });
});
