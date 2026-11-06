// Renders brand PNGs (OG cards, app icons) from HTML with Playwright. The OG cards sit on the rendered
// still of the 3D bistro (npm run stills) with the site's own dot-matrix wordmark.
// Usage: node scripts/generate-images.mjs   (outputs into public/; needs Node 22.18+ for the .ts imports)
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { dotsPath, layoutDots } from "../lib/world/dotMatrix.ts";
import { STILLS } from "../lib/world/stills.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const font = (f) => readFileSync(join(root, "app/fonts", f)).toString("base64");
const favicon = readFileSync(join(root, "public/favicon.svg"), "utf8");
const still = `data:image/webp;base64,${readFileSync(join(root, "public", STILLS.home.src)).toString("base64")}`;
const plex = (weight) => `src:url(data:font/woff2;base64,${font(`ibm-plex-mono-latin-${weight}.woff2`)}) format("woff2");font-weight:${weight}`;
const FONT_CSS = `
@font-face{font-family:M;${plex(400)}}
@font-face{font-family:M;${plex(500)}}`;

const DOT = 2 / 3;
const logo = layoutDots("RESTOBOOM.");
const WORDMARK = `<svg class="logo" viewBox="0 0 ${logo.cols} ${logo.rows}" shape-rendering="crispEdges"><path d="${dotsPath(logo.dots.filter((d) => d.char !== "."), DOT, 0)}" fill="#2c3045"/><path d="${dotsPath(logo.dots.filter((d) => d.char === "."), DOT, 0)}" fill="#b5401b"/></svg>`;

const OG = {
  fr: { kicker: "Pour les restaurants du Québec", h: "Le resto qui répond à tout.", sub: "Appel manqué&nbsp;? Texto en 15&nbsp;secondes.", meta: "Hébergé au Canada · LCAP + Loi 25 · CAD" },
  en: { kicker: "For Québec restaurants", h: "The restaurant that answers everything.", sub: "Missed call? Texted back in 15&nbsp;seconds.", meta: "Hosted in Canada · CASL + Law 25 · CAD" },
};

const ogHtml = (t) => `<!doctype html><html><head><style>${FONT_CSS}
*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;background:#e4e9ef url(${still}) ${STILLS.home.focus}/cover no-repeat;color:#2c3045;font-family:M;position:relative;overflow:hidden}
.veil{position:absolute;inset:0;background:linear-gradient(90deg,rgb(228 233 239/.96) 0%,rgb(228 233 239/.86) 40%,rgb(228 233 239/0) 66%)}
.logo{position:absolute;left:72px;top:60px;height:30px;width:auto}
.c{position:absolute;left:72px;top:150px;width:640px}
.k{font-size:19px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:#39405a}.k:before{content:"////// ";color:#b5401b}
h1{margin-top:26px;font-size:68px;line-height:1.02;letter-spacing:-.05em;font-weight:500}
p{margin-top:26px;font-size:30px;font-weight:500;color:#a8391a}
.m{position:absolute;left:72px;bottom:56px;padding:6px 10px;font-size:16px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;background:#2c3045;color:#fff}
</style></head><body><div class="veil"></div>${WORDMARK}
<div class="c"><div class="k">${t.kicker}</div><h1>${t.h}</h1><p>${t.sub}</p></div>
<div class="m">${t.meta}</div></body></html>`;

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
