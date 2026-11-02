"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { homeAnchor, homeHref, langSwitchHref, type Locale } from "@/lib/i18n";
import PixelLogo from "./world/PixelLogo";
import StationLabel from "./world/StationLabel";
import MontrealClock from "./world/MontrealClock";

const L = {
  fr: {
    nav: [
      { href: homeAnchor("fr", "plateforme"), label: "Plateforme" },
      { href: homeAnchor("fr", "conformite"), label: "Conformité" },
      { href: "/tarifs/", label: "Tarifs" },
    ],
    cta: { href: "/diagnostic/", label: "Diagnostic gratuit" },
    skip: "Aller au contenu",
    tagline: "Fait au Québec",
    menu: "Menu",
    close: "Fermer",
    navLabel: "Navigation principale",
    switchLabel: "Switch to English",
    pages: { "/": "Accueil", "/tarifs/": "Tarifs", "/diagnostic/": "Diagnostic", "/confidentialite/": "Confidentialité", "/conditions/": "Conditions" } as Record<string, string>,
  },
  en: {
    nav: [
      { href: homeAnchor("en", "plateforme"), label: "Platform" },
      { href: homeAnchor("en", "conformite"), label: "Compliance" },
      { href: "/en/pricing/", label: "Pricing" },
    ],
    cta: { href: "/en/diagnostic/", label: "Free diagnostic" },
    skip: "Skip to content",
    tagline: "Made in Québec",
    menu: "Menu",
    close: "Close",
    navLabel: "Main navigation",
    switchLabel: "Passer au français",
    pages: { "/en/": "Home", "/en/pricing/": "Pricing", "/en/diagnostic/": "Diagnostic", "/en/privacy/": "Privacy", "/en/terms/": "Terms" } as Record<string, string>,
  },
} as const;

type HeaderCopy = (typeof L)[Locale];
const CHIP = "hud-label hud-label--light px-2.5 py-1.5 text-[0.7rem] transition-colors hover:bg-slate hover:text-white";

/** Disclosure state for the mobile menu: closes on navigation and on Escape. */
function useMobileMenu(pathname: string) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return { open, toggle: () => setOpen((v) => !v), close: () => setOpen(false) };
}

function LangToggle({ locale, path, label }: { locale: Locale; path: string; label: string }) {
  return (
    <Link href={langSwitchHref({ locale, path })} hrefLang={locale === "fr" ? "en-CA" : "fr-CA"} lang={locale === "fr" ? "en" : "fr"} className={CHIP} data-track="lang_switch">
      {locale === "fr" ? "EN" : "FR"}
      <span className="sr-only"> — {label}</span>
    </Link>
  );
}

function DesktopNav({ t, toggle }: { t: HeaderCopy; toggle: React.ReactNode }) {
  return (
    <nav aria-label={t.navLabel} className="hidden md:block">
      <ul className="flex items-center gap-1.5">
        {t.nav.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={CHIP}>
              {item.label}
            </Link>
          </li>
        ))}
        <li>{toggle}</li>
        <li>
          <Link href={t.cta.href} className="hud-label hud-label--accent px-3 py-1.5 text-[0.7rem] hover:bg-accent-deep" data-track="cta_click" data-track-label="header">
            {t.cta.label} →
          </Link>
        </li>
      </ul>
    </nav>
  );
}

function MobileNav({ t, onNavigate }: { t: HeaderCopy; onNavigate: () => void }) {
  return (
    <nav id="mobile-nav" aria-label={t.navLabel} className="wrap pb-6 md:hidden">
      <ul className="glass space-y-1 p-4">
        {t.nav.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="block py-2.5 text-xl font-medium tracking-tight text-slate" onClick={onNavigate}>
              {item.label}
            </Link>
          </li>
        ))}
        <li className="pt-3">
          <Link href={t.cta.href} className="btn btn-primary w-full justify-center" data-track="cta_click" data-track-label="mobile_menu">
            {t.cta.label}
          </Link>
        </li>
      </ul>
    </nav>
  );
}

/** igloo-style HUD header: pixel logo + section label top-left, navigation + Montréal clock top-right. */
export default function SiteHeader({ locale }: { locale: Locale }) {
  const t = L[locale];
  const pathname = usePathname() || homeHref(locale);
  const menu = useMobileMenu(pathname);
  const toggle = <LangToggle locale={locale} path={pathname} label={t.switchLabel} />;
  const pageLabel = t.pages[pathname.endsWith("/") ? pathname : `${pathname}/`] ?? t.pages[homeHref(locale)];
  return (
    <header className="hud-top">
      <a href="#main" className="skip-link">
        {t.skip}
      </a>
      <div className="wrap flex items-start justify-between gap-4 pb-8 pt-4">
        <div className="flex flex-col items-start gap-2">
          <Link href={homeHref(locale)} className="block text-slate">
            <PixelLogo className="h-[18px] w-auto md:h-[22px]" />
          </Link>
          <div className="flex flex-wrap gap-1">
            <StationLabel locale={locale} fallback={pageLabel} />
            <span className="hud-label hud-label--light hidden sm:inline">{t.tagline}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <DesktopNav t={t} toggle={toggle} />
          <div className="flex items-center gap-1.5 md:hidden">
            {toggle}
            <button type="button" className={CHIP} aria-expanded={menu.open} aria-controls="mobile-nav" onClick={menu.toggle}>
              {menu.open ? t.close : t.menu}
            </button>
          </div>
          <MontrealClock />
        </div>
      </div>
      {menu.open && <MobileNav t={t} onNavigate={menu.close} />}
    </header>
  );
}
