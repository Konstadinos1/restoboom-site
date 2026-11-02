import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

/**
 * Note: on a GitHub *project* page this file is served at /restoboom-site/robots.txt,
 * which crawlers ignore; it becomes effective once the site moves to its own domain.
 * The sitemap is also declared via <link> in Search Console for now.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
