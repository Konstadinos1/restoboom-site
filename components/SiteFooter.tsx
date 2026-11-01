import Link from "next/link";
import type { Locale } from "@/lib/i18n";

const L = {
  fr: {
    links: [
      { href: "/#plateforme", label: "Plateforme" },
      { href: "/#conformite", label: "Conformité" },
      { href: "/tarifs", label: "Tarifs" },
      { href: "/diagnostic", label: "Diagnostic gratuit" },
      { href: "/confidentialite", label: "Confidentialité" },
      { href: "/conditions", label: "Conditions" },
    ],
    tagline: "Fait au Québec.",
    rights: "Tous droits réservés.",
  },
  en: {
    links: [
      { href: "/#plateforme", label: "Platform" },
      { href: "/#conformite", label: "Compliance" },
      { href: "/en/pricing", label: "Pricing" },
      { href: "/en/diagnostic", label: "Free diagnostic" },
      { href: "/en/privacy", label: "Privacy" },
      { href: "/en/terms", label: "Terms" },
    ],
    tagline: "Made in Québec.",
    rights: "All rights reserved.",
  },
} as const;

export default function SiteFooter({ locale }: { locale: Locale }) {
  const t = L[locale];
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "bonjour@restoboom.ca";
  return (
    <footer className="mt-24 border-t border-line">
      <div className="wrap py-10">
        <p className="font-mono text-sm font-bold tracking-widest">RESTOBOOM.</p>
        <p className="mt-1 text-sm text-muted">{t.tagline}</p>
        <nav aria-label={locale === "fr" ? "Liens de pied de page" : "Footer links"} className="mt-6">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {t.links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-muted underline-offset-4 hover:text-ink hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={`mailto:${email}`} className="text-muted underline-offset-4 hover:text-ink hover:underline">
                {email}
              </a>
            </li>
          </ul>
        </nav>
        <p className="mt-8 text-xs text-muted">© 2026 RestoBoom. {t.rights}</p>
      </div>
    </footer>
  );
}
