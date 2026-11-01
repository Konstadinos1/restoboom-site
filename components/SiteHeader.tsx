"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { langSwitchHref, type Locale } from "@/lib/i18n";

const L = {
  fr: {
    homeHref: "/",
    nav: [
      { href: "/#plateforme", label: "Plateforme" },
      { href: "/#conformite", label: "Conformité" },
      { href: "/tarifs", label: "Tarifs" },
      { href: "/diagnostic", label: "Diagnostic gratuit" },
    ],
    skip: "Aller au contenu",
    tagline: "Fait au Québec.",
  },
  en: {
    homeHref: "/en/",
    nav: [
      { href: "/#plateforme", label: "Platform" },
      { href: "/#conformite", label: "Compliance" },
      { href: "/en/pricing", label: "Pricing" },
      { href: "/en/diagnostic", label: "Free diagnostic" },
    ],
    skip: "Skip to content",
    tagline: "Made in Québec.",
  },
} as const;

export default function SiteHeader({ locale }: { locale: Locale }) {
  const t = L[locale];
  const pathname = usePathname() || (locale === "fr" ? "/" : "/en");
  const other = locale === "fr" ? "EN" : "FR";
  return (
    <header className="border-b border-line">
      <a href="#main" className="skip-link">
        {t.skip}
      </a>
      <div className="wrap flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 py-4">
        <Link href={t.homeHref} className="font-mono text-sm font-bold tracking-widest text-ink">
          RESTOBOOM.
          <span className="ml-2 font-normal tracking-normal text-muted">{t.tagline}</span>
        </Link>
        <nav aria-label={locale === "fr" ? "Navigation principale" : "Main navigation"}>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
            {t.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-muted underline-offset-4 hover:text-ink hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={langSwitchHref({ locale, frPath: pathname })}
                lang={locale === "fr" ? "en" : "fr"}
                className="rounded border border-line px-2 py-1 font-mono text-xs text-ink hover:border-accent"
                aria-label={locale === "fr" ? "Switch to English" : "Passer au français"}
              >
                {other}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
