import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/store/product-detail";
import {
  getProductBySlug,
  getRelatedProducts,
  getAllProductSlugs,
} from "@/services/product.service";
import { pageMetadata, siteUrl } from "@/lib/seo";

// Statically generate every product page at build time and revalidate in the
// background (ISR) so price/stock stay fresh without a full rebuild.
export const revalidate = 3600;

/** Pre-render a static page for every active product slug. */
export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

/** Rich per-product SEO + social share metadata (Open Graph & Twitter cards). */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };

  const canonical = `/store/${product.slug}`;
  const title = `${product.name} | Shree Shyam International`;
  const description =
    product.description?.slice(0, 155).trim() ||
    `Buy ${product.name} — pharmaceutical export from Shree Shyam International. Enquire for pricing, pack sizes and global delivery.`;

  // Prefer the product image for social cards; fall back to the site banner.
  const imageUrl = product.images.length
    ? `${siteUrl}/api/products/${product.id}/image`
    : `${siteUrl}/banner.webp`;

  return {
    ...pageMetadata(title, description, canonical),
    title: product.name,
    description,
    keywords: [
      product.name,
      product.category.name,
      product.manufacturer,
      product.ingredient,
      "pharmaceutical exporter India",
      "buy medicine bulk export",
    ].filter(Boolean) as string[],
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: "Shree Shyam International",
      title: product.name,
      description,
      url: `${siteUrl}${canonical}`,
      images: [
        { url: imageUrl, width: 1200, height: 630, alt: product.name },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const related = await getRelatedProducts(product.slug, product.category.id, 4);

  const canonical = `${siteUrl}/store/${product.slug}`;

  // Structured data helps search engines show rich product results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    sku: product.sku || undefined,
    category: product.category.name,
    ...(product.manufacturer
      ? { manufacturer: { "@type": "Organization", name: product.manufacturer } }
      : {}),
    brand: { "@type": "Brand", name: "Shree Shyam International" },
    offers: {
      "@type": "Offer",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: canonical,
      ...(product.priceInr
        ? { price: product.priceInr, priceCurrency: "INR" }
        : {}),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} related={related} />
    </>
  );
}

