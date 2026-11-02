import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  locale: "fr",
  path: "/conditions/",
  title: "Conditions",
  description:
    "Conditions d'utilisation du site et du service RestoBoom.",
});

const SECTIONS: { h: string; body: React.ReactNode }[] = [
  {
    h: "1. Objet",
    body: "Les présentes conditions régissent l'utilisation du site restoboom.ca [PLACEHOLDER — domaine à confirmer] et du service RestoBoom : plateforme de croissance pour restaurants (réception, avis, relances, habitués).",
  },
  {
    h: "2. Le service",
    body: "RestoBoom répond aux clients par texto, courriel, Messenger, Instagram et clavardage, demande les avis après commande, suggère des réponses et des relances, et tient les fiches clients. Les ébauches d'avis et de relances ne partent qu'après votre approbation. La réception automatisée se présente comme automatisée.",
  },
  {
    h: "3. Tarifs et facturation",
    body: "Facturation mensuelle en dollars canadiens. TPS et TVQ en sus. Frais d'installation ponctuels selon le tarif choisi. Textos inclus par palier ; surplus facturés au segment.",
  },
  {
    h: "4. Résiliation",
    body: "[PLACEHOLDER — politique de résiliation à confirmer : préavis, remboursement au prorata ou non.]",
  },
  {
    h: "5. Consentements",
    body: "Vous êtes responsable d'obtenir le consentement requis pour contacter vos clients (LCAP). Le service vérifie et trace le consentement avant chaque envoi et respecte immédiatement STOP et ARRET.",
  },
  {
    h: "6. Vos données",
    body: "Vos données et celles de vos clients restent les vôtres. Hébergement au Canada. Droits d'accès, de rectification et de suppression intégrés au produit (Loi 25).",
  },
  {
    h: "7. Utilisation acceptable",
    body: "Pas d'envoi sans consentement, pas de contenus illégaux, pas de contournement des heures de paix ou des désabonnements.",
  },
  {
    h: "8. Responsabilité",
    body: "Le service est fourni avec diligence, sans garantie de résultats commerciaux (commandes, avis, revenus). Rien ici ne limite ce qui ne peut l'être par la loi. [FAIRE VALIDER.]",
  },
  {
    h: "9. Droit applicable",
    body: "Les présentes conditions sont régies par les lois du Québec et du Canada. Tout litige relève des tribunaux du district judiciaire de Laval. [PLACEHOLDER — district à confirmer]",
  },
  {
    h: "10. Contact",
    body: "[PLACEHOLDER — entité légale], bonjour@restoboom.ca. Dernière mise à jour : [PLACEHOLDER — date].",
  },
];

export default function ConditionsPage() {
  return (
    <section className="wrap max-w-3xl pb-20 pt-32 md:pb-28 md:pt-40" aria-labelledby="terms-h1">
      <p className="kicker">Conditions</p>
      <h1 id="terms-h1" className="display-lg mt-4">
        Conditions d&apos;utilisation.
      </h1>
      <p className="glass mt-6 p-4 text-sm text-muted">
        [FAIRE VALIDER PAR UN JURISTE AVANT LANCEMENT — ébauche en langage clair.]
      </p>
      <div className="mt-12 space-y-10">
        {SECTIONS.map((s) => (
          <div key={s.h}>
            <h2 className="text-xl font-bold">{s.h}</h2>
            <p className="mt-2 text-muted">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
