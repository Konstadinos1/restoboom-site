import { expect, test } from "./fixtures";

test("no events before consent; decline keeps it that way", async ({ page, captured }) => {
  await page.goto("./");
  const banner = page.getByRole("dialog", { name: "Mesure d'audience, avec votre accord." });
  await expect(banner).toBeVisible();
  await page.getByRole("link", { name: /Obtenir mon diagnostic gratuit/ }).first().hover();
  await banner.getByRole("button", { name: "Refuser" }).click();
  await expect(banner).toBeHidden();
  await page.reload();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.waitForTimeout(500);
  expect(captured.events).toHaveLength(0);
});

test("accepting sends a pageview with the experiment variant, and CTA clicks are tracked", async ({ page, captured }) => {
  await page.goto("en/?ab_hero=a&utm_source=newsletter");
  await page.getByRole("dialog").getByRole("button", { name: "Accept" }).click();
  await expect.poll(() => captured.events.map((e) => e.n)).toContain("pageview");
  const pv = captured.events.find((e) => e.n === "pageview")!;
  expect(pv).toMatchObject({ u: "http://localhost:4173/restoboom-site/en/", p: { ab_hero: "a" } });
  expect(JSON.stringify(captured.events)).not.toContain("newsletter");
  await page.getByRole("link", { name: /Get my free diagnostic/ }).first().click();
  await expect.poll(() => captured.events.filter((e) => e.n === "cta_click").length).toBeGreaterThan(0);
  expect(captured.events.find((e) => e.n === "cta_click")).toMatchObject({ p: { label: "hero_primary", ab_hero: "a" } });
});

test("consent can be changed from the footer", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("dialog").getByRole("button", { name: "Accepter" }).click();
  await page.getByRole("button", { name: "Préférences de mesure" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
