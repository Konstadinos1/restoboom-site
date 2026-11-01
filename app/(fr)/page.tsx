import HomeView from "@/components/HomeView";
import { HOME } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ locale: "fr", path: "/", title: HOME.fr.meta.title, description: HOME.fr.meta.description, absoluteTitle: true });

export default function HomePage() {
  return <HomeView locale="fr" />;
}
