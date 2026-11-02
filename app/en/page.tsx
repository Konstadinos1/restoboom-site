import HomeView from "@/components/HomeView";
import { HOME } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ locale: "en", path: "/en/", title: HOME.en.meta.title, description: HOME.en.meta.description, absoluteTitle: true });

export default function EnHomePage() {
  return <HomeView locale="en" />;
}
