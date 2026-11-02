import { expect, setConsent, test } from "./fixtures";

test.beforeEach(async ({ page }) => setConsent(page, "denied"));

test("english nav anchors stay on the english page (regression) @desktop-only", async ({ page }) => {
  await page.goto("en/pricing/");
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Platform" }).click();
  await expect(page).toHaveURL(/\/restoboom-site\/en\/#plateforme$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en-CA");
});

test("language toggle maps each page to its counterpart", async ({ page }) => {
  const pairs: [string, RegExp][] = [
    ["tarifs/", /\/en\/pricing\/$/],
    ["diagnostic/", /\/en\/diagnostic\/$/],
    ["confidentialite/", /\/en\/privacy\/$/],
  ];
  for (const [fr, en] of pairs) {
    await page.goto(fr);
    await page.getByRole("link", { name: "Switch to English" }).first().click();
    await expect(page).toHaveURL(en);
    await page.getByRole("link", { name: "Passer au français" }).first().click();
    await expect(page).toHaveURL(new RegExp(`/restoboom-site/${fr}$`));
  }
});

test("HUD label follows the section on screen @desktop-only", async ({ page }) => {
  await page.goto("./");
  const label = page.getByTestId("station-label");
  await expect(label).toHaveText("////// 01 — Accueil");
  await page.locator("#plateforme").evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: "instant" }));
  await expect(label).toHaveText("////// 04 — Plateforme");
  await expect(page.locator("html")).toHaveAttribute("data-active-station", "platform");
});

test("mobile menu opens, navigates and closes with Escape", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile");
  await page.goto("./");
  const button = page.getByRole("button", { name: "Menu" });
  await button.click();
  await expect(page.getByRole("button", { name: "Fermer" })).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(page.locator("#mobile-nav")).toHaveCount(0);
  await button.click();
  await page.locator("#mobile-nav").getByRole("link", { name: "Tarifs" }).click();
  await expect(page).toHaveURL(/\/tarifs\/$/);
  await expect(page.locator("#mobile-nav")).toHaveCount(0);
});

test("skip link moves focus to main content", async ({ page }) => {
  await page.goto("./");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Aller au contenu" });
  await expect(skip).toBeFocused();
  await skip.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("FAQ items expand and collapse", async ({ page }) => {
  await page.goto("./");
  const q = page.getByText("Mon numéro de téléphone change-t-il ?");
  await q.scrollIntoViewIfNeeded();
  await q.click();
  await expect(page.getByText("Non. Votre numéro reste le même.")).toBeVisible();
  await q.click();
  await expect(page.getByText("Non. Votre numéro reste le même.")).toBeHidden();
});
