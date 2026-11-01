-- Diagnostic leads v2: qualification + attribution + experiment columns,
-- hashed IP for rate limiting, and a consent timestamp (CASL/Law 25 evidence).
-- Safe to run on top of supabase/schema.sql (all additive).

alter table public.diagnostic_leads
  add column if not exists phone text,
  add column if not exists locations text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists ab_variant text,
  add column if not exists ip_hash text,
  add column if not exists consent_at timestamptz;

alter table public.diagnostic_leads
  drop constraint if exists diagnostic_leads_locations_bucket,
  add constraint diagnostic_leads_locations_bucket check (locations is null or locations in ('1', '2-5', '6+')),
  drop constraint if exists diagnostic_leads_phone_e164,
  add constraint diagnostic_leads_phone_e164 check (phone is null or phone ~ '^\+1[2-9][0-9]{2}[2-9][0-9]{6}$');

create index if not exists diagnostic_leads_ip_hash_created_at_idx
  on public.diagnostic_leads (ip_hash, created_at desc);

-- Once the diagnostic-lead Edge Function is deployed and NEXT_PUBLIC_LEAD_ENDPOINT
-- is set, close the direct-from-browser path so the rate limit can't be bypassed:
--   drop policy if exists "anon can insert leads" on public.diagnostic_leads;
