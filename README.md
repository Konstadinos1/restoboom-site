# RestoBoom — marketing site (test deployment)

Next.js 15 (App Router, static export) + Tailwind v4. French at `/`, English at `/en/`.
Live test site: https://konstadinos1.github.io/restoboom-site/

Copy deck: `docs/copy-deck.md` (authoritative — FR master, EN mirror, claim register, placeholder list).

## Pages

| FR | EN |
|---|---|
| `/` | `/en/` |
| `/tarifs/` | `/en/pricing/` |
| `/diagnostic/` | `/en/diagnostic/` |
| `/confidentialite/` | `/en/privacy/` |
| `/conditions/` | `/en/terms/` |

404 fallback: `public/404.html` (GitHub Pages serves it for unknown routes).

## Local development

```bash
npm install
cp .env.example .env.local   # fill in hosted Supabase URL + anon key (optional for dev)
npm run dev
```

## Diagnostic form → Supabase

1. Create a **hosted** Supabase project (the local 127.0.0.1 stack won't work for Pages).
2. Run `supabase/schema.sql` in that project's SQL editor. It creates `diagnostic_leads`
   with RLS: **anon may INSERT, never SELECT** — leads are write-only from the browser.
3. Put the project URL + **anon** key into `.env.local` (never the service-role key —
   it must never ship to the client).
4. Rebuild and redeploy.

Until keys are set, the form shows its fallback state (contact email) instead of failing silently.

## Deploy to GitHub Pages

```bash
bash scripts/deploy-pages.sh
```

Builds `out/` and force-pushes it to the `gh-pages` branch. GitHub Pages serves that branch
(root, `/`), with `basePath: /restoboom-site` from `next.config.mjs` matching the project-page URL.

First time only: repo Settings → Pages → Source: "Deploy from a branch" → `gh-pages` / `(root)`
(or the deploy script's push plus the API call does it — see below).

## Moving to production later

- Point Pages at a custom domain (e.g. `restoboom.ca`) by removing `basePath` and adding a CNAME file.
- Or deploy the same repo to Vercel (zero config). For a server-side lead pipeline, swap the
  client-side insert for a Route Handler using `SUPABASE_SERVICE_ROLE_KEY` as a server-only env var.

## Placeholders to resolve before launch

See `docs/copy-deck.md` §Placeholders: legal entity, contact email, domain, response SLA,
cancellation policy, subprocessor list, retention periods, OG image, judicial district.
Privacy/Terms are plain-language drafts **pending lawyer review**.
