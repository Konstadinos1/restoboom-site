import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ENDPOINT = "https://stats.restoboom.ca/api/event";

function stubBrowser(consent: string | null, beacon: boolean) {
  const sendBeacon = vi.fn(() => beacon);
  const fetchMock = vi.fn(async () => new Response(null, { status: 202 }));
  const dispatched: string[] = [];
  vi.stubGlobal("window", {
    localStorage: { getItem: () => consent, setItem: vi.fn() },
    location: { href: "https://konstadinos1.github.io/restoboom-site/?utm_source=x" },
    dispatchEvent: (e: Event) => dispatched.push(e.type),
  });
  vi.stubGlobal("document", { referrer: "https://google.com/" });
  vi.stubGlobal("navigator", { sendBeacon });
  vi.stubGlobal("fetch", fetchMock);
  return { sendBeacon, fetchMock, dispatched };
}

describe("track with a configured endpoint", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENDPOINT", ENDPOINT);
    vi.stubEnv("NEXT_PUBLIC_ANALYTICS_DOMAIN", "restoboom.ca");
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("sends nothing until the visitor opts in (Law 25)", async () => {
    const { sendBeacon } = stubBrowser(null, true);
    const { track } = await import("@/lib/analytics");
    expect(track("pageview")).toBe(false);
    expect(sendBeacon).not.toHaveBeenCalled();
  });

  it("sends nothing after an explicit refusal", async () => {
    const { sendBeacon } = stubBrowser("denied", true);
    const { track } = await import("@/lib/analytics");
    expect(track("pageview")).toBe(false);
    expect(sendBeacon).not.toHaveBeenCalled();
  });

  it("beacons a query-free payload once consent is granted", async () => {
    const { sendBeacon } = stubBrowser("granted", true);
    const { track } = await import("@/lib/analytics");
    expect(track("cta_click", { label: "hero_primary" })).toBe(true);
    const [url, blob] = sendBeacon.mock.calls[0] as unknown as [string, Blob];
    expect(url).toBe(ENDPOINT);
    const body = JSON.parse(await blob.text());
    expect(body).toMatchObject({ n: "cta_click", d: "restoboom.ca", u: "https://konstadinos1.github.io/restoboom-site/", p: { label: "hero_primary" } });
  });

  it("falls back to fetch keepalive when sendBeacon refuses", async () => {
    const { fetchMock } = stubBrowser("granted", false);
    const { track } = await import("@/lib/analytics");
    expect(track("pageview")).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(ENDPOINT, expect.objectContaining({ method: "POST", keepalive: true }));
  });

  it("writeConsent persists the choice and notifies listeners", async () => {
    const { dispatched } = stubBrowser(null, true);
    vi.stubGlobal("CustomEvent", class extends Event {});
    const { writeConsent, CONSENT_EVENT } = await import("@/lib/analytics");
    const setItem = vi.fn();
    writeConsent({ setItem }, "granted");
    expect(setItem).toHaveBeenCalledWith("rb_consent", "granted");
    expect(dispatched).toEqual([CONSENT_EVENT]);
  });
});
