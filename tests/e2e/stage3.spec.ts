import AxeBuilder from "@axe-core/playwright";
import { expect, setConsent, test } from "./fixtures";

test.beforeEach(async ({ page }) => setConsent(page, "denied"));

test.describe("sound", () => {
  test("is off at load, switches on and off from the HUD, mouse or keyboard", async ({ page, captured }) => {
    await page.goto("./");
    const toggle = page.getByTestId("sound-toggle");
    await expect(toggle).toHaveText(/Son/);
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    // No audio context exists until the visitor asks for sound.
    await expect(toggle).toHaveAttribute("data-audio", "none");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(toggle).toHaveAttribute("data-audio", "running");
    await toggle.press("Enter");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(toggle).toHaveAttribute("data-audio", "suspended", { timeout: 5000 });
    expect(captured.errors).toEqual([]);
  });

  test("keeps playing while moving between pages, and starts off again after a reload", async ({ page }) => {
    await page.goto("en/");
    const toggle = page.getByTestId("sound-toggle");
    await expect(toggle).toHaveText(/Sound/);
    await toggle.click();
    await expect(toggle).toHaveAttribute("data-audio", "running");
    await page.locator("footer").getByRole("link", { name: "Pricing" }).click();
    await expect(page).toHaveURL(/\/en\/pricing\/$/);
    await expect(page.getByTestId("sound-toggle")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("sound-toggle")).toHaveAttribute("data-audio", "running");
    await page.reload();
    await expect(page.getByTestId("sound-toggle")).toHaveAttribute("aria-pressed", "false");
  });
});

test.describe("HUD cursor @desktop-only", () => {
  test("trails the mouse, opens up over links and steps aside over text fields", async ({ page }) => {
    await page.goto("diagnostic/");
    const cursor = page.getByTestId("cursor");
    await expect(cursor).toHaveAttribute("data-mode", "hidden");
    await page.mouse.move(1200, 700);
    await expect(cursor).toHaveAttribute("data-mode", "idle");
    const cta = await page.getByRole("link", { name: /Diagnostic gratuit →/ }).first().boundingBox();
    await page.mouse.move(cta!.x + cta!.width / 2, cta!.y + cta!.height / 2);
    await expect(cursor).toHaveAttribute("data-mode", "link");
    const field = await page.locator("#df-name").boundingBox();
    await page.mouse.move(field!.x + 40, field!.y + field!.height / 2);
    await expect(cursor).toHaveAttribute("data-mode", "hidden");
  });

  test("isn't drawn for visitors who prefer reduced motion", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("http://localhost:4173/restoboom-site/");
    await page.mouse.move(600, 400);
    await page.waitForTimeout(500);
    await expect(page.getByTestId("cursor")).toHaveCount(0);
    await ctx.close();
  });
});

test("touch screens get no reticle", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile");
  await page.goto("./");
  await page.waitForTimeout(500);
  await expect(page.getByTestId("cursor")).toHaveCount(0);
});

test("without the live 3D, the home shows the rendered still of the bistro", async ({ page, request }, info) => {
  await page.goto("./");
  await expect(page.getByTestId("world")).toHaveAttribute("data-tier", "static");
  const still = page.getByTestId("world-still");
  const expected = info.project.name === "mobile" ? "home-portrait.webp" : "home-landscape.webp";
  await expect(still).toHaveCSS("background-image", new RegExp(expected));
  const url = (await still.evaluate((el) => getComputedStyle(el).backgroundImage)).replace(/^url\("?|"?\)$/g, "");
  expect((await request.get(url)).status()).toBe(200);
});

for (const path of ["tarifs/", "diagnostic/", "confidentialite/", "conditions/", "en/pricing/", "en/diagnostic/", "en/privacy/", "en/terms/"]) {
  test(`/${path} has its world still behind the title`, async ({ page }) => {
    await page.goto(path);
    const backdrop = page.getByTestId("page-backdrop");
    await expect(backdrop).toHaveAttribute("aria-hidden", "true");
    const img = backdrop.locator("img");
    await expect(img).toHaveAttribute("alt", "");
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
    expect(await img.evaluate((el: HTMLImageElement) => new URL(el.currentSrc).pathname)).toMatch(/^\/restoboom-site\/world\/[a-z]+-(landscape|portrait)\.webp$/);
    // The title is never covered by the backdrop.
    await expect(page.locator("h1")).toBeVisible();
  });
}

test("phones get the upright bistro on the diagnostic page", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile");
  await page.goto("diagnostic/");
  const img = page.getByTestId("page-backdrop").locator("img");
  await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.currentSrc)).toMatch(/home-portrait\.webp$/);
});

test("the 404 page loads its still and fonts and has no serious accessibility issues", async ({ page }) => {
  const failed: string[] = [];
  page.on("response", (r) => r.status() >= 400 && !r.url().includes("does-not-exist") && failed.push(r.url()));
  await page.goto("does-not-exist/");
  await expect(page.locator("svg.digits")).toBeVisible();
  await expect.poll(() => page.locator(".backdrop img").evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => document.fonts.check('500 16px "Plex"'))).toBe(true);
  expect(failed).toEqual([]);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(results.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([]);
});

test("platform cubes open on click, show their module and close with Escape @desktop-only", async ({ page, captured }) => {
  test.setTimeout(150_000);
  await page.addInitScript(() => Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 6 }));
  await page.goto("./?3d=on&ab_hero=a");
  await expect(page.getByTestId("world")).toHaveAttribute("data-ready", "true", { timeout: 60_000 });
  await page.evaluate(() => {
    const el = document.querySelector<HTMLElement>('main section[data-station="platform"]')!;
    window.scrollTo({ top: el.offsetTop + 0.05 * el.offsetHeight - innerHeight / 2, behavior: "instant" });
  });
  await expect(page.locator("html")).toHaveAttribute("data-active-station", "platform");
  // The cubes float and turn: sweep the pointer over where they sit until one is under it.
  const spots = [780, 860, 940, 1020].flatMap((x) => [340, 420, 500, 580].map((y) => ({ x, y })));
  const found: { spot: { x: number; y: number } | null } = { spot: null };
  await expect(async () => {
    for (const spot of spots) {
      await page.mouse.move(spot.x, spot.y);
      await page.waitForTimeout(350);
      if ((await page.locator("html").getAttribute("data-cursor")) === "explore") {
        found.spot = spot;
        return;
      }
    }
    throw new Error("no cube under the pointer yet");
  }).toPass({ timeout: 60_000 });
  await page.mouse.click(found.spot!.x, found.spot!.y);
  const readout = page.getByTestId("explore-readout");
  await expect(readout).toBeVisible();
  await expect(readout).toContainText(/MODULE_0[1-4]/);
  await expect(page.locator(".module-card.is-explored")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(readout).toHaveCount(0);
  await expect(page.locator(".module-card.is-explored")).toHaveCount(0);
  expect(captured.errors).toEqual([]);
});
