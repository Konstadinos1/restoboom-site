// Writes public/404.html: GitHub Pages serves it for any missing URL, so it is plain static HTML
// (no Next.js) with absolute production paths. The dot-matrix wordmark and "404" come from the
// site's own glyphs and the backdrop from the rendered stills, so they stay in step with the site
// (tests/unit/not-found-page.test.ts checks that). `npm run build` copies it into out/.
// Usage: npm run not-found   (needs Node 22.18+, which runs the TypeScript modules it imports)
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PRODUCTION_BASE_PATH } from "../lib/basePath.mjs";
import { dotsPath, layoutDots } from "../lib/world/dotMatrix.ts";
import { PHONE_MEDIA, STILLS } from "../lib/world/stills.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const at = (path) => `${PRODUCTION_BASE_PATH}${path}`;
const DOT = 2 / 3;

function dotMatrixSvg(text, { className, accentChar }) {
  const { dots, cols, rows } = layoutDots(text);
  const main = dotsPath(dots.filter((d) => d.char !== accentChar), DOT, 0);
  const accent = accentChar ? dotsPath(dots.filter((d) => d.char === accentChar), DOT, 0) : "";
  const accentPath = accent ? `<path d="${accent}" fill="#b5401b"/>` : "";
  return `<svg class="${className}" viewBox="0 0 ${cols} ${rows}" shape-rendering="crispEdges" aria-hidden="true"><path d="${main}" fill="currentColor"/>${accentPath}</svg>`;
}

const lost = STILLS.lost;
const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const css = `
@font-face{font-family:Plex;src:url(${at("/fonts/ibm-plex-mono-latin-400.woff2")}) format("woff2");font-weight:400;font-display:swap}
@font-face{font-family:Plex;src:url(${at("/fonts/ibm-plex-mono-latin-500.woff2")}) format("woff2");font-weight:500;font-display:swap}
:root{--bg:#e4e9ef;--ink:#1f2232;--slate:#2c3045;--frost:#39405a;--muted:#4b5466;--accent:#b5401b;--accent-deep:#8f3014}
*{box-sizing:border-box}html,body{margin:0}
body{min-height:100vh;background:var(--bg);color:var(--ink);font:15px/1.6 Plex,ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;-webkit-font-smoothing:antialiased}
body::after{content:"";position:fixed;inset:0;z-index:3;pointer-events:none;opacity:.045;background-image:${GRAIN}}
.backdrop{position:fixed;inset:0;z-index:0}
.backdrop picture,.backdrop img{display:block;width:100%;height:100%}
.backdrop img{object-fit:cover;object-position:${lost.focus}}
.backdrop::after{content:"";position:absolute;inset:0;background:linear-gradient(270deg,rgb(228 233 239/.95) 0%,rgb(228 233 239/.82) 42%,rgb(228 233 239/0) 72%)}
.hud{position:relative;z-index:2;display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;padding:1rem 2.5rem;background:linear-gradient(180deg,rgb(228 233 239/.96),rgb(228 233 239/0))}
.logo{display:block;color:var(--slate)}.logo svg{display:block;height:21px;width:auto}
.label{display:inline-block;padding:.2rem .45rem;font-size:.66rem;font-weight:500;line-height:1.2;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;background:var(--slate);color:#fff}
main{position:relative;z-index:1;display:flex;align-items:center;justify-content:flex-end;min-height:calc(100vh - 5rem);padding:2rem 2.5rem 4rem}
.panel{width:min(100%,36rem)}
.digits{display:block;width:10.5rem;height:auto;color:var(--accent)}
.kicker{margin:1.6rem 0 0;font-size:.72rem;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:var(--frost)}
.kicker::before{content:"////// ";color:var(--accent)}
h1{margin:1rem 0 0;font-size:clamp(1.9rem,4.2vw,3.2rem);line-height:1.04;letter-spacing:-.05em;font-weight:500;color:var(--slate);text-wrap:balance}
.lede{margin:1.2rem 0 0;color:var(--muted)}
.row{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:2rem}
.btn{display:inline-flex;align-items:center;gap:.6rem;padding:.85rem 1.3rem;font-size:.82rem;font-weight:500;letter-spacing:.06em;line-height:1.2;text-transform:uppercase;text-decoration:none;transition:background-color .25s,color .25s}
.primary{background:var(--accent);color:#fff;box-shadow:0 10px 34px -12px rgb(255 106 61/.75)}.primary:hover{background:var(--accent-deep)}
.ghost{border:1px solid var(--slate);color:var(--slate);background:rgb(255 255 255/.55)}.ghost:hover{background:var(--slate);color:#fff}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
@media ${PHONE_MEDIA}{
.hud{padding:1rem}.logo svg{height:14px}
.backdrop{position:absolute;top:3rem;bottom:auto;height:56svh;-webkit-mask-image:linear-gradient(180deg,#000 60%,transparent);mask-image:linear-gradient(180deg,#000 60%,transparent)}
.backdrop img{object-position:${lost.phone ? lost.phone.focus : lost.phoneFocus}}
.backdrop::after{background:linear-gradient(180deg,rgb(228 233 239/0) 40%,rgb(228 233 239/.9) 80%)}
main{display:block;min-height:0;padding:36svh 1rem 3rem}
}`;

const phoneSource = lost.phone ? `<source media="${PHONE_MEDIA}" srcset="${at(lost.phone.src)}" width="${lost.phone.width}" height="${lost.phone.height}">` : "";

const html = `<!doctype html>
<html lang="fr-CA">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <meta name="theme-color" content="#e4e9ef" />
    <title>Page introuvable — RestoBoom</title>
    <link rel="icon" href="${at("/favicon.svg")}" type="image/svg+xml" />
    <style>${css}
    </style>
  </head>
  <body>
    <header class="hud">
      <a class="logo" href="${at("/")}" aria-label="RestoBoom — accueil">${dotMatrixSvg("RESTOBOOM.", { className: "wordmark", accentChar: "." })}</a>
      <span class="label">////// 404 — Introuvable</span>
    </header>
    <div class="backdrop" aria-hidden="true"><picture>${phoneSource}<img src="${at(lost.src)}" alt="" width="${lost.width}" height="${lost.height}" fetchpriority="high"></picture></div>
    <main>
      <div class="panel">
        ${dotMatrixSvg("404", { className: "digits" })}
        <p class="kicker">Erreur 404 · <span lang="en">Error 404</span></p>
        <h1>Cette page a changé d'adresse.</h1>
        <p class="lede">La page que vous cherchez n'existe pas (ou plus). <span lang="en">This page doesn't exist (anymore).</span></p>
        <div class="row">
          <a class="btn primary" href="${at("/")}">Retour à l'accueil <span aria-hidden="true">→</span></a>
          <a class="btn ghost" href="${at("/diagnostic/")}">Diagnostic gratuit</a>
          <a class="btn ghost" href="${at("/en/")}" lang="en">English</a>
        </div>
      </div>
    </main>
  </body>
</html>
`;

writeFileSync(join(root, "public/404.html"), html);
console.log("Wrote public/404.html");
