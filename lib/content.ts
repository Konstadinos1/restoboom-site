/**
 * Home-page copy, FR master / EN mirror. Every factual claim here must map to
 * a row of the claim register in docs/copy-deck.md — no stats, no testimonials.
 */
import type { Locale } from "./i18n";
import type { PriceTier } from "./seo";

export type Block = { h: string; p: string };
export type Module = Block & { num: string; id: string; tag: string; specs: readonly string[] };
export type Sample = { label: string; channel: string; body: string };
export type Faq = { q: string; a: string };
export type TimelineStep = { t: string; label: string; detail: string };

export type HomeContent = {
  meta: { title: string; description: string };
  hero: {
    kicker: string;
    h1A: string;
    h1B: string;
    sub: string;
    ctaPrimary: string;
    ctaSecondary: string;
    proof: readonly string[];
    scroll: string;
  };
  scene: { kicker: string; h: string; p: string; resolve: string; timeline: readonly TimelineStep[]; note: string };
  pains: { kicker: string; h: string; items: readonly Block[] };
  platform: { kicker: string; h: string; p: string; modules: readonly Module[] };
  steps: { kicker: string; h: string; items: readonly Block[] };
  compliance: { kicker: string; h: string; p: string; items: readonly { t: string; d: string }[] };
  samples: { kicker: string; h: string; items: readonly Sample[]; note: string };
  pricing: { kicker: string; h: string; p: string; link: string };
  faq: { kicker: string; h: string; items: readonly Faq[] };
  closer: { h: string; p: string; cta: string; secondary: string };
};

const fr: HomeContent = {
  meta: {
    title: "RestoBoom — Plus aucun appel manqué ne part chez le voisin",
    description:
      "Appel manqué ? Texto en 15 secondes. Avis, relances et habitués pour restaurants du Québec — en français d'abord, données au Canada, conforme LCAP et Loi 25, en CAD.",
  },
  hero: {
    kicker: "Plateforme de croissance · Restaurants du Québec",
    h1A: "Le resto qui répond à tout.",
    h1B: "Appel manqué ? Texto en 15 secondes.",
    sub: "Appels manqués, textos, avis, relances : RestoBoom répond à chaque client pendant que votre équipe reste en service. En français d'abord. Et c'est vous qui approuvez.",
    ctaPrimary: "Obtenir mon diagnostic gratuit",
    ctaSecondary: "Voir la plateforme",
    proof: ["Hébergé au Canada", "LCAP + Loi 25 par conception", "Facturé en CAD"],
    scroll: "Défiler",
  },
  scene: {
    kicker: "Le problème",
    h: "12 h 15.",
    p: "Le téléphone sonne en plein rush. Personne ne peut décrocher. À 12 h 16, le trio commande ailleurs.",
    resolve: "Avec RestoBoom, le client reçoit un texto en 15 secondes. Avec le lien pour commander.",
    timeline: [
      { t: "12:15:00", label: "Appel manqué", detail: "Le rush. Personne ne décroche." },
      { t: "12:15:15", label: "Texto envoyé", detail: "Menu et lien de commande, en français." },
      { t: "12:15:40", label: "Le client répond", detail: "La conversation arrive dans votre boîte." },
    ],
    note: "Scénario illustratif.",
  },
  pains: {
    kicker: "Ce qui fuit",
    h: "Quatre fuites. Pendant chaque service.",
    items: [
      { h: "Le téléphone, c'est le rush.", p: "Chaque appel manqué pendant le service est une commande qui part chez le voisin." },
      { h: "Les avis attendent.", p: "Un avis sans réponse, c'est un client qui parle dans le vide. Vous y répondrez après le service — peut-être." },
      { h: "Les relances ne partent jamais.", p: "Les habitués absents depuis 60 jours, personne n'a le temps de les rappeler un par un." },
      { h: "Les habitués sont des inconnus.", p: "Vos données de caisse savent qui dépense et qui disparaît. Rien n'en sort." },
    ],
  },
  platform: {
    kicker: "La plateforme",
    h: "Tout ce qui répond, dans une seule boîte.",
    p: "Quatre modules, un seul tarif par adresse. Tout est inclus partout.",
    modules: [
      {
        num: "01",
        id: "reception",
        tag: "Réception",
        h: "La réception qui ne ferme jamais.",
        p: "Texto, courriel, Messenger, Instagram, clavardage : toutes les conversations dans une seule boîte, par adresse. Appel manqué ? Texto en 15 secondes, dans la langue du client. La réception automatisée répond aux heures, à l'adresse, au menu — jour et nuit — et se présente comme automatisée, d'entrée de jeu.",
        specs: ["Texto après appel manqué en 15 s", "5 canaux, une boîte", "« ARRET » respecté à la lettre"],
      },
      {
        num: "02",
        id: "avis",
        tag: "Avis",
        h: "Chaque avis mérite une réponse.",
        p: "Après la commande, RestoBoom demande l'avis. Chaque client reçoit le lien Google, peu importe la note. Un avis serré ? Le gérant est alerté. Une réponse à publier ? L'ébauche est rédigée, vous approuvez.",
        specs: ["Demande d'avis après commande", "Réponses suggérées, vous approuvez", "Aucun filtrage d'avis"],
      },
      {
        num: "03",
        id: "relances",
        tag: "Relances",
        h: "Les relances partent seules. Au bon moment.",
        p: "Souper d'équipe, anniversaire, client absent depuis 60 jours : des séquences qui partent dans les heures permises et s'arrêtent net dès que le client écrit « ARRET ».",
        specs: ["Heures de paix 21 h à 9 h", "Désabonnement immédiat", "Consentement vérifié avant chaque envoi"],
      },
      {
        num: "04",
        id: "habitues",
        tag: "Habitués",
        h: "Connaissez vos habitués comme un serveur de quartier.",
        p: "Dépense à vie, dernière visite, étiquettes : chaque client a une fiche, alimentée par vos données de caisse. Et des listes qui trouvent les VIP partis depuis 30 jours en une recherche.",
        specs: ["Importation CSV dès le premier jour", "Fiches alimentées par la caisse", "Listes intelligentes"],
      },
    ],
  },
  steps: {
    kicker: "Comment ça marche",
    h: "Trois étapes. Puis le service continue.",
    items: [
      { h: "On branche.", p: "Votre numéro reste le même. On connecte vos canaux et on importe vos clients par CSV, dès le premier jour." },
      { h: "RestoBoom répond.", p: "Appel manqué pendant le rush ? Texto en 15 secondes. La réception automatisée couvre les heures, l'adresse, le menu — jour et nuit." },
      { h: "Vous approuvez.", p: "Avis et relances restent des ébauches jusqu'à votre approbation. Consentement vérifié, heures de paix respectées, 21 h à 9 h." },
    ],
  },
  compliance: {
    kicker: "Conformité",
    h: "Conforme par conception. Pas en petits caractères.",
    p: "Vos données et celles de vos clients restent au Canada. Aucun envoi sans consentement, désabonnement immédiat : STOP, ARRET, peu importe le mot. Les droits de la Loi 25 — accès, rectification, suppression — sont des fonctions du produit.",
    items: [
      { t: "Données au Canada", d: "Hébergement canadien, flux tiers listés." },
      { t: "LCAP / CASL", d: "Consentement tracé avant chaque envoi." },
      { t: "Loi 25", d: "Accès, correction, suppression : intégrés." },
    ],
  },
  samples: {
    kicker: "Exemples",
    h: "Ce que RestoBoom écrit pour vous.",
    items: [
      {
        label: "Après un appel manqué",
        channel: "SMS",
        body: "Bonsoir ! Désolé d'avoir manqué votre appel — le menu et la commande en ligne sont ici : [lien]. Répondez ARRET pour ne plus recevoir de messages.",
      },
      {
        label: "Réponse à un avis 2 étoiles",
        channel: "Google · ébauche",
        body: "Merci d'avoir pris le temps de nous écrire, et désolé que ce soir-là n'ait pas été à la hauteur. Ce n'est pas notre standard. Passez au resto ou écrivez-moi directement. — [Prénom], gérant",
      },
      {
        label: "Client absent depuis 60 jours",
        channel: "SMS · relance",
        body: "Bonsoir [Prénom] ! Ça fait un bout. Votre table vous attend — ce samedi, le trio est de retour : [lien]",
      },
    ],
    note: "Exemples illustratifs, aucun message réel. Les ébauches partent seulement après votre approbation.",
  },
  pricing: {
    kicker: "Tarifs",
    h: "Trois tarifs. En dollars canadiens.",
    p: "Le prix suit vos adresses, pas vos fonctionnalités.",
    link: "Tous les détails des tarifs",
  },
  faq: {
    kicker: "Questions",
    h: "Les questions qu'on nous pose.",
    items: [
      { q: "Mon numéro de téléphone change-t-il ?", a: "Non. Votre numéro reste le même. On connecte vos canaux autour." },
      { q: "L'automatisation se cache-t-elle ?", a: "Non. La réception automatisée se présente comme automatisée, d'entrée de jeu." },
      { q: "Où sont hébergées mes données ?", a: "Au Canada. Hébergement canadien, flux tiers listés." },
      { q: "Et le consentement pour les textos ?", a: "Aucun envoi sans consentement vérifié. STOP ou ARRET, et c'est immédiat. Heures de paix : 21 h à 9 h." },
      { q: "Filtrez-vous les avis Google ?", a: "Non. Chaque client reçoit le lien Google, peu importe la note." },
      { q: "Qui approuve ce qui part ?", a: "Vous. Les réponses aux avis et les relances restent des ébauches jusqu'à votre approbation." },
      { q: "Et si mon client écrit en anglais ?", a: "Le texto après appel manqué part dans la langue du client. Français d'abord, anglais quand il le faut." },
    ],
  },
  closer: {
    h: "Votre prochain appel manqué devient une conversation.",
    p: "Diagnostic gratuit : on regarde votre fiche Google, votre menu en ligne et vos avis. Trois constats concrets, 30 minutes, pas de diapositives.",
    cta: "Obtenir mon diagnostic gratuit",
    secondary: "Voir les tarifs",
  },
};

const en: HomeContent = {
  meta: {
    title: "RestoBoom — No missed call goes to the place next door",
    description:
      "Missed call? Texted back in 15 seconds. Reviews, follow-ups and regulars for Québec restaurants — French first, data in Canada, CASL and Law 25 compliant, priced in CAD.",
  },
  hero: {
    kicker: "Growth platform · Québec restaurants",
    h1A: "The restaurant that answers everything.",
    h1B: "Missed call? Texted back in 15 seconds.",
    sub: "Missed calls, texts, reviews, follow-ups: RestoBoom answers every guest while your team stays in service. French first. And you approve what goes out.",
    ctaPrimary: "Get my free diagnostic",
    ctaSecondary: "See the platform",
    proof: ["Hosted in Canada", "CASL + Law 25 by design", "Priced in CAD"],
    scroll: "Scroll",
  },
  scene: {
    kicker: "The problem",
    h: "12:15.",
    p: "The phone rings mid-rush. Nobody can pick up. At 12:16, the order goes somewhere else.",
    resolve: "With RestoBoom, the guest gets a text in 15 seconds. With the link to order.",
    timeline: [
      { t: "12:15:00", label: "Missed call", detail: "The rush. Nobody picks up." },
      { t: "12:15:15", label: "Text sent", detail: "Menu and order link, in their language." },
      { t: "12:15:40", label: "Guest replies", detail: "The conversation lands in your inbox." },
    ],
    note: "Illustrative scenario.",
  },
  pains: {
    kicker: "What leaks",
    h: "Four leaks. Every service.",
    items: [
      { h: "The phone is the rush.", p: "Every missed call during service is an order that goes to the place next door." },
      { h: "Reviews wait.", p: "An unanswered review is a guest talking into the void. You'll answer after service — maybe." },
      { h: "Follow-ups never send.", p: "Regulars you haven't seen in 60 days — nobody has time to call them one by one." },
      { h: "Regulars are strangers.", p: "Your POS data knows who spends and who disappears. Nothing comes of it." },
    ],
  },
  platform: {
    kicker: "The platform",
    h: "Everything that answers, in one inbox.",
    p: "Four modules, one price per location. Everything included everywhere.",
    modules: [
      {
        num: "01",
        id: "front-desk",
        tag: "Front desk",
        h: "A front desk that never closes.",
        p: "SMS, email, Messenger, Instagram, web chat: every conversation in one inbox per location. Missed call? A text goes back in 15 seconds, in the guest's language. The automated front desk answers hours, address and menu questions, day and night — and says it's automated, first thing.",
        specs: ["Missed-call text in 15 s", "5 channels, one inbox", "“STOP” respected to the letter"],
      },
      {
        num: "02",
        id: "reviews",
        tag: "Reviews",
        h: "Every review deserves an answer.",
        p: "After the order, RestoBoom asks for the review. Every guest gets the Google link, whatever the rating. A tough review? The manager is alerted. A reply to post? The draft is written, you approve.",
        specs: ["Review request after every order", "Suggested replies, you approve", "No review gating"],
      },
      {
        num: "03",
        id: "follow-ups",
        tag: "Follow-ups",
        h: "Follow-ups send themselves. On time.",
        p: "Team dinner, birthday, a guest gone 60 days: sequences that go out within permitted hours and stop dead the moment a guest texts “STOP”.",
        specs: ["Quiet hours 9 pm to 9 am", "Instant unsubscribe", "Consent checked before every send"],
      },
      {
        num: "04",
        id: "regulars",
        tag: "Regulars",
        h: "Know your regulars like a neighbourhood server.",
        p: "Lifetime spend, last visit, tags: every guest has a profile, fed by your POS data. And smart lists that find the VIPs gone for 30 days in one search.",
        specs: ["CSV import from day one", "POS-fed profiles", "Smart lists"],
      },
    ],
  },
  steps: {
    kicker: "How it works",
    h: "Three steps. Then service goes on.",
    items: [
      { h: "We plug in.", p: "Your number stays the same. We connect your channels and import your guests by CSV, from day one." },
      { h: "RestoBoom answers.", p: "Missed call mid-rush? A text in 15 seconds. The automated front desk covers hours, address and menu — day and night." },
      { h: "You approve.", p: "Reviews and follow-ups stay drafts until you approve them. Consent checked, quiet hours respected, 9 pm to 9 am." },
    ],
  },
  compliance: {
    kicker: "Compliance",
    h: "Compliant by design. Not in the fine print.",
    p: "Your data and your guests' data stay in Canada. No send without consent, instant unsubscribe: STOP, ARRET, whatever the word. Law 25 rights — access, correction, deletion — are product features.",
    items: [
      { t: "Data in Canada", d: "Canadian hosting, third-party flows listed." },
      { t: "CASL / LCAP", d: "Consent logged before every send." },
      { t: "Law 25", d: "Access, correction, deletion: built in." },
    ],
  },
  samples: {
    kicker: "Examples",
    h: "What RestoBoom writes for you.",
    items: [
      {
        label: "After a missed call",
        channel: "SMS",
        body: "Good evening! Sorry we missed your call — the menu and online ordering are here: [link]. Reply STOP to stop receiving messages.",
      },
      {
        label: "Reply to a 2-star review",
        channel: "Google · draft",
        body: "Thanks for taking the time to write, and sorry that night fell short. That's not our standard. Drop by or write to me directly. — [First name], manager",
      },
      {
        label: "Guest gone 60 days",
        channel: "SMS · follow-up",
        body: "Hi [First name]! It's been a while. Your table's waiting — this Saturday, the combo is back: [link]",
      },
    ],
    note: "Illustrative examples, no real messages. Drafts only go out after you approve them.",
  },
  pricing: {
    kicker: "Pricing",
    h: "Three plans. In Canadian dollars.",
    p: "The price follows your locations, not your features.",
    link: "Full pricing details",
  },
  faq: {
    kicker: "Questions",
    h: "The questions we get asked.",
    items: [
      { q: "Does my phone number change?", a: "No. Your number stays the same. We connect your channels around it." },
      { q: "Does the automation hide?", a: "No. The automated front desk says it's automated, first thing." },
      { q: "Where is my data hosted?", a: "In Canada. Canadian hosting, third-party flows listed." },
      { q: "What about consent for texts?", a: "Nothing sends without verified consent. STOP or ARRET, and it's immediate. Quiet hours: 9 pm to 9 am." },
      { q: "Do you filter Google reviews?", a: "No. Every guest gets the Google link, whatever the rating." },
      { q: "Who approves what goes out?", a: "You do. Review replies and follow-ups stay drafts until you approve them." },
      { q: "What if my guest writes in French?", a: "The missed-call text goes out in the guest's language. French first, English when needed." },
    ],
  },
  closer: {
    h: "Your next missed call becomes a conversation.",
    p: "Free diagnostic: we look at your Google profile, your online menu and your reviews. Three concrete findings, 30 minutes, no slide deck.",
    cta: "Get my free diagnostic",
    secondary: "See pricing",
  },
};

const NBSP = "\u00a0";

/**
 * French typography: the space before ? ! : ; and inside « » must never break,
 * or a lone "?" wraps onto its own line on phones.
 */
export function frenchNonBreakingSpaces(text: string): string {
  return text.replace(/ ([?!:;»])/g, `${NBSP}$1`).replace(/« /g, `«${NBSP}`);
}

function deepMapStrings<T>(value: T, fn: (s: string) => string): T {
  if (typeof value === "string") return fn(value) as T;
  if (Array.isArray(value)) return value.map((v) => deepMapStrings(v, fn)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deepMapStrings(v, fn)])) as T;
  }
  return value;
}

export const HOME: Record<Locale, HomeContent> = { fr: deepMapStrings(fr, frenchNonBreakingSpaces), en };

export const PRICE_TIERS: readonly (PriceTier & { id: string; scope: Record<Locale, string> })[] = [
  { id: "solo", name: "Solo", monthlyCad: 149, setupCad: 499, description: "One location", scope: { fr: "Une adresse", en: "One location" } },
  { id: "multi", name: "Multi", monthlyCad: 449, setupCad: 1499, description: "Up to 5 locations", scope: { fr: "Jusqu'à 5 adresses", en: "Up to 5 locations" } },
  { id: "franchise", name: "Franchise", monthlyCad: 1299, setupCad: 4999, description: "Your network, your brand", scope: { fr: "Votre réseau, votre marque", en: "Your network, your brand" } },
];

/** Quebec FR: "1 299 $" (narrow no-break space thousands, $ after). EN-CA: "$1,299". */
export function formatCad(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(amount);
}
