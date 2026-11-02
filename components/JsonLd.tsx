import { serializeJsonLd } from "@/lib/seo";

/**
 * Structured data. The payload is built by our own typed builders (never user
 * input) and serializeJsonLd escapes "<", so the inline script can't be broken out of.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
