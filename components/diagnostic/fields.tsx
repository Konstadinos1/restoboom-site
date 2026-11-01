import type { InputHTMLAttributes, ReactNode } from "react";
import { LOCATION_BUCKETS } from "@/lib/lead";
import type { FieldErrors, FieldName } from "./useLeadSubmission";
import type { FormCopy } from "./copy";

const INPUT_BASE = "mt-2 w-full rounded-xl border bg-bg/60 px-4 py-3 text-ink placeholder:text-muted/70 transition-colors focus:border-frost focus:outline-none";

/** id/name/aria wiring shared by every control, so errors are announced with their field. */
export function controlProps(field: FieldName, errors: FieldErrors, hintId?: string) {
  return {
    id: `df-${field}`,
    name: field,
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `df-${field}-err` : hintId,
    className: `${INPUT_BASE} ${errors[field] ? "border-accent" : "border-line-strong"}`,
  };
}

export function FieldError({ field, errors }: { field: FieldName; errors: FieldErrors }) {
  if (!errors[field]) return null;
  return (
    <p id={`df-${field}-err`} className="mt-1.5 text-sm text-ember">
      {errors[field]}
    </p>
  );
}

export function FieldLabel({ field, label, required }: { field: FieldName; label: string; required: boolean }) {
  return (
    <label htmlFor={`df-${field}`} className="block text-sm font-semibold">
      {label} {required && <span aria-hidden="true" className="text-accent">*</span>}
    </label>
  );
}

type TextFieldProps = {
  field: Exclude<FieldName, "locations" | "consent">;
  copy: FormCopy;
  errors: FieldErrors;
  required?: boolean;
  hint?: string;
} & Pick<InputHTMLAttributes<HTMLInputElement>, "type" | "autoComplete" | "inputMode">;

export function TextField({ field, copy, errors, required = false, hint, ...input }: TextFieldProps) {
  const hintId = hint ? `df-${field}-hint` : undefined;
  return (
    <div>
      <FieldLabel field={field} label={copy.fields[field].label} required={required} />
      <input {...controlProps(field, errors, hintId)} {...input} required={required} placeholder={copy.fields[field].ph} />
      {errors[field] ? <FieldError field={field} errors={errors} /> : hint && <p id={hintId} className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function LocationsField({ copy, errors }: { copy: FormCopy; errors: FieldErrors }) {
  return (
    <div>
      <FieldLabel field="locations" label={copy.fields.locations.label} required={false} />
      <select {...controlProps("locations", errors)} defaultValue="">
        <option value="">{copy.fields.locations.ph}</option>
        {LOCATION_BUCKETS.map((b) => (
          <option key={b} value={b}>
            {copy.fields.locations.options[b]}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ConsentField({ label, errors }: { label: ReactNode; errors: FieldErrors }) {
  return (
    <div className="mt-6 flex items-start gap-3">
      <input
        id="df-consent"
        name="consent"
        type="checkbox"
        required
        aria-invalid={errors.consent ? true : undefined}
        aria-describedby={errors.consent ? "df-consent-err" : undefined}
        className="mt-1 size-5 shrink-0 accent-[var(--color-accent)]"
      />
      <div>
        <label htmlFor="df-consent" className="text-sm text-muted">
          {label} <span aria-hidden="true" className="text-accent">*</span>
        </label>
        <FieldError field="consent" errors={errors} />
      </div>
    </div>
  );
}

/** Off-screen trap field: humans never see or focus it; bots fill it. */
export function HoneypotField() {
  return (
    <div className="hp-field" aria-hidden="true">
      <label htmlFor="df-hp">Company website</label>
      <input id="df-hp" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
