import Link from "next/link";
import { homeAnchor, type Locale } from "@/lib/i18n";
import { CONTACT_EMAIL } from "@/lib/site";
import { ConsentReopenButton } from "./ConsentBanner";

const L = {
  fr: {
    cols: [
      {
        h: "Produit",
        links: [
          { href: homeAnchor("fr", "plateforme"), label: "Plateforme" },
          { href: homeAnchor("fr", "conformite"), label: "Conformité" },
          { href: "/tarifs/", label: "Tarifs" },
          { href: "/diagnostic/", label: "Diagnostic gratuit" },
        ],
      },
      {
        h: "Légal",
        links: [
          { href: "/confidentialite/", label: "Confidentialité" },
          { href: "/conditions/", label: "Conditions" },
        ],
      },
    ],
    tagline: "Le resto qui répond à tout. Fait au Québec.",
    contact: "Contact",
    rights: "Tous droits réservés.",
    navLabel: "Liens de pied de page",
    hosted: "Hébergé au Canada · Facturé en CAD",
  },
  en: {
    cols: [
      {
        h: "Product",
        links: [
          { href: homeAnchor("en", "plateforme"), label: "Platform" },
          { href: homeAnchor("en", "conformite"), label: "Compliance" },
          { href: "/en/pricing/", label: "Pricing" },
          { href: "/en/diagnostic/", label: "Free diagnostic" },
        ],
      },
      {
        h: "Legal",
        links: [
          { href: "/en/privacy/", label: "Privacy" },
          { href: "/en/terms/", label: "Terms" },
        ],
      },
    ],
    tagline: "The restaurant that answers everything. Made in Québec.",
    contact: "Contact",
    rights: "All rights reserved.",
    navLabel: "Footer links",
    hosted: "Hosted in Canada · Priced in CAD",
  },
} as const;

type FooterCol = (typeof L)[Locale]["cols"][number];

function FooterColumn({ col }: { col: FooterCol }) {
  return (
    <div>
      <p className="kicker">{col.h}</p>
      <ul className="mt-4 space-y-2 text-sm">
        {col.links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-muted underline-offset-4 hover:text-ink hover:underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SiteFooter({ locale }: { locale: Locale }) {
  const t = L[locale];
  return (
    <footer className="relative z-[1] border-t border-line bg-panel-solid">
      <div className="wrap grid gap-12 py-16 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <p className="font-mono text-sm font-bold tracking-[0.22em]">
            RESTOBOOM<span className="text-accent">.</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-muted">{t.tagline}</p>
          <p className="mt-6 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted">{t.hosted}</p>
        </div>
        <nav aria-label={t.navLabel} className="contents">
          {t.cols.map((col) => (
            <FooterColumn key={col.h} col={col} />
          ))}
        </nav>
        <div>
          <p className="kicker">{t.contact}</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-muted underline-offset-4 hover:text-ink hover:underline">
                {CONTACT_EMAIL}
              </a>
            </li>
            <li>
              <ConsentReopenButton locale={locale} />
            </li>
          </ul>
        </div>
      </div>
      <div className="wrap border-t border-line py-6">
        <p className="font-mono text-xs text-muted">© {new Date().getFullYear()} RestoBoom. {t.rights}</p>
      </div>
    </footer>
  );
}
