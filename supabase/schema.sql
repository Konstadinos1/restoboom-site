-- RestoBoom marketing site — diagnostic leads
-- Run this in the SQL editor of your HOSTED Supabase project.
-- The anon key may only INSERT; it can never read rows back.

create table if not exists public.diagnostic_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  restaurant text not null,
  website_url text,
  locale text not null default 'fr',
  source text,
  constraint diagnostic_leads_email_shape check (position('@' in email) > 1)
);

create index if not exists diagnostic_leads_created_at_idx
  on public.diagnostic_leads (created_at desc);

alter table public.diagnostic_leads enable row level security;

-- Writes only: anonymous visitors can insert a lead.
create policy "anon can insert leads"
  on public.diagnostic_leads
  for insert
  to anon
  with check (true);

-- No SELECT policy exists on purpose: with RLS enabled and no select policy,
-- the anon key cannot read any rows. Read leads from the Supabase dashboard
-- or with the service-role key from a trusted backend only.
