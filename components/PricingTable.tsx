import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { formatCad, PRICE_TIERS } from "@/lib/content";

const INCLUDED = {
  fr: [
    "Réception 5 canaux, une boîte par adresse",
    "Texto après appel manqué en 15 s",
    "Réception automatisée jour et nuit, qui se présente comme automatisée",
    "Demande d'avis après commande, sans filtrage",
    "Réponses suggérées, vous approuvez",
    "Relances avec heures de paix 21 h – 9 h",
    "Fiches clients alimentées par la caisse, importation CSV",
    "Données au Canada, droits Loi 25 intégrés",
  ],
  en: [
    "5-channel inbox, one per location",
    "Missed-call text in 15 s",
    "Automated front desk day and night, disclosed as automated",
    "Review request after every order, no gating",
    "Suggested replies, you approve",
    "Follow-ups with 9 pm – 9 am quiet hours",
    "Guest profiles fed by POS, CSV import",
    "Data in Canada, Law 25 rights built in",
  ],
} as const;

const T = {
  fr: {
    perMonth: "/mois",
    setup: "installation",
    includedTitle: "Inclus dans les trois tarifs",
    cta: "Commencer par le diagnostic",
    ctaHref: "/diagnostic/",
    popular: "Pour les groupes",
    fine: "Facturation mensuelle en CAD. TPS et TVQ en sus. Frais d'installation ponctuels. Textos inclus par palier ; surplus facturés au segment.",
  },
  en: {
    perMonth: "/mo",
    setup: "setup",
    includedTitle: "Included in all plans",
    cta: "Start with the diagnostic",
    ctaHref: "/en/diagnostic/",
    popular: "For groups",
    fine: "Billed monthly in CAD. GST and QST extra. One-time setup fees. SMS included by tier; overage billed per segment.",
  },
} as const;

type Tier = (typeof PRICE_TIERS)[number];
type HeadingTag = "h2" | "h3";

function TierCard({ tier, index, locale, Heading }: { tier: Tier; index: number; locale: Locale; Heading: HeadingTag }) {
  const t = T[locale];
  const featured = tier.id === "multi";
  return (
    <div
      data-reveal
      style={{ "--reveal-delay": index * 90 } as React.CSSProperties}
      className={`glass ticks flex flex-col p-7 ${featured ? "border-accent/50 shadow-[0_0_80px_-30px_rgb(255_90_54_/_0.55)]" : ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <Heading className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-frost">{tier.name}</Heading>
        {featured && <span className="rounded-full bg-accent/15 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-widest text-ember">{t.popular}</span>}
      </div>
      <p className="mt-6 flex items-baseline gap-1">
        <span className="text-5xl font-semibold tracking-tight">{formatCad(tier.monthlyCad, locale)}</span>
        <span className="text-muted">{t.perMonth}</span>
      </p>
      <p className="mt-2 text-sm text-muted">
        {t.setup} {formatCad(tier.setupCad, locale)}
      </p>
      <p className="mt-6 border-t border-line pt-5 text-ink">{tier.scope[locale]}</p>
      <Link href={t.ctaHref} className={`btn mt-8 justify-center ${featured ? "btn-primary" : "btn-ghost"}`} data-track="cta_click" data-track-label={`pricing_${tier.id}`}>
        {t.cta} <span className="arrow" aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

function IncludedList({ locale, Heading }: { locale: Locale; Heading: HeadingTag }) {
  return (
    <div className="glass mt-10 p-8" data-reveal>
      <Heading className="kicker">{T[locale].includedTitle}</Heading>
      <ul className="mt-6 grid gap-x-10 gap-y-3 sm:grid-cols-2">
        {INCLUDED[locale].map((item) => (
          <li key={item} className="flex gap-3 text-muted">
            <span aria-hidden="true" className="text-accent">✓</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** headingLevel keeps the outline sequential: h2 under a page h1, h3 under a section h2. */
export default function PricingTable({ locale, variant, headingLevel = "h3" }: { locale: Locale; variant: "compact" | "full"; headingLevel?: HeadingTag }) {
  return (
    <div>
      <div className="grid gap-5 md:grid-cols-3">
        {PRICE_TIERS.map((tier, i) => (
          <TierCard key={tier.id} tier={tier} index={i} locale={locale} Heading={headingLevel} />
        ))}
      </div>
      {variant === "full" && <IncludedList locale={locale} Heading={headingLevel} />}
      <p className="mt-8 text-sm text-muted">{T[locale].fine}</p>
    </div>
  );
}
