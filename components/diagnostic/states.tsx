import { CONTACT_EMAIL } from "@/lib/site";
import type { FormCopy } from "./copy";
import type { LeadStatus } from "./useLeadSubmission";

export function SuccessPanel({ copy }: { copy: FormCopy }) {
  return (
    <div className="glass ticks p-8" role="status" aria-live="polite" data-testid="lead-success">
      <p className="kicker">OK</p>
      <p className="display-md mt-4">{copy.success.h}</p>
      <p className="mt-3 text-muted">{copy.success.p}</p>
    </div>
  );
}

/** Live region: failure reason + a mailto fallback so a lead is never lost. */
export function StatusLine({ status, copy }: { status: LeadStatus; copy: FormCopy }) {
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(copy.mailSubject)}`;
  const reason = status.kind === "failed" ? status.reason : null;
  const text = reason === "rate_limited" ? copy.failure.rate_limited : reason === "not_configured" ? copy.failure.not_configured : copy.failure.generic;
  return (
    <p aria-live="polite" role="status" className="mt-4 min-h-6 text-sm" data-testid="lead-status">
      {reason && (
        <span className="text-ember">
          {text}{" "}
          <a href={mailto} className="underline underline-offset-4">
            {CONTACT_EMAIL}
          </a>
        </span>
      )}
    </p>
  );
}
