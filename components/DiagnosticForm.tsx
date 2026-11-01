"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";

const S = {
  fr: {
    name: { label: "Nom complet", ph: "Ex. Julie Tremblay" },
    email: { label: "Courriel", ph: "julie@votre-resto.ca" },
    restaurant: { label: "Nom du restaurant", ph: "Ex. Resto du Coin" },
    url: { label: "Site web ou fiche Google (URL)", ph: "https://… (facultatif)" },
    consent: (
      <>
        J&apos;accepte d&apos;être contacté au sujet de ma demande. Désabonnement en tout temps.{" "}
        <Link href="/confidentialite" className="text-accent underline underline-offset-4">
          Confidentialité
        </Link>
        .
      </>
    ),
    submit: "Envoyer ma demande",
    sending: "Envoi…",
    success: "Merci ! Votre demande est bien reçue. On vous écrit dans les 2 jours ouvrables.",
    errorGeneric: "Quelque chose n'a pas marché. Réessayez ou écrivez-nous.",
    errorConfig:
      "Le formulaire n'est pas encore branché au stockage des demandes. Écrivez-nous directement :",
    invalidEmail: "Vérifiez l'adresse courriel.",
    required: "Champ requis.",
    note: "Vos données restent au Canada. Elles servent à répondre à votre demande, rien d'autre.",
  },
  en: {
    name: { label: "Full name", ph: "e.g. Julie Tremblay" },
    email: { label: "Email", ph: "julie@yourresto.ca" },
    restaurant: { label: "Restaurant name", ph: "e.g. Corner Resto" },
    url: { label: "Website or Google profile (URL)", ph: "https://… (optional)" },
    consent: (
      <>
        I agree to be contacted about my request. Unsubscribe anytime.{" "}
        <Link href="/en/privacy" className="text-accent underline underline-offset-4">
          Privacy
        </Link>
        .
      </>
    ),
    submit: "Send my request",
    sending: "Sending…",
    success: "Thanks! Your request is in. We'll write within 2 business days.",
    errorGeneric: "Something went wrong. Try again or write to us.",
    errorConfig: "The form isn't connected to lead storage yet. Write to us directly:",
    invalidEmail: "Please check the email address.",
    required: "Required field.",
    note: "Your data stays in Canada. It's used to answer your request, nothing else.",
  },
} as const;

type Status = { kind: "idle" | "sending" | "success" | "error" | "config"; msg?: string };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function DiagnosticForm({ locale }: { locale: Locale }) {
  const t = S[locale];
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const configured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "bonjour@restoboom.ca";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    // Honeypot: bots fill it, humans never see it.
    if ((data.get("company_website") as string)?.trim()) {
      setStatus({ kind: "success" });
      form.reset();
      return;
    }
    const payload = {
      name: ((data.get("name") as string) || "").trim(),
      email: ((data.get("email") as string) || "").trim(),
      restaurant: ((data.get("restaurant") as string) || "").trim(),
      website_url: ((data.get("website_url") as string) || "").trim() || null,
      locale,
      source: "marketing-site",
    };
    if (!payload.name || !payload.restaurant) {
      setStatus({ kind: "error", msg: t.required });
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) {
      setStatus({ kind: "error", msg: t.invalidEmail });
      return;
    }
    if (!configured) {
      setStatus({ kind: "config" });
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string);
      const { error } = await supabase.from("diagnostic_leads").insert(payload);
      if (error) throw error;
      setStatus({ kind: "success" });
      form.reset();
    } catch {
      setStatus({ kind: "error", msg: t.errorGeneric });
    }
  }

  const inputCls =
    "mt-1 w-full rounded border border-line bg-panel px-3 py-2 text-ink placeholder:text-muted/60";
  const labelCls = "block text-sm font-semibold";

  return (
    <div>
      <form onSubmit={onSubmit} noValidate={false}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="df-name" className={labelCls}>
              {t.name.label} <span aria-hidden="true" className="text-accent">*</span>
            </label>
            <input id="df-name" name="name" type="text" required autoComplete="name" placeholder={t.name.ph} className={inputCls} />
          </div>
          <div>
            <label htmlFor="df-email" className={labelCls}>
              {t.email.label} <span aria-hidden="true" className="text-accent">*</span>
            </label>
            <input id="df-email" name="email" type="email" required autoComplete="email" placeholder={t.email.ph} className={inputCls} />
          </div>
          <div>
            <label htmlFor="df-restaurant" className={labelCls}>
              {t.restaurant.label} <span aria-hidden="true" className="text-accent">*</span>
            </label>
            <input id="df-restaurant" name="restaurant" type="text" required placeholder={t.restaurant.ph} className={inputCls} />
          </div>
          <div>
            <label htmlFor="df-url" className={labelCls}>
              {t.url.label}
            </label>
            <input id="df-url" name="website_url" type="url" placeholder={t.url.ph} className={inputCls} />
          </div>
        </div>
        {/* Honeypot field — hidden from humans */}
        <div className="hp-field" aria-hidden="true">
          <label htmlFor="df-hp">Company website</label>
          <input id="df-hp" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <div className="mt-5 flex items-start gap-3">
          <input id="df-consent" name="consent" type="checkbox" required className="mt-1 size-4 accent-[var(--color-accent)]" />
          <label htmlFor="df-consent" className="text-sm text-muted">
            {t.consent} <span aria-hidden="true" className="text-accent">*</span>
          </label>
        </div>
        <button
          type="submit"
          disabled={status.kind === "sending"}
          className="mt-6 rounded bg-accent px-6 py-3 text-lg font-bold text-bg hover:bg-accent-deep hover:text-ink disabled:opacity-60"
        >
          {status.kind === "sending" ? t.sending : t.submit}
        </button>
        <p aria-live="polite" role="status" className="mt-4 min-h-6 text-sm">
          {status.kind === "success" && <span className="font-semibold text-accent">{t.success}</span>}
          {status.kind === "error" && (
            <span className="text-accent">
              {status.msg} {t.errorGeneric && status.kind === "error" && !status.msg ? "" : ""}
              <a href={`mailto:${email}`} className="underline underline-offset-4">
                {email}
              </a>
            </span>
          )}
          {status.kind === "config" && (
            <span className="text-accent">
              {t.errorConfig}{" "}
              <a href={`mailto:${email}`} className="underline underline-offset-4">
                {email}
              </a>
            </span>
          )}
        </p>
      </form>
      <p className="mt-6 border-t border-line pt-4 text-sm text-muted">{t.note}</p>
    </div>
  );
}
