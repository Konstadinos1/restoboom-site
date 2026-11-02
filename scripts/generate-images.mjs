// Renders brand PNGs (OG cards, app icons) from HTML with the preinstalled Playwright.
// Usage: node scripts/generate-images.mjs   (outputs into public/)
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const font = (f) => readFileSync(join(root, "app/fonts", f)).toString("base64");
const favicon = readFileSync(join(root, "public/favicon.svg"), "utf8");
const plex = (weight) => `src:url(data:font/woff2;base64,${font(`ibm-plex-mono-latin-${weight}.woff2`)}) format("woff2");font-weight:${weight}`;
const FONT_CSS = `
@font-face{font-family:D;${plex(600)}}
@font-face{font-family:M;${plex(400)}}
@font-face{font-family:M;${plex(600)}}`;

const OG = {
  fr: { kicker: "POUR LES RESTAURANTS DU QUÉBEC", h: "Le resto qui répond à tout.", sub: "Appel manqué&nbsp;? Texto en 15 secondes.", meta: "HÉBERGÉ AU CANADA · LCAP + LOI 25 · CAD" },
  en: { kicker: "FOR QUÉBEC RESTAURANTS", h: "The restaurant that answers everything.", sub: "Missed call? Texted back in 15 seconds.", meta: "HOSTED IN CANADA · CASL + LAW 25 · CAD" },
};

const ogHtml = (t) => `<!doctype html><html><head><style>${FONT_CSS}
*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;background:#06080b;color:#e9f0f5;font-family:D;position:relative;overflow:hidden}
.glow{position:absolute;inset:0;background:radial-gradient(34% 52% at 80% 50%,rgba(255,90,54,.45),transparent 70%),radial-gradient(50% 70% at 80% 50%,rgba(93,137,168,.28),transparent 72%)}
.gem{position:absolute;right:90px;top:120px;width:300px;height:390px;filter:drop-shadow(0 0 60px rgba(255,90,54,.6))}
.c{position:absolute;left:80px;top:78px;right:420px}
.k{font-family:M;font-size:19px;letter-spacing:.2em;color:#bcd3e3;display:flex;gap:14px;align-items:center}
.k:before{content:"";width:12px;height:12px;border-radius:9px;background:#ff5a36;box-shadow:0 0 14px #ff5a36}
h1{margin-top:44px;font-size:84px;line-height:.98;letter-spacing:-.045em;font-weight:650}
p{margin-top:30px;font-size:34px;color:#ffb38a;font-weight:550}
.m{position:absolute;left:80px;bottom:62px;font-family:M;font-size:18px;letter-spacing:.18em;color:#8d9aa6}
.w{position:absolute;right:80px;bottom:58px;font-family:M;font-size:26px;font-weight:700;letter-spacing:.22em}.w b{color:#ff5a36}
</style></head><body><div class="glow"></div>
<svg class="gem" viewBox="14 9 36 46"><defs><radialGradient id="g" cx="50%" cy="55%" r="50%"><stop offset="0" stop-color="#ffb38a"/><stop offset=".55" stop-color="#ff5a36"/><stop offset="1" stop-color="#c73e1d"/></radialGradient></defs><path d="M32 9 50 25 32 55 14 25Z" fill="url(#g)"/><path d="M32 9 50 25H14Z" fill="#bcd3e3" fill-opacity=".55"/><path d="M32 9 39 25 32 55 25 25Z" fill="#fff" fill-opacity=".18"/></svg>
<div class="c"><div class="k">${t.kicker}</div><h1>${t.h}</h1><p>${t.sub}</p></div>
<div class="m">${t.meta}</div><div class="w">RESTOBOOM<b>.</b></div></body></html>`;

const iconHtml = (size) => `<!doctype html><html><head><style>*{margin:0}body{width:${size}px;height:${size}px;background:#06080b}svg{width:100%;height:100%;display:block}</style></head><body>${favicon}</body></html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  for (const [locale, t] of Object.entries(OG)) {
    await page.setViewportSize({ width: 1200, height: 630 });
    await page.setContent(ogHtml(t));
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(root, `public/og-${locale}.png`) });
  }
  for (const [name, size] of [["icon-192.png", 192], ["icon-512.png", 512], ["apple-touch-icon.png", 180]]) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(iconHtml(size));
    await page.screenshot({ path: join(root, "public", name) });
  }
  console.log("Generated OG images and icons in public/");
} finally {
  await browser.close();
}
