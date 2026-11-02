/** Same budgets as CI, measured against the deployed site (see .github/workflows/site-health.yml). */
const base = require("./lighthouserc.cjs");
const LIVE = "https://konstadinos1.github.io/restoboom-site";

module.exports = {
  ci: {
    ...base.ci,
    collect: {
      url: [`${LIVE}/`, `${LIVE}/en/`, `${LIVE}/tarifs/`, `${LIVE}/diagnostic/`],
      numberOfRuns: 3,
      settings: base.ci.collect.settings,
    },
  },
};
