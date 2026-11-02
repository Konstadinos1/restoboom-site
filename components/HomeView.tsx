import Link from "next/link";
import type { CSSProperties } from "react";
import type { Locale } from "@/lib/i18n";
import { HOME, PRICE_TIERS } from "@/lib/content";
import { faqJsonLd, softwareJsonLd } from "@/lib/seo";
import Faq from "./Faq";
import HeroScene from "./HeroScene";
import JsonLd from "./JsonLd";
import PricingTable from "./PricingTable";

const delay = (ms: number) => ({ "--reveal-delay": ms }) as CSSProperties;
const STAGGER_MS = 90;
const HERO_STAGGER_MS = 70;
/** Timeline steps appear in sequence, fast enough that the panel never reads as empty mid-scroll. */
const TIMELINE_START_MS = 120;
const TIMELINE_STEP_MS = 220;
/** Hero entrance is CSS-only and transform-only: never invisible, so it can't delay LCP. */
const heroIn = (step: number) => ({ animationDelay: `${step * HERO_STAGGER_MS}ms` }) as CSSProperties;

const ROUTES = {
  fr: { diagnostic: "/diagnostic/", pricing: "/tarifs/" },
  en: { diagnostic: "/en/diagnostic/", pricing: "/en/pricing/" },
} as const;

function PhoneIcon() {
  return (
    <svg className="phone-ring mr-2 inline-block size-5 align-[-2px] text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z" />
    </svg>
  );
}

function SectionHead({ kicker, h, p, id, compact = false }: { kicker: string; h: string; p?: string; id: string; compact?: boolean }) {
  return (
    <div className="max-w-3xl">
      <p className="kicker" data-reveal>{kicker}</p>
      <h2 id={id} className={`${compact ? "display-md md:text-5xl" : "display-lg"} mt-5`} data-reveal style={delay(80)}>{h}</h2>
      {p && <p className="lede mt-6" data-reveal style={delay(160)}>{p}</p>}
    </div>
  );
}

function Hero({ locale }: { locale: Locale }) {
  const t = HOME[locale].hero;
  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden pb-16 pt-28 md:items-center md:pb-0" aria-labelledby="hero-h1">
      <HeroScene />
      <div className="wrap relative w-full">
        <p className="kicker hero-in" style={heroIn(0)}>{t.kicker}</p>
        <h1 id="hero-h1" className="display-xl hero-in mt-6 max-w-[14ch]" style={heroIn(1)}>
          <span data-ab-variant="a">{t.h1A}</span>
          <span data-ab-variant="b">{t.h1B}</span>
        </h1>
        <p className="lede hero-in mt-8 max-w-xl" style={heroIn(2)}>{t.sub}</p>
        <div className="hero-in mt-10 flex flex-wrap gap-4" style={heroIn(3)}>
          <Link href={ROUTES[locale].diagnostic} className="btn btn-primary" data-track="cta_click" data-track-label="hero_primary">
            {t.ctaPrimary} <span className="arrow" aria-hidden="true">→</span>
          </Link>
          <Link href="#plateforme" className="btn btn-ghost" data-track="cta_click" data-track-label="hero_secondary">
            {t.ctaSecondary}
          </Link>
        </div>
        <ul className="hero-in mt-14 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-frost" style={heroIn(4)}>
          {t.proof.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span aria-hidden="true" className="text-accent">◆</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="pointer-events-none absolute bottom-8 right-6 hidden items-center gap-3 md:flex md:right-10" aria-hidden="true">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-muted">{t.scroll}</span>
        <span className="scroll-cue relative block h-10 w-px overflow-hidden bg-line" />
      </div>
    </section>
  );
}

function Scene({ locale }: { locale: Locale }) {
  const t = HOME[locale].scene;
  return (
    <section className="section border-t border-line" aria-labelledby="scene-h2">
      <div className="wrap grid items-center gap-14 md:grid-cols-2">
        <div>
          <p className="kicker" data-reveal>{t.kicker}</p>
          <h2 id="scene-h2" className="mt-5 text-[clamp(4.5rem,13vw,10rem)] font-semibold leading-[0.9] tracking-[-0.06em] tabular-nums" data-reveal style={delay(80)}>
            {t.h}
          </h2>
          <p className="lede mt-8 max-w-md" data-reveal style={delay(160)}>{t.p}</p>
          <p className="mt-6 max-w-md text-lg font-semibold text-ember" data-reveal style={delay(240)}>{t.resolve}</p>
        </div>
        <div className="glass ticks relative p-6 md:p-8" data-reveal>
          <ol>
          {t.timeline.map((step, i) => (
            <li key={step.t} className="relative flex gap-5 pb-8 last:pb-0" data-reveal style={delay(TIMELINE_START_MS + i * TIMELINE_STEP_MS)}>
              {i < t.timeline.length - 1 && <span className="absolute left-[7px] top-5 h-full w-px bg-gradient-to-b from-accent/70 to-line" aria-hidden="true" />}
              <span className={`timeline-dot relative mt-1.5 size-[15px] shrink-0 rounded-full ${i === 0 ? "bg-frost/60" : "bg-accent"}`} aria-hidden="true" />
              <div>
                <p className="font-mono text-xs tracking-widest text-muted">{step.t}</p>
                <p className="mt-1 text-xl font-semibold">
                  {i === 0 && <PhoneIcon />}
                  {step.label}
                </p>
                <p className="mt-1 text-muted">{step.detail}</p>
              </div>
            </li>
          ))}
          </ol>
          <p className="mt-6 border-t border-line pt-4 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted">{t.note}</p>
        </div>
      </div>
    </section>
  );
}

function Pains({ locale }: { locale: Locale }) {
  const t = HOME[locale].pains;
  return (
    <section className="section border-t border-line" aria-labelledby="pain-h2">
      <div className="wrap">
        <SectionHead kicker={t.kicker} h={t.h} id="pain-h2" />
        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
          {t.items.map((pain, i) => (
            // The cell keeps its opaque background; only its content fades in. Fading the cell itself
            // exposed the 1px-gap divider colour as a grey slab while cards were revealing.
            <div key={pain.h} className="bg-bg p-8 md:p-10">
              <div data-reveal style={delay(i * STAGGER_MS)}>
                <p className="font-mono text-xs text-accent" aria-hidden="true">0{i + 1}</p>
                <h3 className="display-md mt-4">{pain.h}</h3>
                <p className="mt-3 text-muted">{pain.p}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Platform({ locale }: { locale: Locale }) {
  const t = HOME[locale].platform;
  return (
    <section id="plateforme" className="section scroll-mt-16 border-t border-line" aria-labelledby="platform-h2">
      <div className="wrap">
        <SectionHead kicker={t.kicker} h={t.h} p={t.p} id="platform-h2" />
        <div className="mt-16 space-y-5">
          {t.modules.map((m) => (
            <article key={m.id} id={m.id} className="glass ticks grid gap-8 p-7 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:p-12" data-reveal aria-labelledby={`mod-${m.id}`}>
              <div>
                <p className="flex items-center gap-4 font-mono text-xs uppercase tracking-[0.2em] text-frost">
                  <span className="text-3xl font-semibold tracking-tight text-accent">{m.num}</span>
                  {m.tag}
                </p>
                <h3 id={`mod-${m.id}`} className="display-md mt-6">{m.h}</h3>
              </div>
              <div>
                <p className="text-muted md:text-lg">{m.p}</p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {m.specs.map((spec) => (
                    <li key={spec} className="rounded-full border border-line-strong bg-bg/40 px-3.5 py-1.5 font-mono text-xs text-frost">
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Steps({ locale }: { locale: Locale }) {
  const t = HOME[locale].steps;
  return (
    <section className="section border-t border-line" aria-labelledby="how-h2">
      <div className="wrap">
        <SectionHead kicker={t.kicker} h={t.h} id="how-h2" />
        <ol className="mt-16 grid gap-5 md:grid-cols-3">
          {t.items.map((step, i) => (
            <li key={step.h} className="relative border-t border-line-strong pt-8" data-reveal style={delay(i * 140)}>
              <span className="absolute -top-px left-0 h-px w-16 bg-accent" aria-hidden="true" />
              <p className="font-mono text-xs tracking-widest text-accent">{locale === "fr" ? "ÉTAPE" : "STEP"} 0{i + 1}</p>
              <h3 className="display-md mt-4">{step.h}</h3>
              <p className="mt-3 text-muted">{step.p}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Compliance({ locale }: { locale: Locale }) {
  const t = HOME[locale].compliance;
  return (
    <section id="conformite" className="section scroll-mt-16 border-t border-line" aria-labelledby="compliance-h2">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_80%_30%,rgb(93_137_168_/_0.12),transparent_70%)]" aria-hidden="true" />
      <div className="wrap relative">
        <SectionHead kicker={t.kicker} h={t.h} p={t.p} id="compliance-h2" />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {t.items.map((row, i) => (
            <div key={row.t} className="glass ticks p-7" data-reveal style={delay(i * STAGGER_MS)}>
              <p className="font-mono text-xs text-accent" aria-hidden="true">◆</p>
              <p className="mt-4 text-xl font-semibold">{row.t}</p>
              <p className="mt-2 text-muted">{row.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Samples({ locale }: { locale: Locale }) {
  const t = HOME[locale].samples;
  return (
    <section className="section border-t border-line" aria-labelledby="samples-h2">
      <div className="wrap">
        <SectionHead kicker={t.kicker} h={t.h} id="samples-h2" />
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {t.items.map((s, i) => (
            <figure key={s.label} className="glass flex flex-col p-6" data-reveal style={delay(i * 120)}>
              <figcaption className="flex items-center justify-between gap-3 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted">
                <span>{s.label}</span>
                <span className="rounded-full border border-line-strong px-2 py-0.5 text-frost">{s.channel}</span>
              </figcaption>
              <blockquote className="bubble mt-5 bg-frost/10 p-4 text-ink/90">{s.body}</blockquote>
            </figure>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted">{t.note}</p>
      </div>
    </section>
  );
}

function Pricing({ locale }: { locale: Locale }) {
  const t = HOME[locale].pricing;
  return (
    <section className="section border-t border-line" aria-labelledby="pricing-h2">
      <div className="wrap">
        <SectionHead kicker={t.kicker} h={t.h} p={t.p} id="pricing-h2" />
        <div className="mt-16">
          <PricingTable locale={locale} variant="compact" />
        </div>
        <Link href={ROUTES[locale].pricing} className="mt-6 inline-flex items-center gap-2 font-semibold text-ember underline-offset-4 hover:underline">
          {t.link} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

function Closer({ locale }: { locale: Locale }) {
  const t = HOME[locale].closer;
  return (
    <section className="section relative overflow-hidden border-t border-line" aria-labelledby="closer-h2">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_60%_at_50%_100%,rgb(255_90_54_/_0.22),transparent_70%)]" aria-hidden="true" />
      <div className="wrap relative text-center">
        <h2 id="closer-h2" className="display-lg mx-auto max-w-4xl" data-reveal>{t.h}</h2>
        <p className="lede mx-auto mt-6 max-w-2xl" data-reveal style={delay(100)}>{t.p}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4" data-reveal style={delay(180)}>
          <Link href={ROUTES[locale].diagnostic} className="btn btn-primary" data-track="cta_click" data-track-label="closer_primary">
            {t.cta} <span className="arrow" aria-hidden="true">→</span>
          </Link>
          <Link href={ROUTES[locale].pricing} className="btn btn-ghost" data-track="cta_click" data-track-label="closer_secondary">
            {t.secondary}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomeView({ locale }: { locale: Locale }) {
  const c = HOME[locale];
  return (
    <>
      <JsonLd data={[softwareJsonLd(locale, c.meta.description, PRICE_TIERS), faqJsonLd(c.faq.items)]} />
      <Hero locale={locale} />
      <Scene locale={locale} />
      <Pains locale={locale} />
      <Platform locale={locale} />
      <Steps locale={locale} />
      <Compliance locale={locale} />
      <Samples locale={locale} />
      <Pricing locale={locale} />
      <section className="section border-t border-line" aria-labelledby="faq-h2">
        <div className="wrap grid gap-12 md:grid-cols-[5fr_7fr]">
          <SectionHead kicker={c.faq.kicker} h={c.faq.h} id="faq-h2" compact />
          <Faq items={c.faq.items} />
        </div>
      </section>
      <Closer locale={locale} />
    </>
  );
}
