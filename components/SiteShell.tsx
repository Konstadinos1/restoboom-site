import type { ReactNode } from "react";
import { displayFont, monoFont } from "@/lib/fonts";
import { experimentBootScript } from "@/lib/experiments";
import type { Locale } from "@/lib/i18n";
import { organizationJsonLd } from "@/lib/seo";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import RevealController from "./RevealController";
import AnalyticsRuntime from "./AnalyticsRuntime";
import ConsentBanner from "./ConsentBanner";
import JsonLd from "./JsonLd";

/** Reveal-on-scroll safety net: only hide [data-reveal] if JS can bring it back. */
const REVEAL_BOOT = `(function(){try{if(!("IntersectionObserver"in window))return;var d=document.documentElement;d.classList.add("reveal-ready");setTimeout(function(){if(!window.__rbReveal)d.classList.remove("reveal-ready")},3000)}catch(_){}})();`;

/**
 * Shared <html> shell for both locale root layouts (FR at /, EN at /en/).
 * Inline scripts are static constants authored here — no user input reaches them.
 */
export default function SiteShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <html lang={locale === "fr" ? "fr-CA" : "en-CA"} className={`${displayFont.variable} ${monoFont.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: experimentBootScript() + REVEAL_BOOT }} />
        <JsonLd data={organizationJsonLd(locale)} />
      </head>
      <body>
        <SiteHeader locale={locale} />
        <main id="main">{children}</main>
        <SiteFooter locale={locale} />
        <ConsentBanner locale={locale} />
        <RevealController />
        <AnalyticsRuntime />
      </body>
    </html>
  );
}
