import Link from "next/link";
import Faq, { type FaqItem } from "@/components/Faq";
import PricingTable from "@/components/PricingTable";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import PageBackdrop from "@/components/PageBackdrop";

export const metadata: Metadata = pageMetadata({
  locale: "en",
  path: "/en/pricing/",
  title: "Pricing",
  description:
    "Three plans for Québec restaurants: Solo $149, Multi $449, Franchise $1,299 a month, in CAD. GST and QST extra.",
});

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
        <Link href="/en/terms/" className="text-frost underline underline-offset-4">
          Terms
        </Link>
        . <span className="text-muted">[PLACEHOLDER — cancellation policy to confirm]</span>
      </>
    ),
  },
];

export default function EnPricingPage() {
  return (
    <>
      <PageBackdrop still="pricing" />
      <section className="page-body wrap pb-20 pt-32 md:pb-28 md:pt-40" aria-labelledby="pricing-h1">
        <p className="kicker">Pricing</p>
        <h1 id="pricing-h1" className="display-lg mt-4 max-w-3xl">
          Three plans. In Canadian dollars.
        </h1>
        <p className="lede mt-6 max-w-2xl">
          The plan follows your locations, not your feature list. Every function — front desk, reviews,
          follow-ups, regulars — is included everywhere.
        </p>
        <div className="mt-12">
          <PricingTable locale="en" variant="full" headingLevel="h2" />
        </div>

        <h2 className="display-lg mt-28">Pricing questions.</h2>
        <div className="mt-10">
          <Faq items={FAQ_ITEMS} />
        </div>

        <div className="glass ticks mt-20 p-8 md:p-12">
          <h2 className="display-md">Not sure? Talk to a human.</h2>
          <Link
            href="/en/diagnostic/"
            className="btn btn-primary mt-6" data-track="cta_click" data-track-label="pricing_bottom"
          >
            Free diagnostic
          </Link>
        </div>
      </section>
    </>
  );
}
