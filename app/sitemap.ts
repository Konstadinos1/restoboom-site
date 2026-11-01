import type { MetadataRoute } from "next";
import { absoluteUrl, ROUTE_PAIRS } from "@/lib/site";

export const dynamic = "force-static";

/** Both locales listed, each with fr-CA / en-CA / x-default alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTE_PAIRS.flatMap((pair) => {
    const languages = { "fr-CA": absoluteUrl(pair.fr), "en-CA": absoluteUrl(pair.en), "x-default": absoluteUrl(pair.fr) };
    return [pair.fr, pair.en].map((path) => ({
      url: absoluteUrl(path),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: pair.priority,
      alternates: { languages },
    }));
  });
}
