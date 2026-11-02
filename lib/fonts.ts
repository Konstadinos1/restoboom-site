import localFont from "next/font/local";

/** Self-hosted variable fonts (SIL OFL 1.1): no third-party font requests, preloaded, size-adjusted fallback. */
export const displayFont = localFont({
  src: "../app/fonts/bricolage-grotesque-latin-wght.woff2",
  variable: "--font-display",
  weight: "200 800",
  // "optional": the preloaded font is used if it arrives within ~100 ms, otherwise the
  // size-adjusted fallback stays for this page view. No late swap → no repaint → better LCP/CLS.
  display: "optional",
});

export const monoFont = localFont({
  src: "../app/fonts/jetbrains-mono-latin-wght.woff2",
  variable: "--font-code",
  weight: "100 800",
  display: "swap",
  preload: false,
});
