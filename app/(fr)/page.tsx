import Link from "next/link";
import Faq, { type FaqItem } from "@/components/Faq";
import PricingTable from "@/components/PricingTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RestoBoom — Le resto qui répond à tout.",
  description:
    "Appels manqués, textos, avis et relances pour restaurants du Québec. Une plateforme, en français d'abord, conforme LCAP et Loi 25, facturée en CAD.",
  alternates: { canonical: "/", languages: { en: "/en/" } },
};

const PAINS = [
  {
    h: "Le téléphone, c'est le rush.",
    p: "Chaque appel manqué pendant le service est une commande qui part chez le voisin.",
  },
  {
    h: "Les avis attendent.",
    p: "Un avis sans réponse, c'est un client qui parle dans le vide. Vous y répondrez après le service — peut-être.",
  },
  {
    h: "Les relances ne partent jamais.",
    p: "Les habitués qu'on n'a pas vus depuis 60 jours, personne n'a le temps de les rappeler un par un.",
  },
  {
    h: "Les habitués sont des inconnus.",
    p: "Vos données de caisse savent qui dépense et qui disparaît. Rien n'en sort.",
  },
];

const PLATFORM = [
  {
    num: "01",
    id: "reception",
    h: "La réception qui ne ferme jamais.",
    p: "Texto, courriel, Messenger, Instagram, clavardage : toutes les conversations dans une seule boîte, par adresse. Appel manqué ? Réponse texte en 15 secondes, dans la langue du client. La réception automatisée répond aux heures, à l'adresse, au menu — jour et nuit. Elle se présente comme automatisée, d'entrée de jeu.",
    specs: ["Réponse aux appels manqués en 15 s", "5 canaux, une boîte", "« ARRET » respecté à la lettre"],
  },
  {
    num: "02",
    id: "avis",
    h: "Chaque avis mérite une réponse.",
    p: "Après la commande, RestoBoom demande l'avis. Chaque client reçoit le lien Google, peu importe la note. Un avis serré ? Le gérant est alerté, la conversation reste privée. Une réponse à publier ? L'ébauche est rédigée, vous approuvez.",
    specs: ["Demande d'avis après commande", "Réponses suggérées, vous approuvez", "Aucun filtrage d'avis"],
  },
  {
    num: "03",
    id: "relances",
    h: "Les relances partent seules. Au bon moment.",
    p: "Souper d'équipe, anniversaire, client absent depuis 60 jours : des séquences qui partent au bon moment, dans les heures permises, et s'arrêtent net dès que le client écrit « ARRET ».",
    specs: ["Heures de paix 21 h à 9 h", "Désabonnement immédiat", "Consentement vérifié avant chaque envoi"],
  },
  {
    num: "04",
    id: "habitués",
    h: "Connaissez vos habitués comme un serveur de quartier.",
    p: "Dépense à vie, dernière visite, étiquettes : chaque client a une fiche, alimentée par vos données de caisse. Et des listes qui trouvent les VIP partis depuis 30 jours en une recherche.",
    specs: ["Importation CSV dès le premier jour", "Profils alimentés par la caisse", "Listes intelligentes"],
  },
];

const STEPS = [
  {
    h: "On branche.",
    p: "Votre numéro reste le même. On connecte vos canaux et on importe vos clients par CSV, dès le premier jour.",
  },
  {
    h: "RestoBoom répond.",
    p: "Appel manqué pendant le rush ? Réponse texto en 15 secondes. La réception automatisée couvre les heures, l'adresse, le menu — jour et nuit.",
  },
  {
    h: "Vous approuvez.",
    p: "Avis et relances : les ébauches sont rédigées, vous approuvez avant que ça parte. Le consentement est vérifié, les heures de paix respectées, 21 h à 9 h.",
  },
];

const SAMPLES = [
  {
    label: "Après un appel manqué · SMS",
    body: "« Bonsoir ! Désolé d'avoir manqué votre appel — le menu et la commande en ligne sont ici : [lien]. Répondez ARRET pour ne plus recevoir de messages. »",
  },
  {
    label: "Ébauche de réponse à un avis Google (2 étoiles)",
    body: "« Merci d'avoir pris le temps de nous écrire, et désolé que ce soir-là n'ait pas été à la hauteur. Ce n'est pas notre standard. J'aimerais en parler — passez au resto ou écrivez-moi directement. — [Prénom], gérant »",
  },
  {
    label: "Relance — client absent depuis 60 jours",
    body: "« Bonsoir [Prénom] ! Ça fait un bout. Votre table vous attend — ce samedi, le trio est de retour : [lien] »",
  },
];

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "L'automatisation se cache-t-elle ?",
    a: "Non. Elle se présente comme automatisée, d'entrée de jeu.",
  },
  {
    q: "Où sont hébergées mes données ?",
    a: "Au Canada. Hébergement canadien, flux tiers listés.",
  },
  {
    q: "Et le consentement pour les textos ?",
    a: "Aucun envoi sans consentement vérifié. STOP ou ARRET, et c'est immédiat. Heures de paix : 21 h à 9 h.",
  },
  {
    q: "Filtrez-vous les avis Google ?",
    a: "Non. Chaque client reçoit le lien Google, peu importe la note.",
  },
  {
    q: "Qui approuve ce qui part ?",
    a: "Vous. Les réponses aux avis et les relances restent des ébauches jusqu'à votre approbation.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="wrap py-20 md:py-28" aria-labelledby="hero-h1">
        <p className="kicker">Plateforme de croissance pour restaurants du Québec</p>
        <h1 id="hero-h1" className="display-xl mt-4">
          Le resto qui répond à&nbsp;tout.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted">
          Appels manqués, textos, avis, relances : RestoBoom répond à chaque client, en français
          d&apos;abord. Votre équipe reste en service.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/diagnostic"
            className="rounded bg-accent px-6 py-3 text-lg font-bold text-bg hover:bg-accent-deep hover:text-ink"
          >
            Réserver une démo
          </Link>
          <Link
            href="/#plateforme"
            className="rounded border border-line px-6 py-3 text-lg font-semibold text-ink hover:border-accent"
          >
            Voir la plateforme
          </Link>
        </div>
        <p className="mt-8 font-mono text-xs uppercase tracking-widest text-muted">
          Conçu et hébergé au Canada · LCAP et Loi 25 par conception · Facturé en dollars canadiens
        </p>
      </section>

      {/* Pain */}
      <section className="border-t border-line" aria-labelledby="pain-h2">
        <div className="wrap py-20 md:py-28">
          <p className="kicker">Le problème</p>
          <h2 id="pain-h2" className="display-lg mt-4">
            12&nbsp;h&nbsp;15.
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-muted">
            Le téléphone sonne en plein rush. Personne ne peut décrocher. À 12&nbsp;h&nbsp;16, le trio
            commande ailleurs.
          </p>
          <p className="mt-6 max-w-2xl text-lg font-semibold text-accent">
            RestoBoom envoie un texto en 15 secondes. Avec le lien pour commander.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {PAINS.map((pain) => (
              <div key={pain.h} className="rounded border border-line bg-panel p-6">
                <h3 className="text-lg font-bold">{pain.h}</h3>
                <p className="mt-2 text-muted">{pain.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform */}
      <section id="plateforme" className="border-t border-line scroll-mt-20" aria-labelledby="platform-h2">
        <div className="wrap py-20 md:py-28">
          <p className="kicker">La plateforme</p>
          <h2 id="platform-h2" className="display-lg mt-4">
            Tout ce qui répond, dans une seule boîte.
          </h2>
          <div className="mt-12 space-y-12">
            {PLATFORM.map((block) => (
              <div key={block.id} className="grid gap-6 border-t border-line pt-10 md:grid-cols-[auto_1fr_1fr] md:gap-10">
                <p className="font-mono text-2xl text-accent" aria-hidden="true">
                  {block.num}
                </p>
                <div>
                  <h3 className="text-2xl font-bold leading-snug">{block.h}</h3>
                </div>
                <div>
                  <p className="text-muted">{block.p}</p>
                  <ul className="mt-4 space-y-1 font-mono text-sm text-muted">
                    {block.specs.map((spec) => (
                      <li key={spec}>
                        <span aria-hidden="true" className="mr-2 text-accent">
                          ·
                        </span>
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-line" aria-labelledby="how-h2">
        <div className="wrap py-20 md:py-28">
          <p className="kicker">Comment ça marche</p>
          <h2 id="how-h2" className="display-lg mt-4">
            Trois étapes. Puis le service continue.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.h} className="rounded border border-line bg-panel p-6">
                <p className="font-mono text-sm text-accent" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-xl font-bold">{step.h}</h3>
                <p className="mt-2 text-muted">{step.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section id="conformite" className="border-t border-line scroll-mt-20" aria-labelledby="compliance-h2">
        <div className="wrap py-20 md:py-28">
          <p className="kicker">Conformité</p>
          <h2 id="compliance-h2" className="display-lg mt-4">
            Conforme par conception.
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-muted">
            Vos données et celles de vos clients restent au Canada. Aucun envoi sans consentement, et le
            désabonnement est immédiat : STOP, ARRET, peu importe le mot. Les droits prévus par la Loi 25
            — accès, rectification, suppression — sont des fonctions du produit, pas une promesse en petits
            caractères.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { t: "Données au Canada", d: "Hébergement canadien, flux tiers listés" },
              { t: "LCAP / CASL", d: "Consentement tracé avant chaque envoi" },
              { t: "Loi 25 / Law 25", d: "Accès, correction, suppression : intégrés" },
            ].map((row) => (
              <div key={row.t} className="rounded border border-line bg-panel p-5">
                <p className="font-bold">{row.t}</p>
                <p className="mt-1 text-sm text-muted">{row.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Samples */}
      <section className="border-t border-line" aria-labelledby="samples-h2">
        <div className="wrap py-20 md:py-28">
          <p className="kicker">Exemples</p>
          <h2 id="samples-h2" className="display-lg mt-4">
            Ce que RestoBoom écrit pour vous.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {SAMPLES.map((sample) => (
              <figure key={sample.label} className="rounded border border-line bg-panel p-6">
                <figcaption className="font-mono text-xs uppercase tracking-widest text-muted">
                  {sample.label}
                </figcaption>
                <blockquote className="mt-4 text-muted">{sample.body}</blockquote>
              </figure>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted">
            Exemples illustratifs, aucun message réel. Les ébauches partent seulement après votre
            approbation.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-line" aria-labelledby="pricing-h2">
        <div className="wrap py-20 md:py-28">
          <p className="kicker">Tarifs</p>
          <h2 id="pricing-h2" className="display-lg mt-4">
            Trois tarifs. En dollars canadiens.
          </h2>
          <div className="mt-12">
            <PricingTable locale="fr" variant="compact" />
          </div>
          <Link href="/tarifs" className="mt-8 inline-block font-semibold text-accent underline underline-offset-4">
            Voir les tarifs →
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-line" aria-labelledby="faq-h2">
        <div className="wrap py-20 md:py-28">
          <p className="kicker">Questions</p>
          <h2 id="faq-h2" className="display-lg mt-4">
            Les questions qu&apos;on nous pose.
          </h2>
          <div className="mt-10">
            <Faq items={FAQ_ITEMS} label="Questions fréquentes" />
          </div>
        </div>
      </section>

      {/* Closer */}
      <section className="border-t border-line" aria-labelledby="closer-h2">
        <div className="wrap py-20 md:py-28">
          <h2 id="closer-h2" className="display-lg">
            Votre prochain appel manqué devient une commande.
          </h2>
          <p className="mt-6 text-lg text-muted">30 minutes. Vos vrais scénarios. Pas de diapositives.</p>
          <Link
            href="/diagnostic"
            className="mt-8 inline-block rounded bg-accent px-6 py-3 text-lg font-bold text-bg hover:bg-accent-deep hover:text-ink"
          >
            Réserver une démo
          </Link>
        </div>
      </section>
    </>
  );
}
