import type { Metadata, Viewport } from "next";
import "../globals.css";
import SiteShell from "@/components/SiteShell";
import { assetPath, BRAND_NAME, NOINDEX, SITE_URL } from "@/lib/site";
import { HOME } from "@/lib/content";

export const metadata: Metadata = {
  metadataBase: new URL(`${SITE_URL}/`),
  applicationName: BRAND_NAME,
  title: { default: HOME.en.meta.title, template: `%s — ${BRAND_NAME}` },
  description: HOME.en.meta.description,
  icons: { icon: [{ url: assetPath("/favicon.svg"), type: "image/svg+xml" }], apple: assetPath("/apple-touch-icon.png") },
  manifest: assetPath("/manifest.webmanifest"),
  formatDetection: { telephone: false },
  ...(NOINDEX ? { robots: { index: false, follow: false } } : {}),
};

// Matches the fogged page background, so the phone's address bar blends into the HUD.
export const viewport: Viewport = { themeColor: "#e4e9ef", colorScheme: "light" };

export default function EnRootLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell locale="en">{children}</SiteShell>;
}
