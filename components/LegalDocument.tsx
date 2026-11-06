import type { ReactNode } from "react";
import PageBackdrop from "./PageBackdrop";

export type LegalSection = { h: string; body: ReactNode };

type LegalDocumentProps = {
  kicker: string;
  title: string;
  titleId: string;
  /** Shown above the text until a lawyer has reviewed it. */
  draftNote: string;
  sections: readonly LegalSection[];
};

/** Privacy policy and terms (FR and EN): the vault still behind the title, the text on one panel. */
export default function LegalDocument({ kicker, title, titleId, draftNote, sections }: LegalDocumentProps) {
  return (
    <>
      <PageBackdrop still="vault" />
      {/* The text column sits inside .wrap (lined up with the header), leaving the right side to the still. */}
      <section className="page-body wrap pb-20 pt-32 md:pb-28 md:pt-40" aria-labelledby={titleId}>
        <div className="max-w-3xl">
          <p className="kicker">{kicker}</p>
          <h1 id={titleId} className="display-lg mt-4">
            {title}
          </h1>
          <p className="mt-6 border-l-2 border-accent bg-white/75 px-4 py-3 text-xs font-medium uppercase tracking-[0.08em] text-ember">{draftNote}</p>
          <div className="glass ticks mt-10 space-y-9 p-6 md:p-10">
            {sections.map((s) => (
              <div key={s.h}>
                <h2 className="display-md">{s.h}</h2>
                <p className="mt-2 text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
