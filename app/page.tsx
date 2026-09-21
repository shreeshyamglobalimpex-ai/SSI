import { Hero } from "@/components/sections/hero";
import { HomeSections } from "@/components/sections/home-sections";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pharmaceutical Exporter from India",
  description:
    "Shree Shyam International supplies generic and branded pharmaceutical products from India to international markets.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <HomeSections />
    </>
  );
}
