import type { ReactNode } from "react";

export type FaqItem = { q: string; a: ReactNode };

export default function Faq({ items, label }: { items: FaqItem[]; label: string }) {
  return (
    <div className="divide-y divide-line border-y border-line" role="list">
      {items.map((item, i) => (
        <details key={i} className="group py-4" role="listitem">
          <summary className="cursor-pointer list-none text-lg font-semibold marker:hidden">
            <span className="mr-2 font-mono text-sm text-accent" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            {item.q}
          </summary>
          <div className="mt-3 pl-7 text-muted">{item.a}</div>
        </details>
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}
