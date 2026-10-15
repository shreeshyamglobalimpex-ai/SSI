import type { Metadata } from "next";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.shreeshyamint.com";

const defaultOgImage = {
  url: "/banner.webp",
  width: 1200,
  height: 630,
  alt: "Shree Shyam International banner",
};

export const siteMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Shree Shyam International",
  authors: [{ name: "Shree Shyam International" }],
  creator: "Shree Shyam International",
  publisher: "Shree Shyam International",
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
    "pharma export company India",
    "pharmaceutical products exporter",
  ],
  alternates: { canonical: "/" },
  icons: {
    icon: "/logo.webp",
    shortcut: "/logo.webp",
    apple: "/logo.webp",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Shree Shyam International",
    title: "Shree Shyam International | Pharmaceutical Exporter from India",
    description:
      "Generic and branded pharmaceutical products for international markets.",
    url: siteUrl,
    images: [defaultOgImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shree Shyam International | Pharmaceutical Exporter from India",
    description:
      "Generic and branded pharmaceutical products for international markets.",
    images: [defaultOgImage.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
    },
  },
};

export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: `${siteUrl}${path}`,
      images: [defaultOgImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [defaultOgImage.url],
    },
  };
}
