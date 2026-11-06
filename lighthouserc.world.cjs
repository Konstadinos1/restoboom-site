/**
 * Loading budget for the 3D world itself. Lighthouse machines have no GPU, so the
 * main run (lighthouserc.cjs) measures the still fallback that GPU-less visitors
 * get. This run forces the world on with ?3d=on to prove it never delays the
 * first paint or shifts the layout. Software WebGL keeps the main thread busy,
 * so TBT and TTI (and the performance score built on them) can't be measured
 * here: judge those on real devices, not in CI.
 */
const BASE = "http://localhost:4176/restoboom-site";
module.exports = {
  ci: {
    collect: {
      startServerCommand: "node scripts/serve-out.mjs 4176",
      startServerReadyPattern: "Serving out",
      url: [`${BASE}/?3d=on`, `${BASE}/en/?3d=on`],
      numberOfRuns: 1,
      settings: { chromeFlags: "--no-sandbox --headless=new", throttlingMethod: "devtools", onlyCategories: ["performance", "accessibility"] },
    },
    assert: {
      assertions: {
        "first-contentful-paint": ["error", { maxNumericValue: 2000 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.05 }],
        "categories:accessibility": ["error", { minScore: 1 }],
      },
    },
    upload: { target: "filesystem", outputDir: ".lighthouseci-world" },
  },
};
