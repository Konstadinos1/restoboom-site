/**
 * Lead validation shared by the browser form (Next.js) and the
 * `diagnostic-lead` Supabase Edge Function (Deno). Keep this file free of
 * runtime-specific APIs so both can import it.
 */
import { z } from "zod";

export const LOCATION_BUCKETS = ["1", "2-5", "6+"] as const;
export const MAX_TEXT_LENGTH = 200;
export const MAX_URL_LENGTH = 500;
/** NANP numbers: 10 digits, optional leading country code 1. */
const NANP_DIGITS = 10;

/** Normalize a North-American phone to E.164 (+15145550123); null when not a valid NANP number. */
export function normalizeNanpPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  const national = digits.length === NANP_DIGITS + 1 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (national.length !== NANP_DIGITS) return null;
  // NANP: area code and exchange can't start with 0 or 1.
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(national)) return null;
  return `+1${national}`;
}

/** Quebec display convention: (514) 555-0123. */
export function formatNanpPhone(e164: string): string {
  const n = e164.replace(/^\+1/, "");
  return `(${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}`;
}

const trimmed = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

export const leadSchema = z.object({
  name: trimmed(MAX_TEXT_LENGTH),
  email: z.string().trim().toLowerCase().pipe(z.email().max(MAX_TEXT_LENGTH)),
  restaurant: trimmed(MAX_TEXT_LENGTH),
  website_url: z
    .string()
    .trim()
    .max(MAX_URL_LENGTH)
    .optional()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || /^https?:\/\/[^\s]+\.[^\s]+/i.test(v), { message: "invalid_url" }),
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((v, ctx) => {
      if (!v) return null;
      const e164 = normalizeNanpPhone(v);
      if (!e164) {
        ctx.addIssue({ code: "custom", message: "invalid_phone" });
        return z.NEVER;
      }
      return e164;
    }),
  locations: z.enum(LOCATION_BUCKETS).optional().transform((v) => v ?? null),
  locale: z.enum(["fr", "en"]),
  consent: z.literal(true),
  source: optionalText(60),
  utm_source: optionalText(100),
  utm_medium: optionalText(100),
  utm_campaign: optionalText(100),
  ab_variant: optionalText(20),
  /** Honeypot: must stay empty. Humans never see the field. */
  company_website: z.string().max(0).optional(),
});

export type LeadInput = z.input<typeof leadSchema>;
export type Lead = z.output<typeof leadSchema>;

/** Field name → first error code, so the UI can show per-field messages. */
export function leadFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
