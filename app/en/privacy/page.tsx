import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import LegalDocument, { type LegalSection } from "@/components/LegalDocument";

export const metadata: Metadata = pageMetadata({
  locale: "en",
  path: "/en/privacy/",
  title: "Privacy",
  description:
    "How RestoBoom collects, uses and protects your data. Law 25.",
});

const SECTIONS: LegalSection[] = [
  { h: "1. Who we are", body: "RestoBoom is operated by [PLACEHOLDER — legal entity], in Québec, Canada." },
  {
    h: "2. Data we collect",
    body: "Through the diagnostic form: your name, your email, your restaurant's name, and — if you provide them — your phone, your number of locations and the address of your website or Google profile. We also record where the visit came from (campaign UTM parameters) and which page version you saw. Through the service: guest data you import or connect (guest profiles, conversations, reviews, consents). Minimal technical data (logs) for security and operation.",
  },
  {
    h: "3. Why",
    body: "To answer your requests. To provide, maintain and improve the service. To bill. No data sales. No advertising.",
  },
  {
    h: "4. Where",
    body: "In Canada. Canadian hosting; flows to third parties (e.g. text messaging, review processing) are listed in our subprocessor document, available on request. [PLACEHOLDER — subprocessor list]",
  },
  {
    h: "5. How long",
    body: "Diagnostic requests: [PLACEHOLDER — period, e.g. 24 months]. Service data: for the life of your subscription, then [PLACEHOLDER — period] so you can export or delete it.",
  },
  {
    h: "6. Your rights (Law 25)",
    body: "Access, correction, deletion, portability: write to bonjour@restoboom.ca. We answer within 30 days. These rights are also product features.",
  },
  {
    h: "7. Texts and CASL",
    body: "No commercial message without consent. STOP or ARRET, and it's instant. Quiet hours: 9 pm to 9 am.",
  },
  {
    h: "8. Cookies",
    body: "This marketing site uses no cookies and no advertising trackers, and sells no data. Only with your consent, cookieless audience measurement counts visits and clicks without identifying you; you can change your mind anytime from the footer. Your browser's local storage keeps your choice and which page version you saw (A/B test).",
  },
  { h: "9. Changes", body: "Any change will be published here, with its date." },
  {
    h: "10. Contact",
    body: "[PLACEHOLDER — legal entity], [PLACEHOLDER — address], bonjour@restoboom.ca. Last updated: [PLACEHOLDER — date].",
  },
];

export default function EnPrivacyPage() {
  return <LegalDocument kicker="Privacy" title="Your data stays your data." titleId="privacy-h1" draftNote="[TO BE REVIEWED BY A LAWYER BEFORE LAUNCH — plain-language draft.]" sections={SECTIONS} />;
}
