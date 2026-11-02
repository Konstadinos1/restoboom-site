"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { analyticsConfigured, readConsent, writeConsent } from "@/lib/analytics";
import type { Locale } from "@/lib/i18n";

const T = {
  fr: {
    title: "Mesure d'audience, avec votre accord.",
    body: "Sans témoin (cookie) et sans publicité : on compte les visites et les clics, rien qui vous identifie.",
    accept: "Accepter",
    decline: "Refuser",
    more: "Confidentialité",
    moreHref: "/confidentialite",
    reopen: "Préférences de mesure",
  },
  en: {
    title: "Audience measurement, with your consent.",
    body: "No cookies, no ads: we count visits and clicks, nothing that identifies you.",
    accept: "Accept",
    decline: "Decline",
    more: "Privacy",
    moreHref: "/en/privacy",
    reopen: "Measurement preferences",
  },
} as const;

const REOPEN_EVENT = "rb:consent-open";

function isAnalyticsEnabled(): boolean {
  return analyticsConfigured(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || "");
}

/** Open while consent is undecided; reopenable from the footer. Never opens when analytics is off. */
function useConsentPrompt() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!isAnalyticsEnabled()) return;
    try {
      setOpen(readConsent(window.localStorage) === "unset");
    } catch {
      setOpen(false);
    }
    const reopen = () => setOpen(true);
    window.addEventListener(REOPEN_EVENT, reopen);
    return () => window.removeEventListener(REOPEN_EVENT, reopen);
  }, []);
  const decide = (state: "granted" | "denied") => {
    try {
      writeConsent(window.localStorage, state);
    } catch {
      // If storage is blocked we simply never track.
    }
    setOpen(false);
  };
  return { open, decide };
}

/** Law 25: opt-in, equal-weight Accept/Decline, reopenable from the footer. Hidden when analytics isn't configured. */
export default function ConsentBanner({ locale }: { locale: Locale }) {
  const t = T[locale];
  const { open, decide } = useConsentPrompt();
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="false" aria-labelledby="consent-title" className="fixed inset-x-3 bottom-3 z-50 md:inset-x-auto md:right-6 md:bottom-6 md:max-w-md">
      <div className="glass ticks p-5 backdrop-blur-md">
        <p id="consent-title" className="font-semibold">{t.title}</p>
        <p className="mt-2 text-sm text-muted">
          {t.body}{" "}
          <Link href={t.moreHref} className="text-frost underline underline-offset-4">
            {t.more}
          </Link>
        </p>
        <div className="mt-4 flex gap-3">
          <button type="button" onClick={() => decide("granted")} className="btn btn-primary px-5 py-2 text-sm">
            {t.accept}
          </button>
          <button type="button" onClick={() => decide("denied")} className="btn btn-ghost px-5 py-2 text-sm">
            {t.decline}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConsentReopenButton({ locale }: { locale: Locale }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => setVisible(isAnalyticsEnabled()), []);
  if (!visible) return null;
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(REOPEN_EVENT))} className="text-muted underline-offset-4 hover:text-ink hover:underline">
      {T[locale].reopen}
    </button>
  );
}
