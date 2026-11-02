import { expect, isLeadRequest, setConsent, test } from "./fixtures";

test.beforeEach(async ({ page }) => setConsent(page, "denied"));

test("empty submit shows per-field errors, focuses the first one, sends nothing", async ({ page, captured }) => {
  await page.goto("diagnostic/");
  await page.getByTestId("lead-submit").click();
  await expect(page.locator("form [role=alert]")).toHaveText("Corrigez les champs indiqués.");
  for (const id of ["df-name", "df-email", "df-restaurant"]) await expect(page.locator(`#${id}`)).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#df-consent-err")).toHaveText("Votre accord est requis pour qu'on vous réponde.");
  await expect(page.locator("#df-name")).toBeFocused();
  expect(captured.leads).toHaveLength(0);
});

test("after a failed submit from the bottom of the page, the focused field AND the error summary are visible below the header", async ({ page }) => {
  await page.goto("diagnostic/");
  // Like a real user: scroll down to the button, so the first invalid field starts above the viewport.
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await page.getByTestId("lead-submit").click();
  await expect(page.locator("#df-name")).toBeFocused();
  await page.waitForTimeout(900); // smooth scroll settles
  const header = await page.locator("header").boundingBox();
  const headerBottom = header!.y + header!.height;
  const field = await page.locator("#df-name").boundingBox();
  const summary = await page.locator("form [role=alert]").boundingBox();
  expect(field!.y, "focused field clear of the fixed header (WCAG 2.4.11)").toBeGreaterThanOrEqual(headerBottom);
  expect(summary!.y, "error summary visible, not scrolled away under the header").toBeGreaterThanOrEqual(headerBottom);
});

test("invalid phone and URL get specific messages", async ({ page }) => {
  await page.goto("en/diagnostic/");
  await page.fill("#df-name", "Julie Tremblay");
  await page.fill("#df-email", "julie@resto.ca");
  await page.fill("#df-restaurant", "Corner Resto");
  await page.fill("#df-phone", "555-01");
  await page.fill("#df-website_url", "resto dot ca");
  await page.check("#df-consent");
  await page.getByTestId("lead-submit").click();
  await expect(page.locator("#df-phone-err")).toHaveText("10-digit number, e.g. (514) 555-0123.");
  await expect(page.locator("#df-website_url-err")).toHaveText("Full web address, e.g. https://yourresto.ca");
});

test("happy path: lead posts normalized data with attribution and shows success", async ({ page, captured }) => {
  await page.goto("./?utm_source=google&utm_medium=cpc&utm_campaign=laval-fall&ab_hero=b");
  await page.getByRole("link", { name: /Obtenir mon diagnostic gratuit/ }).first().click();
  await expect(page).toHaveURL(/\/diagnostic\/$/);
  await page.fill("#df-name", "Julie Tremblay");
  await page.fill("#df-email", "Julie@Resto-Du-Coin.ca");
  await page.fill("#df-restaurant", "Resto du Coin");
  await page.fill("#df-phone", "(450) 555-0199");
  await page.selectOption("#df-locations", "2-5");
  await page.fill("#df-website_url", "https://resto-du-coin.ca");
  await page.check("#df-consent");
  await Promise.all([page.waitForRequest((r) => r.url().includes("lead.e2e.invalid") && r.method() === "POST"), page.getByTestId("lead-submit").click()]);
  await expect(page.getByTestId("lead-success")).toContainText("Merci, c'est reçu.");
  expect(captured.leads).toHaveLength(1);
  expect(captured.leads[0]).toMatchObject({
    email: "julie@resto-du-coin.ca",
    phone: "+14505550199",
    locations: "2-5",
    locale: "fr",
    consent: true,
    utm_source: "google",
    utm_campaign: "laval-fall",
    ab_variant: "b",
    source: "marketing-site",
  });
});

test.describe("server responses", () => {
  test.use({ leadStatus: { code: 429 } });
  test("rate-limited submit explains and offers email", async ({ page, captured }) => {
    await page.goto("diagnostic/");
    await page.fill("#df-name", "Julie");
    await page.fill("#df-email", "julie@resto.ca");
    await page.fill("#df-restaurant", "Resto");
    await page.check("#df-consent");
    await page.getByTestId("lead-submit").click();
    await expect(page.getByTestId("lead-status")).toContainText("Trop de demandes");
    await expect(page.getByTestId("lead-status").getByRole("link")).toHaveAttribute("href", /^mailto:bonjour@restoboom\.ca/);
    expect(captured.leads).toHaveLength(1);
  });
});

test.describe("server error", () => {
  test.use({ leadStatus: { code: 500 } });
  test("5xx keeps the form filled and shows the fallback", async ({ page, captured }) => {
    await page.goto("en/diagnostic/");
    await page.fill("#df-name", "Julie");
    await page.fill("#df-email", "julie@resto.ca");
    await page.fill("#df-restaurant", "Resto");
    await page.check("#df-consent");
    await page.getByTestId("lead-submit").click();
    await expect(page.getByTestId("lead-status")).toContainText("Something went wrong");
    await expect(page.locator("#df-name")).toHaveValue("Julie");
    expect(captured.leads).toHaveLength(1);
  });
});

test("honeypot: bots see success but nothing is sent", async ({ page, captured }) => {
  await page.goto("diagnostic/");
  let sent = false;
  page.on("request", (r) => (sent ||= isLeadRequest(r)));
  await page.fill("#df-name", "Bot");
  await page.fill("#df-email", "bot@spam.example");
  await page.fill("#df-restaurant", "Spam");
  await page.check("#df-consent");
  await page.locator("#df-hp").fill("http://spam.example", { force: true });
  await page.getByTestId("lead-submit").click();
  await expect(page.getByTestId("lead-success")).toBeVisible();
  expect(sent).toBe(false);
  expect(captured.leads).toHaveLength(0);
});
