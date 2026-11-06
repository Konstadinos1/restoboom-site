import Link from "next/link";
import Faq, { type FaqItem } from "@/components/Faq";
import PricingTable from "@/components/PricingTable";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import PageBackdrop from "@/components/PageBackdrop";

export const metadata: Metadata = pageMetadata({
  locale: "fr",
  path: "/tarifs/",
  title: "Tarifs",
  description:
    "Trois tarifs pour restaurants du Québec : Solo 149 $, Multi 449 $, Franchise 1 299 $ par mois, en CAD. TPS et TVQ en sus.",
});

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
        <Link href="/conditions/" className="text-frost underline underline-offset-4">
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
    <>
      <PageBackdrop still="pricing" />
      <section className="page-body wrap pb-20 pt-32 md:pb-28 md:pt-40" aria-labelledby="tarifs-h1">
        <p className="kicker">Tarifs</p>
        <h1 id="tarifs-h1" className="display-lg mt-4 max-w-3xl">
          Trois tarifs. En dollars canadiens.
        </h1>
        <p className="lede mt-6 max-w-2xl">
          Le prix du plan suit vos adresses, pas vos fonctionnalités. Toutes les fonctions — réception,
          avis, relances, habitués — sont incluses partout.
        </p>
        <div className="mt-12">
          <PricingTable locale="fr" variant="full" headingLevel="h2" />
        </div>

        <h2 className="display-lg mt-28">Les questions qu&apos;on nous pose sur les tarifs.</h2>
        <div className="mt-10">
          <Faq items={FAQ_ITEMS} />
        </div>

        <div className="glass ticks mt-20 p-8 md:p-12">
          <h2 className="display-md">Pas sûr ? Parlez à un humain.</h2>
          <Link
            href="/diagnostic/"
            className="btn btn-primary mt-6" data-track="cta_click" data-track-label="pricing_bottom"
          >
            Diagnostic gratuit
          </Link>
        </div>
      </section>
    </>
  );
}
