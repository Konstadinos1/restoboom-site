import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confidentialité",
  description: "Comment RestoBoom recueille, utilise et protège vos données. Loi 25.",
  alternates: { canonical: "/confidentialite", languages: { en: "/en/privacy" } },
};

const SECTIONS: { h: string; body: React.ReactNode }[] = [
  {
    h: "1. Qui nous sommes",
    body: "RestoBoom est exploitée par [PLACEHOLDER — entité légale], au Québec.",
  },
  {
    h: "2. Données que nous recueillons",
    body: "Via le formulaire de diagnostic : votre nom, votre courriel, le nom de votre restaurant et l'adresse de votre site ou fiche Google. Via le service : les données clients que vous importez ou connectez (fiches clients, conversations, avis, consentements). Des données techniques minimes (journaux) pour la sécurité et le fonctionnement.",
  },
  {
    h: "3. Pourquoi",
    body: "Répondre à vos demandes. Fournir, maintenir et améliorer le service. Facturer. Aucune vente de données. Aucune publicité.",
  },
  {
    h: "4. Où",
    body: "Au Canada. Hébergement canadien ; les flux vers des tiers (ex. envoi de textos, traitement d'avis) sont listés dans notre document sous-traitants, disponible sur demande. [PLACEHOLDER — liste des sous-traitants]",
  },
  {
    h: "5. Combien de temps",
    body: "Les demandes de diagnostic : [PLACEHOLDER — période, p. ex. 24 mois]. Les données du service : pendant votre abonnement, puis [PLACEHOLDER — période] pour vous permettre de les exporter ou de les supprimer.",
  },
  {
    h: "6. Vos droits (Loi 25)",
    body: "Accès, rectification, suppression, portabilité : écrivez à bonjour@restoboom.ca. On répond dans les 30 jours. Ces droits sont aussi des fonctions du produit.",
  },
  {
    h: "7. Textos et LCAP",
    body: "Aucun envoi commercial sans consentement. STOP ou ARRET, et c'est immédiat. Heures de paix : 21 h à 9 h.",
  },
  {
    h: "8. Cookies",
    body: "Ce site marketing n'utilise aucun traceur publicitaire et ne vend aucune donnée.",
  },
  {
    h: "9. Modifications",
    body: "On publiera toute modification ici, avec sa date.",
  },
  {
    h: "10. Contact",
    body: "[PLACEHOLDER — entité légale], [PLACEHOLDER — adresse], bonjour@restoboom.ca. Dernière mise à jour : [PLACEHOLDER — date].",
  },
];

export default function ConfidentialitePage() {
  return (
    <section className="wrap max-w-3xl py-20 md:py-28" aria-labelledby="privacy-h1">
      <p className="kicker">Confidentialité</p>
      <h1 id="privacy-h1" className="display-lg mt-4">
        Vos données restent vos données.
      </h1>
      <p className="mt-4 rounded border border-accent-deep bg-panel p-4 text-sm text-muted">
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
