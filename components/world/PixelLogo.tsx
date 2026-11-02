import { dotsPath, layoutDots } from "@/lib/world/dotMatrix";

const { dots, cols, rows } = layoutDots("RESTOBOOM.");
const DOT = 0.82;
// Two paths (letters + the accent full stop) instead of ~180 <rect>s: less to hydrate on every page.
const LETTERS = dotsPath(dots.filter((d) => d.char !== "."), DOT);
const FULL_STOP = dotsPath(dots.filter((d) => d.char === "."), DOT);

/** Dot-matrix RESTOBOOM wordmark (same glyphs as the glowing sign on the 3D bistro). */
export default function PixelLogo({ className, label = "RestoBoom" }: { className?: string; label?: string }) {
  return (
    <svg viewBox={`0 0 ${cols} ${rows}`} role="img" aria-label={label} className={className} shapeRendering="crispEdges">
      <path d={LETTERS} fill="currentColor" />
      <path d={FULL_STOP} fill="var(--color-accent)" />
    </svg>
  );
}
