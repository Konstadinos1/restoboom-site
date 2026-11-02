import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  locale: "en",
  path: "/en/terms/",
  title: "Terms",
  description:
    "Terms of use for the RestoBoom site and service.",
});

const SECTIONS: { h: string; body: string }[] = [
  {
    h: "1. Purpose",
    body: "These terms govern the use of the restoboom.ca website [PLACEHOLDER — domain to confirm] and the RestoBoom service: a growth platform for restaurants (front desk, reviews, follow-ups, regulars).",
  },
  {
    h: "2. The service",
    body: "RestoBoom answers guests by SMS, email, Messenger, Instagram and web chat, requests reviews after orders, suggests replies and follow-ups, and maintains guest profiles. Review and follow-up drafts send only after your approval. The automated front desk discloses that it is automated.",
  },
  {
    h: "3. Pricing and billing",
    body: "Monthly billing in Canadian dollars. GST and QST extra. One-time setup fees depending on the plan. SMS included by tier; overage billed per segment.",
  },
  {
    h: "4. Cancellation",
    body: "[PLACEHOLDER — cancellation policy to confirm: notice, prorated refund or not.]",
  },
  {
    h: "5. Consents",
    body: "You are responsible for obtaining the consent required to contact your guests (CASL). The service verifies and logs consent before every send and honours STOP and ARRET immediately.",
  },
  {
    h: "6. Your data",
    body: "Your data and your guests' data remain yours. Hosting in Canada. Access, correction and deletion rights built into the product (Law 25).",
  },
  {
    h: "7. Acceptable use",
    body: "No sending without consent, no illegal content, no circumventing quiet hours or unsubscribes.",
  },
  {
    h: "8. Liability",
    body: "The service is provided with diligence, with no guarantee of business results (orders, reviews, revenue). Nothing here limits what cannot be limited by law. [TO BE REVIEWED.]",
  },
  {
    h: "9. Governing law",
    body: "These terms are governed by the laws of Québec and Canada. Any dispute falls under the courts of the judicial district of Laval. [PLACEHOLDER — district to confirm]",
  },
  {
    h: "10. Contact",
    body: "[PLACEHOLDER — legal entity], bonjour@restoboom.ca. Last updated: [PLACEHOLDER — date].",
  },
];

export default function EnTermsPage() {
  return (
    <section className="wrap max-w-3xl pb-20 pt-32 md:pb-28 md:pt-40" aria-labelledby="terms-h1">
      <p className="kicker">Terms</p>
      <h1 id="terms-h1" className="display-lg mt-4">
        Terms of use.
      </h1>
      <p className="glass mt-6 p-4 text-sm text-muted">
        [TO BE REVIEWED BY A LAWYER BEFORE LAUNCH — plain-language draft.]
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
