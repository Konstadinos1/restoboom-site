import DiagnosticForm from "@/components/DiagnosticForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free diagnostic",
  description:
    "Free diagnostic of your online presence: Google profile, menu, reviews. 30 minutes, your real scenarios, no slide deck.",
  alternates: { canonical: "/en/diagnostic", languages: { fr: "/diagnostic" } },
};

export default function EnDiagnosticPage() {
  return (
    <section className="wrap max-w-3xl py-20 md:py-28" aria-labelledby="diagnostic-h1">
      <p className="kicker">Free diagnostic</p>
      <h1 id="diagnostic-h1" className="display-lg mt-4">
        Your resto online, gone over properly.
      </h1>
      <p className="mt-6 text-lg text-muted">
        Fill in the form. We look at your Google profile, your online menu and your reviews. Then we
        call you back: three concrete findings, 30 minutes, no slide deck.
      </p>
      <p className="mt-4 font-semibold text-accent">
        Free. No commitment. We write back within 2 business days.
        <span className="text-muted"> [PLACEHOLDER — confirm SLA]</span>
      </p>
      <div className="mt-12">
        <DiagnosticForm locale="en" />
      </div>
    </section>
  );
}
