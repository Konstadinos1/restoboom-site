import Link from "next/link";
import Faq, { type FaqItem } from "@/components/Faq";
import PricingTable from "@/components/PricingTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Three plans for Québec restaurants: Solo $149, Multi $449, Franchise $1,299 a month, in CAD. GST and QST extra.",
  alternates: { canonical: "/en/pricing", languages: { fr: "/tarifs" } },
};

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "What are setup fees?",
    a: "Connecting your channels, importing your guests and configuring your scenarios, done with you. One-time.",
  },
  {
    q: "What's a \"location\"?",
    a: "A premises with its own number and inbox. One resto, one location.",
  },
  {
    q: "How many texts are included?",
    a: "SMS is included by tier, overage billed per segment. We look at your real volume together before you pick.",
  },
  {
    q: "Can I stop anytime?",
    a: (
      <>
        Billing is monthly. Cancellation terms are in the{" "}
        <Link href="/en/terms" className="text-accent underline underline-offset-4">
          Terms
        </Link>
        . <span className="text-muted">[PLACEHOLDER — cancellation policy to confirm]</span>
      </>
    ),
  },
];

export default function EnPricingPage() {
  return (
    <section className="wrap py-20 md:py-28" aria-labelledby="pricing-h1">
      <p className="kicker">Pricing</p>
      <h1 id="pricing-h1" className="display-lg mt-4">
        Three plans. In Canadian dollars.
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted">
        The plan follows your locations, not your feature list. Every function — front desk, reviews,
        follow-ups, regulars — is included everywhere.
      </p>
      <div className="mt-12">
        <PricingTable locale="en" variant="full" />
      </div>

      <h2 className="display-lg mt-24">Pricing questions.</h2>
      <div className="mt-10">
        <Faq items={FAQ_ITEMS} label="Pricing questions" />
      </div>

      <div className="mt-20 rounded border border-line bg-panel p-8">
        <h2 className="text-2xl font-bold">Not sure? Talk to a human.</h2>
        <Link
          href="/en/diagnostic"
          className="mt-6 inline-block rounded bg-accent px-6 py-3 text-lg font-bold text-bg hover:bg-accent-deep hover:text-ink"
        >
          Free diagnostic
        </Link>
      </div>
    </section>
  );
}
