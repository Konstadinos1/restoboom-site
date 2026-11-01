import type { Metadata } from "next";
import "../globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  metadataBase: new URL("https://konstadinos1.github.io/restoboom-site"),
  title: {
    default: "RestoBoom — Le resto qui répond à tout.",
    template: "%s — RestoBoom",
  },
  description:
    "Appels manqués, textos, avis et relances pour restaurants du Québec. Une plateforme, en français d'abord, conforme LCAP et Loi 25, facturée en CAD.",
  icons: { icon: "/favicon.svg" },
};

export default function FrRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <SiteHeader locale="fr" />
        <main id="main">{children}</main>
        <SiteFooter locale="fr" />
      </body>
    </html>
  );
}
