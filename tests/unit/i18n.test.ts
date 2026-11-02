import { describe, expect, it } from "vitest";
import { homeAnchor, langSwitchHref } from "@/lib/i18n";

describe("langSwitchHref", () => {
  it.each([
    ["/", "/en/"],
    ["/tarifs", "/en/pricing/"],
    ["/tarifs/", "/en/pricing/"],
    ["/confidentialite/", "/en/privacy/"],
  ])("maps french path %s to its english counterpart %s", (fr, en) => {
    expect(langSwitchHref({ locale: "fr", path: fr })).toBe(en);
  });

  it.each([
    ["/en", "/"],
    ["/en/", "/"],
    ["/en/pricing", "/tarifs/"],
    ["/en/terms/", "/conditions/"],
  ])("maps english path %s back to french %s", (en, fr) => {
    expect(langSwitchHref({ locale: "en", path: en })).toBe(fr);
  });

  it("falls back to the other locale's home for unknown paths", () => {
    expect(langSwitchHref({ locale: "fr", path: "/inconnu" })).toBe("/en/");
    expect(langSwitchHref({ locale: "en", path: "/en/unknown" })).toBe("/");
  });

  it("treats an empty path as the home page", () => {
    expect(langSwitchHref({ locale: "fr", path: "" })).toBe("/en/");
  });
});

describe("homeAnchor", () => {
  it("keeps english visitors on the english home page (regression: used to jump to FR)", () => {
    expect(homeAnchor("en", "plateforme")).toBe("/en/#plateforme");
    expect(homeAnchor("fr", "conformite")).toBe("/#conformite");
  });
});
