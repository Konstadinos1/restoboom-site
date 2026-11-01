import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT || 4173);
/** WebGL in headless CI: SwiftShader software rendering. */
const WEBGL_ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"];
const executablePath = process.env.PW_CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 45_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}/restoboom-site/`,
    trace: "retain-on-failure",
    launchOptions: { args: WEBGL_ARGS, executablePath },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, launchOptions: { args: WEBGL_ARGS, executablePath } } },
    { name: "mobile", use: { ...devices["Pixel 7"], launchOptions: { args: WEBGL_ARGS, executablePath } }, grepInvert: /@desktop-only/ },
  ],
  webServer: {
    command: `node scripts/serve-out.mjs ${PORT}`,
    url: `http://localhost:${PORT}/restoboom-site/`,
    reuseExistingServer: !process.env.CI,
  },
});
