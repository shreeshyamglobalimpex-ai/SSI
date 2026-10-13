import { Hero } from "@/components/sections/hero";
import { HomeSections } from "@/components/sections/home-sections";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Pharmaceutical Exporter from India",
  "Shree Shyam International supplies generic and branded pharmaceutical products from India to international markets.",
  "/",
);

export default function HomePage() {
  return (
    <>
      <Hero />
      <HomeSections />
    </>
  );
}
