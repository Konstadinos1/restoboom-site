import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { HOME, PRICE_TIERS } from "@/lib/content";
import { faqJsonLd, softwareJsonLd } from "@/lib/seo";
import type { StationId } from "@/lib/world/stations";
import Faq from "./Faq";
import JsonLd from "./JsonLd";
import PricingTable from "./PricingTable";
import WorldCanvas from "./world/WorldCanvas";
import HudBottom from "./world/HudBottom";

const delay = (ms: number) => ({ "--reveal-delay": ms }) as CSSProperties;
const HERO_STAGGER_MS = 70;
/** Hero entrance is CSS-only and transform-only: never invisible, so it can't delay LCP. */
const heroIn = (step: number) => ({ animationDelay: `${step * HERO_STAGGER_MS}ms` }) as CSSProperties;

const ROUTES = {
  fr: { diagnostic: "/diagnostic/", pricing: "/tarifs/" },
  en: { diagnostic: "/en/diagnostic/", pricing: "/en/pricing/" },
} as const;

type StationProps = {
  id: StationId;
  labelledBy: string;
  children: ReactNode;
  anchor?: string;
  side?: "left" | "right";
  sticky?: boolean;
  height?: string;
};

/** A home section the 3D camera travels through; its HUD panel stays put (sticky) while the camera moves. */
function Station({ id, labelledBy, children, anchor, side = "left", sticky = true, height }: StationProps) {
  const style = height ? ({ "--station-h": height } as CSSProperties) : undefined;
  return (
    <section id={anchor} data-station={id} aria-labelledby={labelledBy} className="station scroll-mt-0" style={style}>
      <div className={`wrap station-inner station-inner--${side} ${sticky ? "station-inner--sticky" : ""}`}>{children}</div>
    </section>
  );
}

function Hero({ locale }: { locale: Locale }) {
  const t = HOME[locale].hero;
  return (
    <Station id="hero" labelledBy="hero-h1" height="210svh">
      <div className="station-fade hero-copy self-end pb-24 md:pb-20" style={{ width: "min(100%, 42rem)" }}>
        <p className="kicker hero-in" style={heroIn(0)}>{t.kicker}</p>
        <h1 id="hero-h1" className="display-xl hero-in mt-5" style={heroIn(1)}>
          <span data-ab-variant="a">{t.h1A}</span>
          <span data-ab-variant="b">{t.h1B}</span>
        </h1>
        <p className="lede hero-in mt-6 max-w-lg" style={heroIn(2)}>{t.sub}</p>
        <div className="hero-in mt-8 flex flex-wrap gap-3" style={heroIn(3)}>
          <Link href={ROUTES[locale].diagnostic} className="btn btn-primary" data-track="cta_click" data-track-label="hero_primary">
            {t.ctaPrimary} <span className="arrow" aria-hidden="true">→</span>
          </Link>
          <Link href="#plateforme" className="btn btn-ghost" data-track="cta_click" data-track-label="hero_secondary">
            {t.ctaSecondary}
          </Link>
        </div>
        <ul className="hero-in mt-7 flex flex-wrap gap-1.5" style={heroIn(4)}>
          {t.proof.map((item) => (
            <li key={item} className="hud-label hud-label--light">{item}</li>
          ))}
        </ul>
      </div>
    </Station>
  );
}

function Scene({ locale }: { locale: Locale }) {
  const t = HOME[locale].scene;
  return (
    <Station id="scene" labelledBy="scene-h2">
      <div className="station-panel station-fade glass ticks p-6 md:p-8" data-reveal>
        <p className="kicker">{t.kicker}</p>
        <h2 id="scene-h2" className="mt-4 text-[clamp(3.2rem,9vw,6.4rem)] font-medium leading-none tracking-[-0.08em] text-slate tabular-nums">{t.h}</h2>
        <p className="lede mt-5">{t.p}</p>
        <p className="mt-4 font-medium text-ember">{t.resolve}</p>
        <ol className="mt-6 space-y-3 border-t border-line pt-5">
          {t.timeline.map((step) => (
            <li key={step.t} className="grid grid-cols-[auto_1fr] items-baseline gap-x-3 gap-y-0.5">
              <span className="hud-label tabular-nums">{step.t}</span>
              <span className="font-medium text-slate">{step.label}</span>
              <span className="col-start-2 text-sm text-muted">{step.detail}</span>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-[0.66rem] uppercase tracking-[0.14em] text-muted">{t.note}</p>
      </div>
    </Station>
  );
}

function Pains({ locale }: { locale: Locale }) {
  const t = HOME[locale].pains;
  return (
    <Station id="pains" labelledBy="pain-h2" side="right">
      <div className="station-panel station-fade glass ticks p-6 md:p-8" data-reveal>
        <p className="kicker">{t.kicker}</p>
        <h2 id="pain-h2" className="display-lg mt-4">{t.h}</h2>
        <ol className="mt-6 divide-y divide-line border-y border-line">
          {t.items.map((pain, i) => (
            <li key={pain.h} className="grid grid-cols-[auto_1fr] gap-x-4 py-4">
              <span className="hud-label hud-label--accent mt-0.5 h-fit">{`0${i + 1}`}</span>
              <div>
                <h3 className="font-medium text-slate">{pain.h}</h3>
                <p className="mt-1 text-sm text-muted">{pain.p}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Station>
  );
}

function Platform({ locale }: { locale: Locale }) {
  const t = HOME[locale].platform;
  return (
    <Station id="platform" anchor="plateforme" labelledBy="platform-h2" sticky={false} height="230svh">
      <div className="station-panel glass ticks p-6 md:p-8" data-reveal>
        <p className="kicker">{t.kicker}</p>
        <h2 id="platform-h2" className="display-lg mt-4">{t.h}</h2>
        <p className="lede mt-4">{t.p}</p>
      </div>
      <div className="mt-[40svh] grid gap-4 md:grid-cols-2 md:gap-5">
        {t.modules.map((m, i) => (
          <article key={m.id} id={m.id} className="glass ticks p-6 md:p-7" data-reveal style={delay(i * 80)} aria-labelledby={`mod-${m.id}`}>
            <p className="flex flex-wrap items-center gap-1.5">
              <span className="hud-label">{`MODULE_${m.num}`}</span>
              <span className="hud-label hud-label--light">{m.tag}</span>
            </p>
            <h3 id={`mod-${m.id}`} className="display-md mt-4">{m.h}</h3>
            <p className="mt-3 text-sm text-muted">{m.p}</p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {m.specs.map((spec) => (
                <li key={spec} className="border border-line-strong bg-white/60 px-2 py-1 text-[0.7rem] text-frost">{spec}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Station>
  );
}

function Steps({ locale }: { locale: Locale }) {
  const t = HOME[locale].steps;
  return (
    <Station id="steps" labelledBy="how-h2" side="right">
      <div className="station-panel station-fade glass ticks p-6 md:p-8" data-reveal>
        <p className="kicker">{t.kicker}</p>
        <h2 id="how-h2" className="display-lg mt-4">{t.h}</h2>
        <ol className="mt-6 space-y-5">
          {t.items.map((step, i) => (
            <li key={step.h} className="border-l-2 border-accent pl-4">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-accent">{`${locale === "fr" ? "Étape" : "Step"} 0${i + 1}`}</p>
              <h3 className="display-md mt-1">{step.h}</h3>
              <p className="mt-1 text-sm text-muted">{step.p}</p>
            </li>
          ))}
        </ol>
      </div>
    </Station>
  );
}

function Compliance({ locale }: { locale: Locale }) {
  const t = HOME[locale].compliance;
  return (
    <Station id="compliance" anchor="conformite" labelledBy="compliance-h2">
      <div className="station-panel station-fade glass ticks p-6 md:p-8" data-reveal>
        <p className="kicker">{t.kicker}</p>
        <h2 id="compliance-h2" className="display-lg mt-4">{t.h}</h2>
        <p className="lede mt-4">{t.p}</p>
        <ul className="mt-6 grid gap-2">
          {t.items.map((row) => (
            <li key={row.t} className="flex flex-wrap items-baseline gap-x-3 border-t border-line pt-3">
              <span className="hud-label">{row.t}</span>
              <span className="text-sm text-muted">{row.d}</span>
            </li>
          ))}
        </ul>
      </div>
    </Station>
  );
}

function Samples({ locale }: { locale: Locale }) {
  const t = HOME[locale].samples;
  return (
    <Station id="samples" labelledBy="samples-h2" side="right" sticky={false} height="190svh">
      <div className="station-panel glass ticks p-6 md:p-8" data-reveal>
        <p className="kicker">{t.kicker}</p>
        <h2 id="samples-h2" className="display-lg mt-4">{t.h}</h2>
      </div>
      <div className="mt-[30svh] grid gap-4 md:grid-cols-3">
        {t.items.map((s, i) => (
          <figure key={s.label} className="glass flex flex-col p-5" data-reveal style={delay(i * 100)}>
            <figcaption className="flex flex-wrap items-center justify-between gap-2 text-[0.66rem] uppercase tracking-[0.12em] text-muted">
              <span>{s.label}</span>
              <span className="hud-label">{s.channel}</span>
            </figcaption>
            <blockquote className="bubble mt-4 bg-white p-4 text-sm text-ink">{s.body}</blockquote>
          </figure>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted">{t.note}</p>
    </Station>
  );
}

function Pricing({ locale }: { locale: Locale }) {
  const t = HOME[locale].pricing;
  return (
    <Station id="pricing" labelledBy="pricing-h2" sticky={false} height="200svh">
      <div className="station-panel glass ticks p-6 md:p-8" data-reveal>
        <p className="kicker">{t.kicker}</p>
        <h2 id="pricing-h2" className="display-lg mt-4">{t.h}</h2>
        <p className="lede mt-4">{t.p}</p>
      </div>
      <div className="mt-[30svh]">
        <PricingTable locale={locale} variant="compact" />
        <Link href={ROUTES[locale].pricing} className="hud-label hud-label--light mt-5 inline-block px-3 py-2 text-[0.72rem] hover:bg-slate hover:text-white">
          {t.link} →
        </Link>
      </div>
    </Station>
  );
}

function FaqStation({ locale }: { locale: Locale }) {
  const c = HOME[locale].faq;
  return (
    <Station id="faq" labelledBy="faq-h2" side="right" sticky={false} height="180svh">
      <div className="ml-auto max-w-3xl glass ticks p-6 md:p-8" data-reveal>
        <p className="kicker">{c.kicker}</p>
        <h2 id="faq-h2" className="display-lg mt-4">{c.h}</h2>
        <div className="mt-6">
          <Faq items={c.items} />
        </div>
      </div>
    </Station>
  );
}

function Closer({ locale }: { locale: Locale }) {
  const t = HOME[locale].closer;
  return (
    <Station id="closer" labelledBy="closer-h2" height="190svh">
      {/* No exit fade: the last panel only ever leaves towards the footer, and its CTA must stay fully opaque. */}
      <div className="self-end pb-28" style={{ width: "min(100%, 44rem)" }} data-reveal>
        <h2 id="closer-h2" className="display-lg">{t.h}</h2>
        <p className="lede mt-5 max-w-xl">{t.p}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={ROUTES[locale].diagnostic} className="btn btn-primary" data-track="cta_click" data-track-label="closer_primary">
            {t.cta} <span className="arrow" aria-hidden="true">→</span>
          </Link>
          <Link href={ROUTES[locale].pricing} className="btn btn-ghost" data-track="cta_click" data-track-label="closer_secondary">
            {t.secondary}
          </Link>
        </div>
      </div>
    </Station>
  );
}

export default function HomeView({ locale }: { locale: Locale }) {
  const c = HOME[locale];
  return (
    <>
      <JsonLd data={[softwareJsonLd(locale, c.meta.description, PRICE_TIERS), faqJsonLd(c.faq.items)]} />
      <WorldCanvas />
      <div className="world-content">
        <Hero locale={locale} />
        <Scene locale={locale} />
        <Pains locale={locale} />
        <Platform locale={locale} />
        <Steps locale={locale} />
        <Compliance locale={locale} />
        <Samples locale={locale} />
        <Pricing locale={locale} />
        <FaqStation locale={locale} />
        <Closer locale={locale} />
      </div>
      <HudBottom locale={locale} />
    </>
  );
}
