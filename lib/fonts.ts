import localFont from "next/font/local";

/**
 * IBM Plex Mono (SIL OFL 1.1) is the single typeface, igloo-style. Self-hosted:
 * no third-party font requests. "optional" avoids a late swap that would
 * repaint the hero text and delay LCP.
 */
export const plexMono = localFont({
  src: [
    { path: "../app/fonts/ibm-plex-mono-latin-400.woff2", weight: "400", style: "normal" },
    { path: "../app/fonts/ibm-plex-mono-latin-500.woff2", weight: "500", style: "normal" },
    { path: "../app/fonts/ibm-plex-mono-latin-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-plex",
  display: "optional",
});
