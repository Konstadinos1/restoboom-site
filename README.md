# RestoBoom — marketing site

Next.js 15 (App Router, static export) + Tailwind v4, deployed to GitHub Pages.
French at `/`, English mirror at `/en/`. Live: https://konstadinos1.github.io/restoboom-site/

Design language: **"Glace & braise"** — an igloo.inc-inspired cold, glassy, HUD-like UI
(bracketed mono labels, frosted panels, scroll-revealed sections, a lazy WebGL hero) with
RestoBoom's ember accent. All artwork and code are original.

Copy deck: `docs/copy-deck.md` (FR master, EN mirror, **claim register** — every factual claim
must map to a source; no stats, no testimonials).

## Pages

| FR | EN |
|---|---|
| `/` | `/en/` |
| `/tarifs/` | `/en/pricing/` |
| `/diagnostic/` | `/en/diagnostic/` |
| `/confidentialite/` | `/en/privacy/` |
| `/conditions/` | `/en/terms/` |

Plus generated `sitemap.xml` (hreflang fr-CA/en-CA/x-default), `robots.txt`, `manifest.webmanifest`,
`llms.txt` (AI-search summary), OG cards (`public/og-*.png`, regenerate with `npm run images`) and a branded `404.html`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Static export to `out/` (+ custom 404) |
| `npm run serve` | Serve `out/` under `/restoboom-site/` with gzip, like Pages |
| `npm test` / `npm run test:coverage` | Vitest unit tests (lib/: validation, i18n, A/B, analytics, SEO) |
| `npm run build:e2e && npm run test:e2e` | Playwright E2E on desktop + mobile: flows, lead form, consent, axe a11y |
| `npm run test:edge` | Supabase Edge Function: `deno check` + tests against a local fake of Supabase's REST API (needs Deno 2) |
| `npm run lighthouse` | Lighthouse CI with budgets (perf ≥ 90, a11y 100, BP ≥ 95, SEO ≥ 95, LCP ≤ 2.5 s, CLS ≤ 0.05) |
| `npm run linkcheck` | Crawl the built site, fail on any broken internal link |
| `npm run check` | Typecheck, unit, E2E, link check |
| `node scripts/capture-evidence.mjs` | After `build:e2e`: screenshots of every screen/state (desktop + mobile) and MP4 videos of the main flows into `evidence/` (git-ignored) |

## Automations (GitHub Actions)

- **CI** (`ci.yml`, every PR and push to `main`): `npm audit` (prod, high+), typecheck, unit tests with coverage,
  Edge Function check + tests (Deno), E2E + accessibility on desktop and mobile, link check, Lighthouse budgets.
  Reports uploaded as artifacts.
- **Deploy** (`deploy.yml`, push to `main`): re-runs typecheck + unit tests, builds with repo *Variables*,
  publishes `out/` to `gh-pages`. **Merging to `main` therefore updates the live site.**
  `scripts/deploy-pages.sh` still works for a manual deploy.
- **Production health** (`site-health.yml`, Mondays): every sitemap URL must return 200, and Lighthouse
  budgets are checked against the live site.
- **Dependabot**: weekly npm (grouped minor/patch), monthly Actions.

## Hero 3D

`lib/scene/emberCrystal.ts` (three.js, dynamic import after idle — never on the critical path).
Runs only with WebGL2, viewport ≥ 768 px, ≥ 4 CPU cores, no `prefers-reduced-motion`, no Save-Data
(`lib/scene/capability.ts`); otherwise a CSS "ember in ice" gradient is shown. Pauses off-screen and in hidden tabs.

## Lead capture → Supabase

1. Hosted Supabase project (Canada Central region recommended for the "data in Canada" claim).
2. Run `supabase/schema.sql`, then `supabase/migrations/20261101000000_diagnostic_leads_v2.sql`.
3. Deploy the Edge Function and set its secrets:
   ```bash
   supabase functions deploy diagnostic-lead --no-verify-jwt
   supabase secrets set ALLOWED_ORIGINS=https://konstadinos1.github.io IP_HASH_SALT=$(openssl rand -hex 16)
   # optional fan-out to your outreach pipeline / Slack / n8n:
   supabase secrets set LEAD_WEBHOOK_URL=https://…
   ```
4. Set repo Variable `NEXT_PUBLIC_LEAD_ENDPOINT=https://<project>.supabase.co/functions/v1/diagnostic-lead`.
5. Once live, drop the anon insert policy (see the migration's last comment) so the rate limit can't be bypassed.

The form validates with the same Zod schema as the function (`supabase/functions/_shared/lead-schema.ts`):
Quebec phone numbers normalised to E.164, location bucket, consent required, honeypot, first-touch UTM and
A/B variant attached. Without any endpoint configured, it shows a mailto fallback instead of failing silently.

## Analytics & A/B testing (Law 25)

- Off by default. Set `NEXT_PUBLIC_ANALYTICS_ENDPOINT` (Plausible-compatible, self-host in Canada) to enable.
- **Opt-in** banner (equal Accept/Decline, reopen from the footer). Cookieless; query strings stripped from URLs.
- Events: `pageview`, `cta_click` (with `label`), `lang_switch`, `lead_submit`, `lead_success`, `lead_error`, `lead_invalid`.
  Add tracking to any element with `data-track="event" data-track-label="where"`.
- Hero headline A/B (`lib/experiments.ts`): assigned before first paint (no flicker, no CLS), sticky per
  browser, forced with `?ab_hero=a|b` (QA and campaign landing pages). Variant is attached to events and leads.

## Moving to production

- Custom domain (e.g. `restoboom.ca`): set `NEXT_PUBLIC_SITE_URL`, drop `basePath` in `next.config.mjs`
  and `BASE_PATH` in `lib/site.ts`, add `public/CNAME`. `robots.txt` only takes effect at a domain root.

## Placeholders to resolve before launch

See `docs/copy-deck.md` §Placeholders (legal entity, contact inbox, domain, SLA, cancellation policy,
subprocessors, retention). Privacy/Terms are plain-language drafts **pending lawyer review**.
