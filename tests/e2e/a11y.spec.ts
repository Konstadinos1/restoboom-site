import AxeBuilder from "@axe-core/playwright";
import { expect, scrollThrough, setConsent, test } from "./fixtures";

const PAGES = ["", "tarifs/", "diagnostic/", "confidentialite/", "conditions/", "en/", "en/pricing/", "en/diagnostic/", "en/privacy/", "en/terms/"];

for (const path of PAGES) {
  test(`no serious accessibility violations on /${path}`, async ({ page }) => {
    await setConsent(page, "denied");
    await page.goto(path);
    await scrollThrough(page);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}

test("diagnostic form error state is accessible", async ({ page }) => {
  await setConsent(page, "denied");
  await page.goto("diagnostic/");
  await page.getByTestId("lead-submit").click();
  await expect(page.locator("form [role=alert]")).toBeVisible();
  const results = await new AxeBuilder({ page }).include("form").analyze();
  expect(results.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
});
