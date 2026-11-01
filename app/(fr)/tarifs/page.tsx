import Link from "next/link";
import Faq, { type FaqItem } from "@/components/Faq";
import PricingTable from "@/components/PricingTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "Trois tarifs pour restaurants du Québec : Solo 149 $, Multi 449 $, Franchise 1 299 $ par mois, en CAD. TPS et TVQ en sus.",
  alternates: { canonical: "/tarifs", languages: { en: "/en/pricing" } },
};

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "Les frais d'installation, c'est quoi ?",
    a: "Le branchement de vos canaux, l'importation de vos clients et la configuration de vos scénarios, faits avec vous. Ponctuels.",
  },
  {
    q: "Qu'est-ce qu'une « adresse » ?",
    a: "Un établissement avec son numéro et sa boîte. Un resto, une adresse.",
  },
  {
    q: "Combien de textos sont inclus ?",
    a: "Les textos sont inclus par palier, les surplus facturés au segment. On regarde votre volume réel ensemble avant de choisir.",
  },
  {
    q: "Je peux arrêter quand ?",
    a: (
      <>
        La facturation est mensuelle. Les conditions de résiliation sont dans les{" "}
        <Link href="/conditions" className="text-accent underline underline-offset-4">
          Conditions
        </Link>
        .{" "}
        <span className="text-muted">[PLACEHOLDER — politique de résiliation à confirmer]</span>
      </>
    ),
  },
];

export default function TarifsPage() {
  return (
    <section className="wrap py-20 md:py-28" aria-labelledby="tarifs-h1">
      <p className="kicker">Tarifs</p>
      <h1 id="tarifs-h1" className="display-lg mt-4">
        Trois tarifs. En dollars canadiens.
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted">
        Le prix du plan suit vos adresses, pas vos fonctionnalités. Toutes les fonctions — réception,
        avis, relances, habitués — sont incluses partout.
      </p>
      <div className="mt-12">
        <PricingTable locale="fr" variant="full" />
      </div>

      <h2 className="display-lg mt-24">Les questions qu&apos;on nous pose sur les tarifs.</h2>
      <div className="mt-10">
        <Faq items={FAQ_ITEMS} label="Questions sur les tarifs" />
      </div>

      <div className="mt-20 rounded border border-line bg-panel p-8">
        <h2 className="text-2xl font-bold">Pas sûr ? Parlez à un humain.</h2>
        <Link
          href="/diagnostic"
          className="mt-6 inline-block rounded bg-accent px-6 py-3 text-lg font-bold text-bg hover:bg-accent-deep hover:text-ink"
        >
          Diagnostic gratuit
        </Link>
      </div>
    </section>
  );
}
