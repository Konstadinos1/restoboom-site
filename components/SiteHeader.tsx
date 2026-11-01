"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { homeAnchor, homeHref, langSwitchHref, type Locale } from "@/lib/i18n";

const SCROLLED_THRESHOLD_PX = 24;

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
  },
} as const;

type HeaderCopy = (typeof L)[Locale];

function useScrolledPast(thresholdPx: number): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > thresholdPx);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [thresholdPx]);
  return scrolled;
}

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
    <Link
      href={langSwitchHref({ locale, path })}
      hrefLang={locale === "fr" ? "en-CA" : "fr-CA"}
      lang={locale === "fr" ? "en" : "fr"}
      className="rounded-full border border-line-strong px-3 py-1.5 font-mono text-xs tracking-widest text-ink hover:border-frost"
      data-track="lang_switch"
    >
      {locale === "fr" ? "EN" : "FR"}
      <span className="sr-only"> — {label}</span>
    </Link>
  );
}

function DesktopNav({ t, toggle }: { t: HeaderCopy; toggle: React.ReactNode }) {
  return (
    <nav aria-label={t.navLabel} className="hidden md:block">
      <ul className="flex items-center gap-7 text-sm">
        {t.nav.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="text-muted transition-colors hover:text-ink">
              {item.label}
            </Link>
          </li>
        ))}
        <li>{toggle}</li>
        <li>
          <Link href={t.cta.href} className="btn btn-primary px-5 py-2 text-sm" data-track="cta_click" data-track-label="header">
            {t.cta.label}
          </Link>
        </li>
      </ul>
    </nav>
  );
}

function MobileNav({ t, onNavigate }: { t: HeaderCopy; onNavigate: () => void }) {
  return (
    <nav id="mobile-nav" aria-label={t.navLabel} className="wrap pb-6 md:hidden">
      <ul className="space-y-1 border-t border-line pt-4">
        {t.nav.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="block py-3 text-2xl font-semibold tracking-tight" onClick={onNavigate}>
              {item.label}
            </Link>
          </li>
        ))}
        <li className="pt-4">
          <Link href={t.cta.href} className="btn btn-primary w-full justify-center" data-track="cta_click" data-track-label="mobile_menu">
            {t.cta.label}
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default function SiteHeader({ locale }: { locale: Locale }) {
  const t = L[locale];
  const pathname = usePathname() || homeHref(locale);
  const scrolled = useScrolledPast(SCROLLED_THRESHOLD_PX);
  const menu = useMobileMenu(pathname);
  const toggle = <LangToggle locale={locale} path={pathname} label={t.switchLabel} />;
  const solid = scrolled || menu.open;

  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-500 ${solid ? "border-b border-line bg-bg/85 backdrop-blur-xl" : "border-b border-transparent"}`}>
      <a href="#main" className="skip-link">
        {t.skip}
      </a>
      <div className="wrap flex h-16 items-center justify-between gap-6">
        <Link href={homeHref(locale)} className="group flex items-baseline gap-3">
          <span className="font-mono text-sm font-bold tracking-[0.22em] text-ink">
            RESTOBOOM<span className="text-accent">.</span>
          </span>
          <span className="hidden font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted sm:inline">{t.tagline}</span>
        </Link>
        <DesktopNav t={t} toggle={toggle} />
        <div className="flex items-center gap-3 md:hidden">
          {toggle}
          <button type="button" className="rounded-full border border-line-strong px-4 py-1.5 font-mono text-xs uppercase tracking-widest" aria-expanded={menu.open} aria-controls="mobile-nav" onClick={menu.toggle}>
            {menu.open ? t.close : t.menu}
          </button>
        </div>
      </div>
      {menu.open && <MobileNav t={t} onNavigate={menu.close} />}
    </header>
  );
}
