import type { Locale } from "../i18n";
import type { StationId } from "./stations";

/** HUD labels for each station (top-left "////// 03 — PLATEFORME"). */
export const STATION_LABELS: Record<Locale, Record<StationId, string>> = {
  fr: { hero: "Accueil", scene: "12 h 15", pains: "Fuites", platform: "Plateforme", steps: "Étapes", compliance: "Conformité", samples: "Exemples", pricing: "Tarifs", faq: "Questions", closer: "Diagnostic" },
  en: { hero: "Home", scene: "12:15", pains: "Leaks", platform: "Platform", steps: "Steps", compliance: "Compliance", samples: "Examples", pricing: "Pricing", faq: "Questions", closer: "Diagnostic" },
};
