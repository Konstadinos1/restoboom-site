import DiagnosticForm from "@/components/DiagnosticForm";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import PageBackdrop from "@/components/PageBackdrop";

export const metadata: Metadata = pageMetadata({
  locale: "en",
  path: "/en/diagnostic/",
  title: "Free diagnostic",
  description:
    "Free diagnostic of your online presence: Google profile, menu, reviews. 30 minutes, your real scenarios, no slide deck.",
});

export default function EnDiagnosticPage() {
  return (
    <>
      <PageBackdrop still="home" />
      <section className="page-body wrap pb-20 pt-32 md:pb-28 md:pt-40" aria-labelledby="diagnostic-h1">
        <div className="max-w-3xl">
          <p className="kicker">Free diagnostic</p>
          <h1 id="diagnostic-h1" className="display-lg mt-5">
            Your resto online, gone over properly.
          </h1>
          <p className="lede mt-6">
            Fill in the form. We look at your Google profile, your online menu and your reviews. Then we
            call you back: three concrete findings, 30 minutes, no slide deck.
          </p>
          <p className="mt-4 font-semibold text-ember">
            Free. No commitment. We write back within 2 business days.
            <span className="text-muted"> [PLACEHOLDER — confirm SLA]</span>
          </p>
          <div className="mt-12">
            <DiagnosticForm locale="en" />
          </div>
        </div>
      </section>
    </>
  );
}
