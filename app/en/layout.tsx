import type { Metadata } from "next";
import "../globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  metadataBase: new URL("https://konstadinos1.github.io/restoboom-site"),
  title: {
    default: "RestoBoom — The restaurant that answers everything.",
    template: "%s — RestoBoom",
  },
  description:
    "Missed calls, texts, reviews and follow-ups for Québec restaurants. One platform, French first, CASL and Law 25 compliant, priced in CAD.",
  icons: { icon: "/favicon.svg" },
};

export default function EnRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader locale="en" />
        <main id="main">{children}</main>
        <SiteFooter locale="en" />
      </body>
    </html>
  );
}
