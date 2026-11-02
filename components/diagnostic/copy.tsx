import Link from "next/link";

/** All diagnostic-form strings, FR master / EN mirror. */
export const FORM_COPY = {
  fr: {
    fields: {
      name: { label: "Nom complet", ph: "Ex. Julie Tremblay" },
      email: { label: "Courriel", ph: "julie@votre-resto.ca" },
      restaurant: { label: "Nom du restaurant", ph: "Ex. Resto du Coin" },
      phone: { label: "Téléphone", ph: "(514) 555-0123", hint: "Facultatif — pour vous rappeler." },
      locations: { label: "Nombre d'adresses", options: { "1": "Une adresse", "2-5": "2 à 5 adresses", "6+": "6 adresses et plus" }, ph: "Choisir…" },
      website_url: { label: "Site web ou fiche Google", ph: "https://… (facultatif)" },
    },
    consent: (
      <>
        J&apos;accepte d&apos;être contacté au sujet de ma demande. Désabonnement en tout temps.{" "}
        <Link href="/confidentialite/" className="text-frost underline underline-offset-4">Confidentialité</Link>.
      </>
    ),
    errors: {
      required: "Champ requis.",
      email: "Vérifiez l'adresse courriel.",
      phone: "Numéro à 10 chiffres, ex. (514) 555-0123.",
      url: "Adresse web complète, ex. https://votre-resto.ca",
      consent: "Votre accord est requis pour qu'on vous réponde.",
      summary: "Corrigez les champs indiqués.",
    },
    submit: "Envoyer ma demande",
    sending: "Envoi…",
    success: { h: "Merci, c'est reçu.", p: "On regarde votre fiche Google, votre menu en ligne et vos avis, puis on vous écrit dans les 2 jours ouvrables." },
    failure: {
      rate_limited: "Trop de demandes en peu de temps. Réessayez dans quelques minutes ou écrivez-nous :",
      generic: "Quelque chose n'a pas marché. Réessayez ou écrivez-nous :",
      not_configured: "Le formulaire n'est pas encore branché. Écrivez-nous directement :",
    },
    mailSubject: "Demande de diagnostic gratuit",
    note: "Vos données restent au Canada. Elles servent à répondre à votre demande, rien d'autre.",
    requiredLegend: "* champ requis",
  },
  en: {
    fields: {
      name: { label: "Full name", ph: "e.g. Julie Tremblay" },
      email: { label: "Email", ph: "julie@yourresto.ca" },
      restaurant: { label: "Restaurant name", ph: "e.g. Corner Resto" },
      phone: { label: "Phone", ph: "(514) 555-0123", hint: "Optional — so we can call you back." },
      locations: { label: "Number of locations", options: { "1": "One location", "2-5": "2 to 5 locations", "6+": "6 or more" }, ph: "Choose…" },
      website_url: { label: "Website or Google profile", ph: "https://… (optional)" },
    },
    consent: (
      <>
        I agree to be contacted about my request. Unsubscribe anytime.{" "}
        <Link href="/en/privacy/" className="text-frost underline underline-offset-4">Privacy</Link>.
      </>
    ),
    errors: {
      required: "Required field.",
      email: "Please check the email address.",
      phone: "10-digit number, e.g. (514) 555-0123.",
      url: "Full web address, e.g. https://yourresto.ca",
      consent: "We need your consent to reply.",
      summary: "Please fix the highlighted fields.",
    },
    submit: "Send my request",
    sending: "Sending…",
    success: { h: "Thanks, it's in.", p: "We'll look at your Google profile, online menu and reviews, then write within 2 business days." },
    failure: {
      rate_limited: "Too many requests in a short time. Try again in a few minutes or write to us:",
      generic: "Something went wrong. Try again or write to us:",
      not_configured: "The form isn't connected yet. Write to us directly:",
    },
    mailSubject: "Free diagnostic request",
    note: "Your data stays in Canada. It's used to answer your request, nothing else.",
    requiredLegend: "* required field",
  },
} as const;

export type FormCopy = (typeof FORM_COPY)[keyof typeof FORM_COPY];
