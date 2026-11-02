import type { Metadata } from "next";
import { absoluteUrl, BRAND_NAME, CONTACT_EMAIL, ROUTE_PAIRS, SITE_URL } from "./site";
import type { Locale } from "./i18n";

const OG_IMAGE = { fr: "/og-fr.png", en: "/og-en.png" } as const;
const OG_SIZE = { width: 1200, height: 630 };

/** canonical + hreflang (fr-CA, en-CA, x-default → French, Quebec French primacy). */
export function pageAlternates(locale: Locale, path: string): Metadata["alternates"] {
  const pair = ROUTE_PAIRS.find((p) => p[locale] === path);
  if (!pair) throw new Error(`Unknown route for alternates: ${locale} ${path}`);
  return {
    canonical: absoluteUrl(path),
    languages: { "fr-CA": absoluteUrl(pair.fr), "en-CA": absoluteUrl(pair.en), "x-default": absoluteUrl(pair.fr) },
  };
}

/** Full per-page metadata: title, description, alternates, Open Graph, Twitter. */
export function pageMetadata(opts: { locale: Locale; path: string; title: string; description: string; absoluteTitle?: boolean }): Metadata {
  const image = { url: absoluteUrl(OG_IMAGE[opts.locale]), ...OG_SIZE, alt: opts.title };
  return {
    title: opts.absoluteTitle ? { absolute: opts.title } : opts.title,
    description: opts.description,
    alternates: pageAlternates(opts.locale, opts.path),
    openGraph: {
      type: "website",
      siteName: BRAND_NAME,
      locale: opts.locale === "fr" ? "fr_CA" : "en_CA",
      alternateLocale: opts.locale === "fr" ? ["en_CA"] : ["fr_CA"],
      url: absoluteUrl(opts.path),
      title: opts.title,
      description: opts.description,
      images: [image],
    },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description, images: [image.url] },
  };
}

type JsonLd = Record<string, unknown>;

export function organizationJsonLd(locale: Locale): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: BRAND_NAME,
    url: absoluteUrl(locale === "fr" ? "/" : "/en/"),
    logo: absoluteUrl("/icon-512.png"),
    email: CONTACT_EMAIL,
    areaServed: { "@type": "AdministrativeArea", name: "Québec, Canada" },
    knowsLanguage: ["fr-CA", "en-CA"],
  };
}

export type PriceTier = { name: string; monthlyCad: number; setupCad: number; description: string };

export function softwareJsonLd(locale: Locale, description: string, tiers: readonly PriceTier[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: BRAND_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
    description,
    publisher: { "@id": `${SITE_URL}/#organization` },
    offers: tiers.map((t) => ({
      "@type": "Offer",
      name: t.name,
      description: t.description,
      price: t.monthlyCad,
      priceCurrency: "CAD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: t.monthlyCad,
        priceCurrency: "CAD",
        unitCode: "MON",
        valueAddedTaxIncluded: false,
      },
    })),
  };
}

export function faqJsonLd(items: readonly { q: string; a: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
}

/** JSON for a <script type="application/ld+json">: escape "<" so content can never close the tag. */
export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
