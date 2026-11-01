import { test as base, expect, type Page, type Request } from "@playwright/test";

/** Must match the env used for the E2E build (see package.json "build:e2e"). */
export const LEAD_ENDPOINT = "https://lead.e2e.invalid/functions/v1/diagnostic-lead";
export const ANALYTICS_ENDPOINT = "https://stats.e2e.invalid/api/event";

type Captured = { leads: Record<string, unknown>[]; events: Record<string, unknown>[]; errors: string[] };

export const test = base.extend<{ captured: Captured; leadStatus: { code: number } }>({
  leadStatus: async ({}, use) => use({ code: 201 }),
  // auto: the network mock must be installed for EVERY test, even ones that don't read `captured`,
  // otherwise requests escape to the real network and failure-path tests pass for the wrong reason.
  captured: [async ({ page, leadStatus }, use) => {
    const captured: Captured = { leads: [], events: [], errors: [] };
    page.on("pageerror", (e) => captured.errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && captured.errors.push(m.text()));
    // Mirrors the Edge Function: CORS preflight answered separately from the POST.
    const cors = { "access-control-allow-origin": "*", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type" };
    await page.route(LEAD_ENDPOINT, async (route) => {
      if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
      captured.leads.push(route.request().postDataJSON());
      await route.fulfill({ status: leadStatus.code, contentType: "application/json", body: "{}", headers: cors });
    });
    await page.route(ANALYTICS_ENDPOINT, async (route) => {
      captured.events.push(JSON.parse(route.request().postData() || "{}"));
      await route.fulfill({ status: 202, body: "ok" });
    });
    await use(captured);
  }, { auto: true }],
});

export { expect };

/** Scroll the whole page so every [data-reveal] block animates in. */
export async function scrollThrough(page: Page, step = 500): Promise<void> {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= height; y += step) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" as ScrollBehavior }), y);
    await page.waitForTimeout(60);
  }
  // Let the last reveal transitions (≤1.1 s) settle before asserting or auditing contrast.
  await page.waitForTimeout(1300);
}

export async function setConsent(page: Page, state: "granted" | "denied"): Promise<void> {
  await page.addInitScript((s) => window.localStorage.setItem("rb_consent", s), state);
}

export function isLeadRequest(r: Request): boolean {
  return r.url() === LEAD_ENDPOINT && r.method() === "POST";
}
