import Link from "next/link";
import type { Locale } from "@/lib/i18n";

const TIERS = [
  {
    id: "solo",
    price: { fr: "149 $/mois", en: "$149/mo" },
    setup: { fr: "installation 499 $", en: "setup $499" },
    scope: { fr: "Une adresse", en: "One location" },
  },
  {
    id: "multi",
    price: { fr: "449 $/mois", en: "$449/mo" },
    setup: { fr: "installation 1 499 $", en: "setup $1,499" },
    scope: { fr: "Jusqu'à 5 adresses", en: "Up to 5 locations" },
  },
  {
    id: "franchise",
    price: { fr: "1 299 $/mois", en: "$1,299/mo" },
    setup: { fr: "installation 4 999 $", en: "setup $4,999" },
    scope: { fr: "Votre réseau, votre marque", en: "Your network, your brand" },
  },
] as const;

const INCLUDED = {
  fr: [
    "Réception 5 canaux, une boîte par adresse",
    "Réponse aux appels manqués en 15 s",
    "Réception automatisée jour et nuit, qui se présente comme automatisée",
    "Demande d'avis après commande, sans filtrage",
    "Réponses suggérées, vous approuvez",
    "Relances avec heures de paix 21 h – 9 h",
    "Fiches clients alimentées par la caisse, importation CSV",
    "Données au Canada, droits Loi 25 intégrés",
  ],
  en: [
    "5-channel inbox, one per location",
    "Missed-call reply in 15 s",
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
    includedTitle: "Inclus dans les trois tarifs",
    cta: "Parler à un humain",
    ctaHref: "/diagnostic",
    fine: "Facturation mensuelle en CAD. TPS et TVQ en sus. Frais d'installation ponctuels. Textos inclus par palier ; surplus facturés au segment.",
  },
  en: {
    includedTitle: "Included in all plans",
    cta: "Talk to a human",
    ctaHref: "/en/diagnostic",
    fine: "Billed monthly in CAD. GST and QST extra. One-time setup fees. SMS included by tier; overage billed per segment.",
  },
} as const;

export default function PricingTable({ locale, variant }: { locale: Locale; variant: "compact" | "full" }) {
  const t = T[locale];
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3">
        {TIERS.map((tier) => (
          <div key={tier.id} className="rounded border border-line bg-panel p-6">
            <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-accent">{tier.id}</h3>
            <p className="mt-3 text-3xl font-bold tracking-tight">{tier.price[locale]}</p>
            <p className="mt-1 text-sm text-muted">{tier.setup[locale]}</p>
            <p className="mt-4 border-t border-line pt-4 text-muted">{tier.scope[locale]}</p>
            <Link
              href={t.ctaHref}
              className="mt-5 inline-block rounded border border-accent px-4 py-2 font-semibold text-accent hover:bg-accent hover:text-bg"
            >
              {t.cta}
            </Link>
          </div>
        ))}
      </div>
      {variant === "full" && (
        <div className="mt-10">
          <h3 className="kicker">{t.includedTitle}</h3>
          <ul className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {INCLUDED[locale].map((item) => (
              <li key={item} className="flex gap-3 text-muted">
                <span aria-hidden="true" className="text-accent">
                  ·
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-8 text-sm text-muted">{t.fine}</p>
    </div>
  );
}
