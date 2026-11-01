import { describe, expect, it } from "vitest";
import { faqJsonLd, pageAlternates, pageMetadata, serializeJsonLd, softwareJsonLd } from "@/lib/seo";
import { PRICE_TIERS } from "@/lib/content";
import sitemap from "@/app/sitemap";
import { ROUTE_PAIRS } from "@/lib/site";

const BASE = "https://konstadinos1.github.io/restoboom-site";

describe("pageAlternates", () => {
  it("emits canonical, fr-CA, en-CA and x-default (French) with the basePath", () => {
    expect(pageAlternates("en", "/en/pricing/")).toEqual({
      canonical: `${BASE}/en/pricing/`,
      languages: { "fr-CA": `${BASE}/tarifs/`, "en-CA": `${BASE}/en/pricing/`, "x-default": `${BASE}/tarifs/` },
    });
  });

  it("throws on an unregistered route so new pages can't ship without hreflang", () => {
    expect(() => pageAlternates("fr", "/nouvelle/")).toThrow(/Unknown route/);
  });
});

describe("pageMetadata", () => {
  it("uses the locale's OG card", () => {
    const m = pageMetadata({ locale: "fr", path: "/", title: "T", description: "D" });
    const og = m.openGraph as { locale: string; images: { url: string }[] };
    expect(og.locale).toBe("fr_CA");
    expect(og.images[0].url).toBe(`${BASE}/og-fr.png`);
  });
});

describe("JSON-LD", () => {
  it("prices offers in CAD, tax excluded (GST/QST extra)", () => {
    const ld = softwareJsonLd("fr", "desc", PRICE_TIERS) as { offers: { price: number; priceCurrency: string; priceSpecification: { valueAddedTaxIncluded: boolean } }[] };
    expect(ld.offers.map((o) => o.price)).toEqual([149, 449, 1299]);
    expect(ld.offers.every((o) => o.priceCurrency === "CAD" && o.priceSpecification.valueAddedTaxIncluded === false)).toBe(true);
  });

  it("escapes < so a payload can never close the script tag", () => {
    const out = serializeJsonLd(faqJsonLd([{ q: "</script><script>alert(1)</script>", a: "x" }]));
    expect(out).not.toContain("</script>");
    expect(out).toContain("\\u003c/script>");
  });
});

describe("sitemap", () => {
  it("lists every page in both locales with alternates", () => {
    const entries = sitemap();
    expect(entries).toHaveLength(ROUTE_PAIRS.length * 2);
    expect(entries.every((e) => e.url.startsWith(`${BASE}/`) && e.alternates?.languages)).toBe(true);
  });
});

describe("organizationJsonLd + assetPath", () => {
  it("points the organization at the locale home and the basePath logo", async () => {
    const { organizationJsonLd } = await import("@/lib/seo");
    const { assetPath } = await import("@/lib/site");
    const org = organizationJsonLd("en") as { url: string; logo: string; knowsLanguage: string[] };
    expect(org.url).toBe(`${BASE}/en/`);
    expect(org.logo).toBe(`${BASE}/icon-512.png`);
    expect(org.knowsLanguage).toEqual(["fr-CA", "en-CA"]);
    expect(assetPath("favicon.svg")).toBe("/restoboom-site/favicon.svg");
  });
});
