// Crawls the built site (served under the basePath) and fails on any broken internal link or asset.
// External URLs are skipped: CI must not flake on third-party uptime, and absolute
// canonical/OG URLs point at production, which this build hasn't been deployed to yet.
import { spawn } from "node:child_process";
import { LinkChecker } from "linkinator";

const PORT = 4174;
const ORIGIN = `http://localhost:${PORT}`;
const server = spawn(process.execPath, ["scripts/serve-out.mjs", String(PORT)], { stdio: "ignore" });

async function waitForServer(retries = 50) {
  for (let i = 0; i < retries; i++) {
    try {
      if ((await fetch(`${ORIGIN}/restoboom-site/`)).ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("static server did not start");
}

try {
  await waitForServer();
  const checker = new LinkChecker();
  const result = await checker.check({
    path: `${ORIGIN}/restoboom-site/`,
    recurse: true,
    linksToSkip: [`^(?!${ORIGIN})`],
  });
  const broken = result.links.filter((l) => l.state === "BROKEN");
  const checked = result.links.filter((l) => l.state === "OK").length;
  for (const l of broken) console.error(`BROKEN ${l.status} ${l.url}  (on ${l.parent})`);
  console.log(`Link check: ${checked} OK, ${broken.length} broken`);
  process.exitCode = broken.length ? 1 : 0;
} finally {
  server.kill();
}
