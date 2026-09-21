import type { Metadata } from "next";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.shreeshyamint.com";

export const siteMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Shree Shyam International | Pharmaceutical Exporter from India",
    template: "%s | Shree Shyam International",
  },
  description:
    "Shree Shyam International is an India-based pharmaceutical exporter supplying generic and branded pharmaceutical products to international markets.",
  keywords: [
    "pharmaceutical exporter India",
    "medicine exporter India",
    "generic medicine exporter",
    "pharmaceutical wholesale supplier",
    "pharmaceutical distributor",
    "Indian pharmaceutical export",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Shree Shyam International",
    title: "Shree Shyam International | Pharmaceutical Exporter from India",
    description:
      "Generic and branded pharmaceutical products for international markets.",
    url: siteUrl,
  },
  robots: { index: true, follow: true },
};

export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: `${siteUrl}${path}` },
  };
}
