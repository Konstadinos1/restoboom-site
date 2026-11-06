"use client";

import type { Locale } from "@/lib/i18n";
import { FORM_COPY } from "./diagnostic/copy";
import { ConsentField, HoneypotField, LocationsField, TextField } from "./diagnostic/fields";
import { StatusLine, SuccessPanel } from "./diagnostic/states";
import { useLeadSubmission } from "./diagnostic/useLeadSubmission";

export default function DiagnosticForm({ locale }: { locale: Locale }) {
  const copy = FORM_COPY[locale];
  const { status, errors, onSubmit } = useLeadSubmission(locale);
  if (status.kind === "success") return <SuccessPanel copy={copy} />;
  const common = { copy, errors };

  return (
    <div className="glass ticks p-6 md:p-10">
      <form onSubmit={onSubmit} noValidate aria-describedby="df-legend">
        {Object.keys(errors).length > 0 && (
          <p className="mb-6 border-l-2 border-accent bg-white/75 px-4 py-3 text-sm text-ember" role="alert">
            {copy.errors.summary}
          </p>
        )}
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField field="name" {...common} required type="text" autoComplete="name" />
          <TextField field="email" {...common} required type="email" autoComplete="email" inputMode="email" />
          <TextField field="restaurant" {...common} required type="text" autoComplete="organization" />
          <TextField field="phone" {...common} type="tel" autoComplete="tel-national" inputMode="tel" hint={copy.fields.phone.hint} />
          <LocationsField {...common} />
          <TextField field="website_url" {...common} type="url" inputMode="url" />
        </div>
        <HoneypotField />
        <ConsentField label={copy.consent} errors={errors} />
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <button type="submit" disabled={status.kind === "sending"} className="btn btn-primary disabled:opacity-60" data-testid="lead-submit">
            {status.kind === "sending" ? copy.sending : copy.submit} <span className="arrow" aria-hidden="true">→</span>
          </button>
          <p id="df-legend" className="font-mono text-xs text-muted">{copy.requiredLegend}</p>
        </div>
        <StatusLine status={status} copy={copy} />
      </form>
      <p className="mt-6 border-t border-line pt-4 text-sm text-muted">{copy.note}</p>
    </div>
  );
}
