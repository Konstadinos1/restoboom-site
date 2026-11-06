// Renders still images of the 3D world from the built site: the picture visitors without the live 3D
// get on the home page, the backdrops of the other pages and the 404, and the OG cards' background.
// The page's animation clock is driven frame by frame, so every run gives the same picture.
// Usage: npm run build && npm run stills   (writes WebP files into public/world/)
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(root, "public/world");
const PORT = 4188;
const BASE = `http://localhost:${PORT}/restoboom-site/`;
const WEBGL_ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"];
const WEBP_QUALITY = 0.8;
/** Simulated frames after the camera reaches its spot: covers the bistro's 2.8 s build-up and the camera easing in. */
const SETTLE_FRAMES = 45;
const FRAME_MS = 100;
const READY_TIMEOUT_FRAMES = 2400;
/** Software WebGL takes a while to draw a high-tier frame at this size. */
const SCREENSHOT_TIMEOUT_MS = 180_000;

/** Landscape renders on the high tier (wide screen, 12 cores); portrait as a phone-shaped medium tier. */
const VIEWS = {
  landscape: { width: 1600, height: 1000, cores: 12 },
  portrait: { width: 900, height: 1600, cores: 6 },
};

/** Which station each still shows, and how far into its section (0 = where the camera arrives). */
const STILLS = [
  { name: "home", station: "hero", progress: 0, views: ["landscape", "portrait"] },
  { name: "pricing", station: "pricing", progress: 0.65, views: ["landscape"] },
  { name: "vault", station: "compliance", progress: 0.2, views: ["landscape"] },
  { name: "lost", station: "faq", progress: 0.2, views: ["landscape", "portrait"] },
];

// Runs in the page before any script: rAF and performance.now only move when the renderer says so.
const VIRTUAL_CLOCK = () => {
  let now = 0;
  let queue = [];
  Object.defineProperty(performance, "now", { value: () => now, configurable: true });
  window.requestAnimationFrame = (cb) => queue.push(cb);
  window.cancelAnimationFrame = () => undefined;
  window.__advance = (ms) => {
    now += ms;
    const due = queue;
    queue = [];
    due.forEach((cb) => cb(now));
  };
};

const HIDE_PAGE = `header, footer, .world-content, .hud-bottom, .explore-readout, [role=dialog] { visibility: hidden !important; }
body::after { display: none !important; }`;

async function waitForWorld(page) {
  for (let i = 0; i < READY_TIMEOUT_FRAMES; i++) {
    if ((await page.getAttribute("[data-testid=world]", "data-ready")) === "true") return;
    await page.evaluate(() => window.__advance(16));
    await page.waitForTimeout(25);
  }
  throw new Error("the 3D world never became ready");
}

async function moveCameraTo(page, station, progress) {
  await page.evaluate(([id, p]) => {
    const el = document.querySelector(`main section[data-station="${id}"]`);
    if (!el) throw new Error(`no station "${id}"`);
    window.scrollTo({ top: id === "hero" ? 0 : el.offsetTop + p * el.offsetHeight - innerHeight / 2, behavior: "instant" });
  }, [station, progress]);
  for (let i = 0; i < SETTLE_FRAMES; i++) await page.evaluate((ms) => window.__advance(ms), FRAME_MS);
  // The canvas fades in with a real-time CSS transition.
  await page.waitForTimeout(1600);
}

async function toWebp(encoder, png) {
  const dataUrl = await encoder.evaluate(async ({ b64, quality }) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const canvas = Object.assign(document.createElement("canvas"), { width: img.naturalWidth, height: img.naturalHeight });
    canvas.getContext("2d").drawImage(img, 0, 0);
    return canvas.toDataURL("image/webp", quality);
  }, { b64: png.toString("base64"), quality: WEBP_QUALITY });
  if (!dataUrl.startsWith("data:image/webp")) throw new Error("this browser can't encode WebP");
  return Buffer.from(dataUrl.split(",")[1], "base64");
}

async function renderView(browser, encoder, viewName, stills) {
  const view = VIEWS[viewName];
  const context = await browser.newContext({ viewport: { width: view.width, height: view.height }, deviceScaleFactor: 1 });
  await context.addInitScript((cores) => {
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => cores });
    localStorage.setItem("rb_consent", "denied");
  }, view.cores);
  await context.addInitScript(VIRTUAL_CLOCK);
  const page = await context.newPage();
  page.on("pageerror", (e) => console.error("page error:", e.message));
  await page.goto(`${BASE}?3d=on&ab_hero=a`);
  await waitForWorld(page);
  await page.addStyleTag({ content: HIDE_PAGE });
  for (const still of stills) {
    await moveCameraTo(page, still.station, still.progress);
    const file = join(OUT_DIR, `${still.name}-${viewName}.webp`);
    writeFileSync(file, await toWebp(encoder, await page.screenshot({ type: "png", timeout: SCREENSHOT_TIMEOUT_MS })));
    console.log(`  ${file.replace(`${root}/`, "")}  (${(await page.getAttribute("[data-testid=world]", "data-tier"))} tier)`);
  }
  await context.close();
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const server = spawn(process.execPath, ["scripts/serve-out.mjs", String(PORT)], { cwd: root, stdio: "ignore" });
  const browser = await chromium.launch({ args: WEBGL_ARGS });
  try {
    await new Promise((resolve) => setTimeout(resolve, 900));
    const encoder = await browser.newPage();
    for (const viewName of Object.keys(VIEWS)) {
      await renderView(browser, encoder, viewName, STILLS.filter((s) => s.views.includes(viewName)));
    }
  } finally {
    await browser.close();
    server.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
