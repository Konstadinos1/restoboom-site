// Serves out/ under the GitHub Pages basePath, with the custom 404 — mirrors production
// closely enough for Playwright, Lighthouse CI and link checking.
// Usage: node scripts/serve-out.mjs [port]
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

// SERVE_ROOT lets us serve another build (e.g. the live gh-pages branch, for before/after comparisons).
const ROOT = process.env.SERVE_ROOT || join(fileURLToPath(new URL(".", import.meta.url)), "..", "out");
const BASE = "/restoboom-site";
const PORT = Number(process.argv[2] || process.env.PORT || 4173);
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml",
  ".png": "image/png", ".woff2": "font/woff2", ".json": "application/json", ".webmanifest": "application/manifest+json",
  ".xml": "application/xml", ".txt": "text/plain; charset=utf-8",
};

async function resolveFile(urlPath) {
  const rel = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, "");
  const candidate = join(ROOT, rel);
  if (!candidate.startsWith(ROOT)) return null;
  try {
    const s = await stat(candidate);
    if (s.isDirectory()) return (await stat(join(candidate, "index.html")).catch(() => null)) ? join(candidate, "index.html") : null;
    return candidate;
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://localhost");
  if (url.pathname === "/") {
    res.writeHead(302, { location: `${BASE}/` }).end();
    return;
  }
  const file = url.pathname.startsWith(BASE) ? await resolveFile(url.pathname.slice(BASE.length) || "/") : null;
  if (!file) {
    res.writeHead(404, { "content-type": TYPES[".html"] }).end(await readFile(join(ROOT, "404.html")));
    return;
  }
  const cache = file.includes(`${join("_next", "static")}`) ? "public, max-age=31536000, immutable" : "public, max-age=600";
  const type = TYPES[extname(file)] || "application/octet-stream";
  const body = await readFile(file);
  // GitHub Pages gzips text responses; mirror it so Lighthouse measures realistic transfer sizes.
  const compressible = /text|javascript|json|xml|svg|manifest/.test(type);
  if (compressible && /\bgzip\b/.test(String(req.headers["accept-encoding"] || ""))) {
    res.writeHead(200, { "content-type": type, "cache-control": cache, "content-encoding": "gzip", vary: "accept-encoding" }).end(gzipSync(body));
    return;
  }
  res.writeHead(200, { "content-type": type, "cache-control": cache }).end(body);
}).listen(PORT, () => console.log(`Serving out/ at http://localhost:${PORT}${BASE}/`));
