/**
 * Lighthouse CI budgets — the "top 1%" bar, enforced on every PR.
 * Runs against the production build served under the GitHub Pages basePath.
 */
const BASE = "http://localhost:4175/restoboom-site";
module.exports = {
  ci: {
    collect: {
      startServerCommand: "node scripts/serve-out.mjs 4175",
      startServerReadyPattern: "Serving out",
      url: [`${BASE}/`, `${BASE}/en/`, `${BASE}/tarifs/`, `${BASE}/diagnostic/`],
      numberOfRuns: 3,
      // devtools throttling (real slow-4G + 4x CPU) instead of "simulate": on localhost every
      // async chunk finishes before first paint, which makes the simulator bill all JS to LCP.
      settings: { chromeFlags: "--no-sandbox --headless=new", throttlingMethod: "devtools" },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 1 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.95 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.05 }],
        "total-blocking-time": ["error", { maxNumericValue: 300 }],
      },
    },
    upload: { target: "filesystem", outputDir: ".lighthouseci" },
  },
};
