import DiagnosticForm from "@/components/DiagnosticForm";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import PageBackdrop from "@/components/PageBackdrop";

export const metadata: Metadata = pageMetadata({
  locale: "fr",
  path: "/diagnostic/",
  title: "Diagnostic gratuit",
  description:
    "Diagnostic gratuit de votre présence en ligne : fiche Google, menu, avis. 30 minutes, vos vrais scénarios, pas de diapositives.",
});

export default function DiagnosticPage() {
  return (
    <>
      <PageBackdrop still="home" />
      <section className="page-body wrap pb-20 pt-32 md:pb-28 md:pt-40" aria-labelledby="diagnostic-h1">
        <div className="max-w-3xl">
          <p className="kicker">Diagnostic gratuit</p>
          <h1 id="diagnostic-h1" className="display-lg mt-5">
            Votre resto en ligne, passé au peigne.
          </h1>
          <p className="lede mt-6">
            Remplissez le formulaire. On regarde votre fiche Google, votre menu en ligne et vos avis. Puis
            on vous rappelle : trois constats concrets, 30 minutes, pas de diapositives.
          </p>
          <p className="mt-4 font-semibold text-ember">
            Gratuit. Sans engagement. On vous écrit sous 2 jours ouvrables.
            <span className="text-muted"> [PLACEHOLDER — confirmer le délai]</span>
          </p>
          <div className="mt-12">
            <DiagnosticForm locale="fr" />
          </div>
        </div>
      </section>
    </>
  );
}
