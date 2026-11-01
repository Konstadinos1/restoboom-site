/**
 * POST /functions/v1/diagnostic-lead — server-side lead intake for the static site.
 *
 * Deploy: supabase functions deploy diagnostic-lead --no-verify-jwt
 * Secrets: ALLOWED_ORIGINS, IP_HASH_SALT, LEAD_WEBHOOK_URL (optional)
 * Logic lives in handler.ts so it can be tested without a running server.
 */
import { handleLeadRequest } from "./handler.ts";

Deno.serve(handleLeadRequest);
