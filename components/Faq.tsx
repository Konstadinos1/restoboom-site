import type { ReactNode } from "react";

export type FaqItem = { q: string; a: ReactNode };

export default function Faq({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => (
        <details key={item.q} className="group py-2" data-reveal style={{ "--reveal-delay": i * 60 } as React.CSSProperties}>
          <summary className="flex cursor-pointer list-none items-center gap-5 py-4 text-base font-medium text-slate md:text-lg">
            <span className="font-mono text-xs text-accent" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="flex-1">{item.q}</span>
            <span className="faq-icon grid size-7 shrink-0 place-items-center border border-line-strong bg-white/60 font-mono text-base text-frost" aria-hidden="true">
              +
            </span>
          </summary>
          <div className="pb-5 pl-10 pr-12 text-muted">{item.a}</div>
        </details>
      ))}
    </div>
  );
}
