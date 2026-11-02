import { dotsPath, layoutDots } from "@/lib/world/dotMatrix";

const { dots, cols, rows } = layoutDots("RESTOBOOM.");
// Dots fill the top-left 2/3 of each cell: at the header's 3 px (desktop) or 2 px (phone) per cell,
// every dot then lands on whole pixels and all dots render the same size.
const DOT = 2 / 3;
// Two paths (letters + the accent full stop) instead of ~180 <rect>s: less to hydrate on every page.
const LETTERS = dotsPath(dots.filter((d) => d.char !== "."), DOT, 0);
const FULL_STOP = dotsPath(dots.filter((d) => d.char === "."), DOT, 0);

/** Dot-matrix RESTOBOOM wordmark (same glyphs as the glowing sign on the 3D bistro). */
export default function PixelLogo({ className, label = "RestoBoom" }: { className?: string; label?: string }) {
  return (
    <svg viewBox={`0 0 ${cols} ${rows}`} role="img" aria-label={label} className={className} shapeRendering="crispEdges">
      <path d={LETTERS} fill="currentColor" />
      <path d={FULL_STOP} fill="var(--color-accent)" />
    </svg>
  );
}
