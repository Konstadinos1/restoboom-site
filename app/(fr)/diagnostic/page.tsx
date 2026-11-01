import DiagnosticForm from "@/components/DiagnosticForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diagnostic gratuit",
  description:
    "Diagnostic gratuit de votre présence en ligne : fiche Google, menu, avis. 30 minutes, vos vrais scénarios, pas de diapositives.",
  alternates: { canonical: "/diagnostic", languages: { en: "/en/diagnostic" } },
};

export default function DiagnosticPage() {
  return (
    <section className="wrap max-w-3xl py-20 md:py-28" aria-labelledby="diagnostic-h1">
      <p className="kicker">Diagnostic gratuit</p>
      <h1 id="diagnostic-h1" className="display-lg mt-4">
        Votre resto en ligne, passé au peigne.
      </h1>
      <p className="mt-6 text-lg text-muted">
        Remplissez le formulaire. On regarde votre fiche Google, votre menu en ligne et vos avis. Puis
        on vous rappelle : trois constats concrets, 30 minutes, pas de diapositives.
      </p>
      <p className="mt-4 font-semibold text-accent">
        Gratuit. Sans engagement. On vous écrit sous 2 jours ouvrables.
        <span className="text-muted"> [PLACEHOLDER — confirmer le délai]</span>
      </p>
      <div className="mt-12">
        <DiagnosticForm locale="fr" />
      </div>
    </section>
  );
}
