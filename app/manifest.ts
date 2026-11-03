import type { MetadataRoute } from "next";
import { BASE_PATH } from "@/lib/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RestoBoom",
    short_name: "RestoBoom",
    description: "Le resto qui répond à tout — plateforme de croissance pour restaurants du Québec.",
    start_url: `${BASE_PATH}/`,
    scope: `${BASE_PATH}/`,
    display: "standalone",
    background_color: "#e4e9ef",
    theme_color: "#e4e9ef",
    lang: "fr-CA",
    icons: [
      { src: `${BASE_PATH}/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${BASE_PATH}/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
  };
}
