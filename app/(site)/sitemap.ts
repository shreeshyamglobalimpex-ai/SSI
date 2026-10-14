import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { db, withDbRetry } from "@/lib/db/prisma";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    { path: "/", priority: 1, changeFrequency: "weekly" as const },
    { path: "/products", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/brands", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/markets", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/store", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/faq", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/privacy-policy", priority: 0.4, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.4, changeFrequency: "yearly" as const },
    { path: "/shipping-policy", priority: 0.4, changeFrequency: "yearly" as const },
  ];

  const staticEntries: MetadataRoute.Sitemap = routes.map(
    ({ path, priority, changeFrequency }) => ({
      url: new URL(path, siteUrl).toString(),
      lastModified: new Date(),
      changeFrequency,
      priority,
    }),
  );

  // Include every active product detail page so they are discoverable.
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await withDbRetry(() =>
      db.product.findMany({
        where: { active: true },
        select: { slug: true, updatedAt: true },
      }),
    );
    productEntries = products.map((p) => ({
      url: new URL(`/store/${p.slug}`, siteUrl).toString(),
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Sitemap product fetch failed:", error);
  }

  return [...staticEntries, ...productEntries];
}
