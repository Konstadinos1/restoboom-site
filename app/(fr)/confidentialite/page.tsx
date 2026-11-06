import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import LegalDocument, { type LegalSection } from "@/components/LegalDocument";

export const metadata: Metadata = pageMetadata({
  locale: "fr",
  path: "/confidentialite/",
  title: "Confidentialité",
  description:
    "Comment RestoBoom recueille, utilise et protège vos données. Loi 25.",
});

const SECTIONS: LegalSection[] = [
  {
    h: "1. Qui nous sommes",
    body: "RestoBoom est exploitée par [PLACEHOLDER — entité légale], au Québec.",
  },
  {
    h: "2. Données que nous recueillons",
    body: "Via le formulaire de diagnostic : votre nom, votre courriel, le nom de votre restaurant et, si vous les donnez, votre téléphone, votre nombre d'adresses et l'adresse de votre site ou fiche Google. On note aussi la provenance de la visite (paramètres UTM d'une campagne) et la version de la page affichée. Via le service : les données clients que vous importez ou connectez (fiches clients, conversations, avis, consentements). Des données techniques minimes (journaux) pour la sécurité et le fonctionnement.",
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
    body: "Ce site marketing n'utilise aucun témoin (cookie) ni traceur publicitaire, et ne vend aucune donnée. Avec votre accord seulement, une mesure d'audience sans témoin compte les visites et les clics, sans vous identifier ; vous pouvez changer d'avis en tout temps depuis le pied de page. Le stockage local du navigateur retient votre choix et la version de page affichée (test A/B).",
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
  return <LegalDocument kicker="Confidentialité" title="Vos données restent vos données." titleId="privacy-h1" draftNote="[FAIRE VALIDER PAR UN JURISTE AVANT LANCEMENT — ébauche en langage clair.]" sections={SECTIONS} />;
}
