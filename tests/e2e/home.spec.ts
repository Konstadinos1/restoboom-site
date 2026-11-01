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

  test("WebGL hero mounts on desktop @desktop-only", async ({ page }) => {
    // The capability gate needs >= 4 cores; pin it so the test doesn't depend on the CI runner size.
    await page.addInitScript(() => Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 8 }));
    await page.goto("./");
    await expect(page.getByTestId("hero-canvas")).toHaveAttribute("data-ready", "true", { timeout: 15_000 });
  });

  test("reduced motion keeps the static hero (no WebGL)", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("http://localhost:4173/restoboom-site/");
    await page.waitForTimeout(3500);
    await expect(page.getByTestId("hero-canvas")).toHaveAttribute("data-ready", "false");
    await ctx.close();
  });
});

test("mobile keeps the static hero fallback", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile");
  await page.goto("./");
  await page.waitForTimeout(3500);
  await expect(page.getByTestId("hero-canvas")).toHaveAttribute("data-ready", "false");
});

test("unknown routes get the branded 404", async ({ page }) => {
  const res = await page.goto("does-not-exist/");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Cette page a changé d'adresse." })).toBeVisible();
  await page.getByRole("link", { name: "Retour à l'accueil" }).click();
  await expect(page.locator("h1")).toHaveCount(1);
});
