import Link from "next/link";
import Faq, { type FaqItem } from "@/components/Faq";
import PricingTable from "@/components/PricingTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RestoBoom — The restaurant that answers everything.",
  description:
    "Missed calls, texts, reviews and follow-ups for Québec restaurants. One platform, French first, CASL and Law 25 compliant, priced in CAD.",
  alternates: { canonical: "/en/", languages: { fr: "/" } },
};

const PAINS = [
  {
    h: "The phone is the rush.",
    p: "Every missed call during service is an order that goes to the place next door.",
  },
  {
    h: "Reviews wait.",
    p: "An unanswered review is a guest talking into the void. You'll answer after service — maybe.",
  },
  {
    h: "Follow-ups never send.",
    p: "Regulars you haven't seen in 60 days — nobody has time to call them one by one.",
  },
  {
    h: "Regulars are strangers.",
    p: "Your POS data knows who spends and who disappears. Nothing comes of it.",
  },
];

const PLATFORM = [
  {
    num: "01",
    id: "front-desk",
    h: "A front desk that never closes.",
    p: "SMS, email, Messenger, Instagram, web chat: every conversation in one inbox per location. Missed call? A text goes back in 15 seconds, in the guest's language. The automated front desk answers hours, address and menu questions, day and night. It says it's automated, first thing.",
    specs: ["Missed-call reply in 15 s", "5 channels, one inbox", "\"STOP\" respected to the letter"],
  },
  {
    num: "02",
    id: "reviews",
    h: "Every review deserves an answer.",
    p: "After the order, RestoBoom asks for the review. Every guest gets the Google link, whatever the rating. A rough one? The manager is alerted and the conversation stays private. A reply to post? The draft is written; you approve it.",
    specs: ["Review request after each order", "Suggested replies, you approve", "No review gating"],
  },
  {
    num: "03",
    id: "follow-ups",
    h: "Follow-ups send themselves. At the right time.",
    p: "Staff night, birthday, a guest absent for 60 days: sequences that send at the right moment, inside permitted hours, and stop the instant a guest texts STOP.",
    specs: ["Quiet hours 9 pm to 9 am", "Instant unsubscribe", "Consent checked before every send"],
  },
  {
    num: "04",
    id: "regulars",
    h: "Know your regulars like a neighbourhood server does.",
    p: "Lifetime spend, last visit, tags: every guest has a profile, fed by your POS data. And lists that find VIPs gone 30 days in one search.",
    specs: ["CSV import from day one", "Profiles fed by your POS", "Smart lists"],
  },
];

const STEPS = [
  {
    h: "We connect.",
    p: "Your number stays the same. We hook up your channels and import your guests by CSV, from day one.",
  },
  {
    h: "RestoBoom answers.",
    p: "Missed call mid-rush? A text goes back in 15 seconds. The automated front desk covers hours, address, menu — day and night.",
  },
  {
    h: "You approve.",
    p: "Reviews and follow-ups: drafts are written, you approve before anything sends. Consent checked, quiet hours respected, 9 pm to 9 am.",
  },
];

const SAMPLES = [
  {
    label: "After a missed call · SMS",
    body: "\"Hi! Sorry we missed your call — the menu and online ordering are right here: [link]. Reply STOP and you won't hear from us again.\"",
  },
  {
    label: "Draft reply to a Google review (2 stars)",
    body: "\"Thanks for taking the time to write, and sorry that night wasn't up to standard. It isn't ours either. I'd like to make it right — drop by or write me directly. — [First name], manager\"",
  },
  {
    label: "Follow-up — guest absent 60 days",
    body: "\"Evening, [First name]! It's been a while. Your table's waiting — this Saturday the trio is back: [link]\"",
  },
];

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "Does the automation hide itself?",
    a: "No. It says it's automated, first thing.",
  },
  {
    q: "Where is my data hosted?",
    a: "In Canada. Canadian hosting, third-party flows listed.",
  },
  {
    q: "What about texting consent?",
    a: "No send without verified consent. STOP or ARRET, and it's instant. Quiet hours: 9 pm to 9 am.",
  },
  {
    q: "Do you filter Google reviews?",
    a: "No. Every guest gets the Google link, whatever the rating.",
  },
  {
    q: "Who approves what goes out?",
    a: "You. Review replies and follow-ups stay drafts until you approve them.",
  },
];

export default function EnHomePage() {
  return (
    <>
      {/* Hero */}
      <section className="wrap py-20 md:py-28" aria-labelledby="hero-h1">
        <p className="kicker">The growth platform for Québec restaurants</p>
        <h1 id="hero-h1" className="display-xl mt-4">
          The restaurant that answers&nbsp;everything.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted">
          Missed calls, texts, reviews, follow-ups: RestoBoom answers every guest, in French first.
          Your team stays in service.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/en/diagnostic"
            className="rounded bg-accent px-6 py-3 text-lg font-bold text-bg hover:bg-accent-deep hover:text-ink"
          >
            Book a demo
          </Link>
          <Link
            href="/#plateforme"
            className="rounded border border-line px-6 py-3 text-lg font-semibold text-ink hover:border-accent"
          >
            See the platform
          </Link>
        </div>
        <p className="mt-8 font-mono text-xs uppercase tracking-widest text-muted">
          Built and hosted in Canada · CASL and Law 25 by design · Priced in CAD
        </p>
      </section>

      {/* Pain */}
      <section className="border-t border-line" aria-labelledby="pain-h2">
        <div className="wrap py-20 md:py-28">
          <p className="kicker">The problem</p>
          <h2 id="pain-h2" className="display-lg mt-4">
            12:15.
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-muted">
            The phone rings mid-rush. Nobody can pick up. At 12:16, the order goes somewhere else.
          </p>
          <p className="mt-6 max-w-2xl text-lg font-semibold text-accent">
            RestoBoom texts back in 15 seconds. With the link to order.
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
          <p className="kicker">The platform</p>
          <h2 id="platform-h2" className="display-lg mt-4">
            Everything that answers, in one inbox.
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
          <p className="kicker">How it works</p>
          <h2 id="how-h2" className="display-lg mt-4">
            Three steps. Then service carries on.
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
          <p className="kicker">Compliance</p>
          <h2 id="compliance-h2" className="display-lg mt-4">
            Compliant by design.
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-muted">
            Your data and your guests&apos; data stay in Canada. No send without consent, and
            unsubscribing is instant: STOP, ARRET, either word. Law 25 rights — access, correction,
            deletion — are product features, not fine print.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { t: "Data in Canada", d: "Canadian hosting, third-party flows listed" },
              { t: "CASL", d: "Consent logged before every send" },
              { t: "Law 25", d: "Access, correction, deletion: built in" },
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
          <p className="kicker">Examples</p>
          <h2 id="samples-h2" className="display-lg mt-4">
            What RestoBoom writes for you.
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
            Illustrative examples, no real messages. Drafts send only after your approval.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-line" aria-labelledby="pricing-h2">
        <div className="wrap py-20 md:py-28">
          <p className="kicker">Pricing</p>
          <h2 id="pricing-h2" className="display-lg mt-4">
            Three plans. In Canadian dollars.
          </h2>
          <div className="mt-12">
            <PricingTable locale="en" variant="compact" />
          </div>
          <Link href="/en/pricing" className="mt-8 inline-block font-semibold text-accent underline underline-offset-4">
            See pricing →
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-line" aria-labelledby="faq-h2">
        <div className="wrap py-20 md:py-28">
          <p className="kicker">Questions</p>
          <h2 id="faq-h2" className="display-lg mt-4">
            What people ask us.
          </h2>
          <div className="mt-10">
            <Faq items={FAQ_ITEMS} label="Frequently asked questions" />
          </div>
        </div>
      </section>

      {/* Closer */}
      <section className="border-t border-line" aria-labelledby="closer-h2">
        <div className="wrap py-20 md:py-28">
          <h2 id="closer-h2" className="display-lg">
            Your next missed call becomes an order.
          </h2>
          <p className="mt-6 text-lg text-muted">30 minutes. Your real scenarios. No slide deck.</p>
          <Link
            href="/en/diagnostic"
            className="mt-8 inline-block rounded bg-accent px-6 py-3 text-lg font-bold text-bg hover:bg-accent-deep hover:text-ink"
          >
            Book a demo
          </Link>
        </div>
      </section>
    </>
  );
}
