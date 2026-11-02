// Captures the review evidence: screenshots of every changed screen/state (desktop + mobile)
// and videos of the main flows. Run after `npm run build:e2e`. Output: evidence/ (git-ignored raw/).
// Usage: node scripts/capture-evidence.mjs [--screens-only | --videos-only]
// Videos run in their own fresh browser: sharing one CPU-bound (SwiftShader WebGL) browser with
// dozens of screenshot contexts starved the screencast and silently truncated the recording.
import { chromium, devices } from "@playwright/test";
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const PORT = 4176;
const BASE = `http://localhost:${PORT}/restoboom-site/`;
const OUT = "evidence/raw";
const LEAD = "https://lead.e2e.invalid/functions/v1/diagnostic-lead";
const STATS = "https://stats.e2e.invalid/api/event";
const WEBGL = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"];
const DESKTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 };
const MOBILE = { ...devices["Pixel 7"] };
const CORS = { "access-control-allow-origin": "*", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type" };

mkdirSync(OUT, { recursive: true });
const server = spawn(process.execPath, ["scripts/serve-out.mjs", String(PORT)], { stdio: "ignore" });
const issues = [];

async function mockNetwork(page, leadStatus = 201) {
  page.on("pageerror", (e) => issues.push(`pageerror on ${page.url()}: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && issues.push(`console error on ${page.url()}: ${m.text()}`));
  await page.route(LEAD, (r) => (r.request().method() === "OPTIONS" ? r.fulfill({ status: 204, headers: CORS }) : r.fulfill({ status: leadStatus, body: "{}", headers: CORS })));
  await page.route(STATS, (r) => r.fulfill({ status: 202, body: "ok" }));
}

async function settle(page, ms = 1300) {
  await page.waitForTimeout(ms);
}

async function shoot(page, name) {
  await page.screenshot({ path: join(OUT, `${name}.png`) });
}

async function scrollTo(page, selector) {
  // Instant scroll: html has scroll-behavior:smooth, and a second smooth scroll would cancel the first.
  await page.locator(selector).first().evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: "instant" }));
  await settle(page);
}

async function fillLead(page, { phone = "(450) 555-0199" } = {}) {
  await page.fill("#df-name", "Julie Tremblay");
  await page.fill("#df-email", "julie@resto-du-coin.ca");
  await page.fill("#df-restaurant", "Resto du Coin");
  await page.fill("#df-phone", phone);
  await page.selectOption("#df-locations", "2-5");
  await page.fill("#df-website_url", "https://resto-du-coin.ca");
  await page.check("#df-consent");
}

async function newDesktopPage(browser, { leadStatus = 201, consent = "denied", reducedMotion } = {}) {
  const ctx = await browser.newContext({ ...DESKTOP, ...(reducedMotion ? { reducedMotion } : {}) });
  if (consent) await ctx.addInitScript((c) => localStorage.setItem("rb_consent", c), consent);
  const page = await ctx.newPage();
  await mockNetwork(page, leadStatus);
  return { ctx, page };
}

async function shootHome(page) {
  for (const v of ["a", "b"]) {
    await page.goto(`${BASE}?ab_hero=${v}`);
    await page.waitForSelector("[data-testid=hero-canvas][data-ready=true]", { timeout: 15000 }).catch(() => issues.push(`WebGL hero not ready (variant ${v})`));
    await settle(page, 2500);
    await shoot(page, `d01-home-hero-variant-${v}`);
  }
  const sections = [["scene-h2", "d02-home-12h15-timeline"], ["pain-h2", "d03-home-pains"], ["platform-h2", "d04-home-platform"], ["how-h2", "d05-home-steps"], ["compliance-h2", "d06-home-compliance"], ["samples-h2", "d07-home-samples"], ["pricing-h2", "d08-home-pricing"], ["faq-h2", "d09-home-faq"], ["closer-h2", "d10-home-closer"]];
  for (const [id, name] of sections) {
    await scrollTo(page, `[aria-labelledby="${id}"]`);
    await shoot(page, name);
  }
  await page.getByText("Mon numéro de téléphone change-t-il\u00a0?").click();
  await settle(page, 500);
  await shoot(page, "d11-home-faq-open");
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await settle(page);
  await shoot(page, "d12-footer");
}

async function shootSecondaryPages(page) {
  const pages = [["en/?ab_hero=a", "d13-en-home-hero", 3000], ["tarifs/", "d14-pricing-page"], ["confidentialite/", "d20-privacy"], ["page-inexistante/", "d21-404", 500]];
  for (const [path, name, ms] of pages) {
    await page.goto(`${BASE}${path}`);
    await settle(page, ms);
    await shoot(page, name);
    if (path === "tarifs/") {
      await page.evaluate(() => window.scrollTo(0, 700));
      await settle(page);
      await shoot(page, "d15-pricing-included");
    }
  }
}

async function shootFormStates(page) {
  await page.goto(`${BASE}diagnostic/`);
  await settle(page);
  await shoot(page, "d16-diagnostic-idle");
  await page.getByTestId("lead-submit").click();
  await settle(page, 400);
  await shoot(page, "d17-diagnostic-errors-empty");
  for (const [sel, val] of [["#df-name", "Julie"], ["#df-email", "julie@"], ["#df-restaurant", "Resto"], ["#df-phone", "555-01"], ["#df-website_url", "resto dot ca"]]) await page.fill(sel, val);
  await page.getByTestId("lead-submit").click();
  await settle(page, 400);
  await page.locator("form").evaluate((f) => f.scrollIntoView({ block: "center" }));
  await shoot(page, "d18-diagnostic-errors-invalid-fields");
  await page.goto(`${BASE}diagnostic/`);
  await fillLead(page);
  await page.getByTestId("lead-submit").click();
  await page.getByTestId("lead-success").waitFor();
  await settle(page, 400);
  await shoot(page, "d19-diagnostic-success");
}

/** 429 / 500 responses: each needs its own network behaviour. */
async function shootFailureStates(browser) {
  for (const [status, name] of [[429, "d22-diagnostic-rate-limited"], [500, "d23-diagnostic-server-error"]]) {
    const { ctx, page } = await newDesktopPage(browser, { leadStatus: status });
    await page.goto(`${BASE}en/diagnostic/`);
    await fillLead(page);
    await page.getByTestId("lead-submit").click();
    await page.getByTestId("lead-status").locator("a").waitFor();
    await page.getByTestId("lead-submit").scrollIntoViewIfNeeded();
    await settle(page, 400);
    await shoot(page, name);
    await ctx.close();
  }
}

/** "Sending…" state: hold the response so the disabled button + label are visible. */
async function shootSendingState(browser) {
  const { ctx, page } = await newDesktopPage(browser);
  await page.unroute(LEAD);
  await page.route(LEAD, async (r) => {
    if (r.request().method() === "OPTIONS") return r.fulfill({ status: 204, headers: CORS });
    await new Promise((res) => setTimeout(res, 4000));
    await r.fulfill({ status: 201, body: "{}", headers: CORS }).catch(() => undefined);
  });
  await page.goto(`${BASE}diagnostic/`);
  await fillLead(page);
  await page.getByTestId("lead-submit").click();
  await page.getByText("Envoi…").waitFor();
  await page.getByTestId("lead-submit").scrollIntoViewIfNeeded();
  await shoot(page, "d26-diagnostic-sending");
  await ctx.close();
}

async function shootOverlays(browser) {
  const fresh = await newDesktopPage(browser, { consent: null });
  await fresh.page.goto(BASE);
  await settle(fresh.page, 2500);
  await shoot(fresh.page, "d24-consent-banner");
  await fresh.ctx.close();
  const rm = await newDesktopPage(browser, { reducedMotion: "reduce" });
  await rm.page.goto(`${BASE}?ab_hero=a`);
  await settle(rm.page, 3500);
  await shoot(rm.page, "d25-reduced-motion-static-hero");
  await rm.ctx.close();
}

async function desktopScreens(browser) {
  const { ctx, page } = await newDesktopPage(browser);
  await shootHome(page);
  await shootSecondaryPages(page);
  await shootFormStates(page);
  await ctx.close();
  await shootFailureStates(browser);
  await shootSendingState(browser);
  await shootOverlays(browser);
}

async function mobileScreens(browser) {
  const ctx = await browser.newContext(MOBILE);
  await ctx.addInitScript(() => localStorage.setItem("rb_consent", "denied"));
  const page = await ctx.newPage();
  await mockNetwork(page);
  await page.goto(`${BASE}?ab_hero=a`);
  await settle(page, 2500);
  await shoot(page, "m01-home-hero-static-fallback");
  await page.getByRole("button", { name: "Menu" }).click();
  await settle(page, 400);
  await shoot(page, "m02-menu-open");
  await page.keyboard.press("Escape");
  for (const [id, name] of [["scene-h2", "m03-timeline"], ["platform-h2", "m04-platform"], ["pricing-h2", "m05-pricing"], ["faq-h2", "m06-faq"]]) {
    await scrollTo(page, `[aria-labelledby="${id}"]`);
    await shoot(page, name);
  }
  await page.goto(`${BASE}diagnostic/`);
  await page.getByTestId("lead-submit").click();
  await settle(page, 400);
  await shoot(page, "m07-diagnostic-errors");
  await fillLead(page);
  await page.getByTestId("lead-submit").click();
  await page.getByTestId("lead-success").waitFor();
  await page.getByTestId("lead-success").scrollIntoViewIfNeeded();
  await settle(page, 400);
  await shoot(page, "m08-diagnostic-success");
  await page.goto(`${BASE}en/pricing/`);
  await settle(page);
  await shoot(page, "m09-en-pricing");
  await ctx.close();
}

async function recordFlow(browser, name, contextOptions, steps) {
  const dir = join(OUT, `video-${name}`);
  const ctx = await browser.newContext({ ...contextOptions, recordVideo: { dir, size: contextOptions.viewport } });
  await ctx.addInitScript(() => localStorage.setItem("rb_consent", "denied"));
  const page = await ctx.newPage();
  await mockNetwork(page);
  const started = Date.now();
  await steps(page);
  const elapsed = (Date.now() - started) / 1000;
  const video = page.video();
  await ctx.close();
  // saveAs() waits until the encoder has fully flushed; reading the raw file right after
  // context.close() could pick up a still-growing .webm and truncate the evidence.
  const webm = join(OUT, `${name}.webm`);
  await video.saveAs(webm);
  await video.delete();
  rmSync(dir, { recursive: true, force: true });
  console.log(`${name}: flow took ${elapsed.toFixed(1)}s`);
  toMp4(webm);
}

/** H.264 MP4 plays everywhere (phones, Slack, GitHub); skipped quietly if ffmpeg isn't installed. */
function toMp4(webm) {
  const mp4 = webm.replace(/\.webm$/, ".mp4");
  const r = spawnSync("ffmpeg", ["-v", "error", "-y", "-i", webm, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "24", "-preset", "medium", "-movflags", "+faststart", mp4]);
  if (r.error || r.status !== 0) issues.push(`mp4 conversion skipped for ${webm}: ${r.error?.message ?? r.stderr}`);
}

/**
 * Paced, instant programmatic scrolling. mouse.wheel queues compositor smooth-scroll animations;
 * under software rendering (SwiftShader in CI/sandboxes) that backlog made the screencast fall
 * seconds behind the real page and the end of the flow never reached the video.
 */
async function pacedScroll(page, distance, { stepPx = 80, pauseMs = 60 } = {}) {
  const steps = Math.ceil(Math.abs(distance) / stepPx);
  const step = Math.sign(distance) * stepPx;
  for (let i = 0; i < steps; i++) {
    await page.evaluate((y) => window.scrollBy({ top: y, behavior: "instant" }), step);
    await page.waitForTimeout(pauseMs);
  }
}

/** Let reveal transitions finish and the screencast catch up before the next step. */
async function beat(page, ms = 900) {
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.waitForTimeout(ms);
}

async function desktopHomeToLead(page) {
  await page.goto(`${BASE}?ab_hero=b&utm_source=demo`);
  await page.waitForSelector("[data-testid=hero-canvas][data-ready=true]", { timeout: 15000 }).catch(() => undefined);
  for (const [x, y] of [[900, 300], [1100, 480], [800, 560], [1000, 330]]) {
    await page.mouse.move(x, y, { steps: 20 });
    await page.waitForTimeout(250);
  }
  await page.mouse.click(1000, 380);
  await beat(page, 700);
  for (const id of ["scene-h2", "pain-h2", "platform-h2", "how-h2", "compliance-h2", "samples-h2", "pricing-h2", "faq-h2"]) {
    const target = await page.locator(`[aria-labelledby="${id}"]`).evaluate((el) => el.getBoundingClientRect().top - 72);
    await pacedScroll(page, target);
    await beat(page, 1100);
  }
  await page.getByText("Mon numéro de téléphone change-t-il\u00a0?").click();
  await beat(page, 1000);
  await page.getByRole("link", { name: /Obtenir mon diagnostic gratuit/ }).last().click();
  await page.waitForURL(/diagnostic/);
  await beat(page, 1000);
  await submitLeadOnCamera(page);
  await page.getByRole("link", { name: "Switch to English" }).first().click();
  await page.waitForURL(/\/en\/diagnostic\/$/);
  await beat(page, 2000);
}

/** Empty submit (errors) → typed answers → success, paced so each state is readable on video. */
async function submitLeadOnCamera(page) {
  await page.getByTestId("lead-submit").click();
  await beat(page, 1400);
  for (const [sel, val] of [["#df-name", "Julie Tremblay"], ["#df-email", "julie@resto-du-coin.ca"], ["#df-restaurant", "Resto du Coin"], ["#df-phone", "(450) 555-0199"]]) {
    await page.locator(sel).pressSequentially(val, { delay: 30 });
  }
  await page.selectOption("#df-locations", "2-5");
  await page.check("#df-consent");
  await beat(page, 600);
  await page.getByTestId("lead-submit").click();
  await page.getByTestId("lead-success").waitFor();
  await beat(page, 2000);
}

async function mobileMenuToPricing(page) {
  await page.goto(`${BASE}en/?ab_hero=a`);
  await beat(page, 1200);
  for (const id of ["scene-h2", "pain-h2", "platform-h2"]) {
    const target = await page.locator(`[aria-labelledby="${id}"]`).evaluate((el) => el.getBoundingClientRect().top - 64);
    await pacedScroll(page, target, { stepPx: 60 });
    await beat(page, 1000);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await beat(page, 600);
  await page.getByRole("button", { name: "Menu" }).click();
  await beat(page, 1200);
  await page.locator("#mobile-nav").getByRole("link", { name: "Pricing" }).click();
  await page.waitForURL(/pricing/);
  await beat(page, 1000);
  await pacedScroll(page, 1400, { stepPx: 60 });
  await beat(page, 1500);
}

async function videos(browser) {
  await recordFlow(browser, "flow-desktop-home-to-lead", { ...DESKTOP, viewport: { width: 1280, height: 720 } }, desktopHomeToLead);
  await recordFlow(browser, "flow-mobile-home-menu-pricing", MOBILE, mobileMenuToPricing);
}

try {
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(BASE)).ok) break;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  if (!process.argv.includes("--videos-only")) {
    const browser = await chromium.launch({ args: WEBGL });
    await desktopScreens(browser);
    await mobileScreens(browser);
    await browser.close();
  }
  if (!process.argv.includes("--screens-only")) {
    const browser = await chromium.launch({ args: WEBGL });
    await videos(browser);
    await browser.close();
  }
  console.log(`Evidence written to ${OUT}`);
  console.log(issues.length ? `ISSUES:\n${issues.join("\n")}` : "No runtime errors captured.");
} finally {
  server.kill();
}
