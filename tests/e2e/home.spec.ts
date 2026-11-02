import { expect, scrollThrough, setConsent, test } from "./fixtures";

test.describe("home page", () => {
  test.beforeEach(async ({ page }) => setConsent(page, "denied"));

  test("renders the french home with one h1, CTAs and no runtime errors", async ({ page, captured }) => {
    await page.goto("./");
    await expect(page).toHaveTitle(/RestoBoom/);
    await expect(page.locator("html")).toHaveAttribute("lang", "fr-CA");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("link", { name: /Obtenir mon diagnostic gratuit/ }).first()).toBeVisible();
    await scrollThrough(page);
    await expect(page.getByRole("heading", { name: "Les questions qu'on nous pose." })).toBeVisible();
    expect(captured.errors).toEqual([]);
  });

  test("A/B hero: forced variants show exactly one headline", async ({ page }) => {
    await page.goto("./?ab_hero=a");
    await expect(page.locator("h1 [data-ab-variant=a]")).toBeVisible();
    await expect(page.locator("h1 [data-ab-variant=b]")).toBeHidden();
    await page.goto("./?ab_hero=b");
    await expect(page.locator("html")).toHaveAttribute("data-ab-hero", "b");
    await expect(page.locator("h1 [data-ab-variant=b]")).toHaveText("Appel manqué ? Texto en 15 secondes.");
    await expect(page.locator("h1 [data-ab-variant=a]")).toBeHidden();
  });

  test("A/B assignment is sticky across visits", async ({ page }) => {
    await page.goto("./");
    const first = await page.locator("html").getAttribute("data-ab-hero");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-ab-hero", first!);
  });

  test("SEO head: canonical, hreflang, OG, valid JSON-LD", async ({ page }) => {
    await page.goto("en/");
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute("href", "https://konstadinos1.github.io/restoboom-site/en/");
    await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute("href", "https://konstadinos1.github.io/restoboom-site/");
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /og-en\.png$/);
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const types = blocks.flatMap((b) => [JSON.parse(b)].flat().map((x: { "@type": string }) => x["@type"]));
    expect(types).toEqual(expect.arrayContaining(["Organization", "SoftwareApplication", "FAQPage"]));
  });

  test("favicon and OG assets resolve under the basePath from nested pages", async ({ page, request }) => {
    await page.goto("en/pricing/");
    const icon = await page.locator('link[rel=icon]').getAttribute("href");
    expect((await request.get(new URL(icon!, page.url()).toString())).status()).toBe(200);
    for (const p of ["og-fr.png", "og-en.png", "sitemap.xml", "llms.txt", "manifest.webmanifest"]) {
      expect((await request.get(p)).status(), p).toBe(200);
    }
  });

  test("content stays visible without JavaScript (crawlers, no-JS)", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("http://localhost:4173/restoboom-site/");
    await expect(page.getByRole("heading", { name: "Tout ce qui répond, dans une seule boîte." })).toBeVisible();
    await ctx.close();
  });

  test("software WebGL (no GPU) keeps the still world @desktop-only", async ({ page }) => {
    // The suite runs WebGL on SwiftShader, which reports a major performance caveat like a GPU-less machine.
    await page.goto("./");
    await expect(page.getByTestId("world")).toHaveAttribute("data-tier", "static");
    await expect(page.locator("html")).toHaveAttribute("data-world", "static");
  });

  test("3D world mounts on desktop when forced with ?3d=on @desktop-only", async ({ page, captured }) => {
    // Pin the tier signals so the test doesn't depend on the CI runner size (6 cores → medium tier).
    await page.addInitScript(() => Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 6 }));
    await page.goto("./?3d=on");
    const world = page.getByTestId("world");
    await expect(world).toHaveAttribute("data-tier", "medium");
    await expect(world).toHaveAttribute("data-ready", "true", { timeout: 45_000 });
    await expect(page.locator("html")).toHaveAttribute("data-world", "ready");
    await expect(page.getByTestId("world-canvas")).toHaveCSS("opacity", "1");
    expect(captured.errors).toEqual([]);
  });

  test("reduced motion keeps the still world, even when 3D is forced", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("http://localhost:4173/restoboom-site/?3d=on");
    const world = page.getByTestId("world");
    await expect(world).toHaveAttribute("data-tier", "static");
    await page.waitForTimeout(3500);
    await expect(world).toHaveAttribute("data-ready", "false");
    await expect(page.locator("html")).toHaveAttribute("data-world", "static");
    await ctx.close();
  });
});

test("bottom HUD stays pinned to the screen and steps aside for the footer @desktop-only", async ({ page }) => {
  await page.goto("./");
  const hud = page.getByTestId("hud-bottom");
  const box = await hud.boundingBox();
  const viewport = page.viewportSize()!;
  expect(Math.abs(box!.y + box!.height - viewport.height)).toBeLessThanOrEqual(1);
  await expect(hud).not.toHaveClass(/is-hidden/);
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await expect(hud).toHaveClass(/is-hidden/);
});

test("phones skip the bottom HUD and the tagline so nothing covers the hero", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile");
  await page.goto("./");
  await expect(page.getByTestId("hud-bottom")).toBeHidden();
  await expect(page.locator("header").getByText("Fait au Québec")).toBeHidden();
  await expect(page.getByRole("link", { name: "Voir la plateforme" })).toBeVisible();
});

test("mobile gets the light 3D tier", async ({ page, captured }, info) => {
  test.skip(info.project.name !== "mobile");
  await page.goto("./?3d=on");
  const world = page.getByTestId("world");
  await expect(world).toHaveAttribute("data-tier", "low");
  await expect(world).toHaveAttribute("data-ready", "true", { timeout: 45_000 });
  expect(captured.errors).toEqual([]);
});

test("unknown routes get the branded 404", async ({ page }) => {
  const res = await page.goto("does-not-exist/");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Cette page a changé d'adresse." })).toBeVisible();
  await page.getByRole("link", { name: "Retour à l'accueil" }).click();
  await expect(page.locator("h1")).toHaveCount(1);
});
