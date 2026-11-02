"use client";

import { useState, type FormEvent } from "react";
import type { Locale } from "@/lib/i18n";
import { captureUtm, leadFieldErrors, leadSchema, type LeadInput } from "@/lib/lead";
import { submitLead, type SubmitResult } from "@/lib/submitLead";
import { track } from "@/lib/analytics";
import { HERO_EXPERIMENT, readVariant } from "@/lib/experiments";
import { FORM_COPY } from "./copy";

const SUBMIT_CONFIG = {
  endpoint: process.env.NEXT_PUBLIC_LEAD_ENDPOINT,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

export type FieldName = "name" | "email" | "restaurant" | "phone" | "locations" | "website_url" | "consent";
export type FailureReason = Exclude<SubmitResult, { ok: true }>["reason"];
export type LeadStatus = { kind: "idle" | "sending" | "success" } | { kind: "failed"; reason: FailureReason };
export type FieldErrors = Partial<Record<FieldName, string>>;
/** What the browser actually holds before validation: consent may still be unchecked. */
type RawLead = Omit<LeadInput, "consent"> & { consent: boolean };

/** Map a schema error code to the localized message shown under the field. */
export function errorMessage(locale: Locale, field: string, code: string): string {
  const e = FORM_COPY[locale].errors;
  if (field === "consent") return e.consent;
  if (code === "invalid_phone") return e.phone;
  if (code === "invalid_url") return e.url;
  if (field === "email") return e.email;
  return e.required;
}

function readUtm() {
  try {
    return captureUtm(window.sessionStorage, "");
  } catch {
    return {};
  }
}

/** FormData → schema input, with attribution (first-touch UTM + A/B variant) attached. */
function readForm(form: HTMLFormElement, locale: Locale): RawLead {
  const data = new FormData(form);
  const text = (k: string) => ((data.get(k) as string | null) ?? "").trim();
  return {
    name: text("name"),
    email: text("email"),
    restaurant: text("restaurant"),
    phone: text("phone") || undefined,
    locations: (text("locations") || undefined) as LeadInput["locations"],
    website_url: text("website_url") || undefined,
    consent: data.get("consent") === "on",
    locale,
    source: "marketing-site",
    ab_variant: readVariant(HERO_EXPERIMENT) ?? undefined,
    company_website: text("company_website"),
    ...readUtm(),
  };
}

/**
 * Focus the first invalid field and centre it, so it clears the fixed header (WCAG 2.4.11) and the
 * error summary above it stays in view. Chrome already centres on focus(); being explicit keeps
 * Safari/Firefox (whose focus scrolling aligns differently) consistent.
 */
function focusFirstInvalid(form: HTMLFormElement, field: string): void {
  const el = form.querySelector<HTMLElement>(`[name="${field}"]`);
  if (!el) return;
  el.focus({ preventScroll: true });
  el.scrollIntoView({ block: "center" });
}

/** Validation → submission → analytics, as one hook so the form component stays presentational. */
export function useLeadSubmission(locale: Locale) {
  const [status, setStatus] = useState<LeadStatus>({ kind: "idle" });
  const [errors, setErrors] = useState<FieldErrors>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const raw = readForm(form, locale);
    // Honeypot: pretend success so bots don't retry, send nothing.
    if (raw.company_website) return setStatus({ kind: "success" });
    const parsed = leadSchema.safeParse(raw);
    if (!parsed.success) {
      const codes = leadFieldErrors(parsed.error);
      setErrors(Object.fromEntries(Object.entries(codes).map(([k, code]) => [k, errorMessage(locale, k, code)])));
      track("lead_invalid", { fields: Object.keys(codes).join(",") });
      focusFirstInvalid(form, Object.keys(codes)[0]);
      return;
    }
    setErrors({});
    setStatus({ kind: "sending" });
    track("lead_submit", { locations: parsed.data.locations ?? "unknown" });
    const result = await submitLead(parsed.data, SUBMIT_CONFIG);
    track(result.ok ? "lead_success" : "lead_error", result.ok ? { via: result.via } : { reason: result.reason });
    if (result.ok) form.reset();
    setStatus(result.ok ? { kind: "success" } : { kind: "failed", reason: result.reason });
  }

  return { status, errors, onSubmit };
}
