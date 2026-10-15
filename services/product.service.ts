import { db, withDbRetry } from "@/lib/db/prisma";
import type { Product } from "@/types/product";
import type { StoreProductDetail } from "@/types/api";

export async function getProducts(): Promise<Product[]> {
  const products = await db.product.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      description: true,
      active: true,
      category: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category.name,
    description: product.description,
    active: product.active,
  }));
}

/** Columns shared by the store listing and the product detail page. */
const storeSelect = {
  id: true,
  name: true,
  slug: true,
  sku: true,
  manufacturer: true,
  ingredient: true,
  packSizes: true,
  description: true,
  stock: true,
  priceInr: true,
  priceUsd: true,
  category: { select: { id: true, name: true, slug: true } },
  images: { select: { id: true }, orderBy: { createdAt: "desc" }, take: 1 },
} as const;

/** Serialises Decimal prices to strings so the value can cross to the client. */
function serialise<T extends { priceInr: unknown; priceUsd: unknown }>(p: T) {
  return {
    ...p,
    priceInr: (p.priceInr as { toString(): string } | null)?.toString() ?? null,
    priceUsd: (p.priceUsd as { toString(): string } | null)?.toString() ?? null,
  };
}

/**
 * Fetches a single active product by slug for its detail page.
 * Returns `null` when no such product exists (caller renders not-found).
 */
export async function getProductBySlug(
  slug: string,
): Promise<StoreProductDetail | null> {
  const product = await withDbRetry(() =>
    db.product.findFirst({
      where: { slug, active: true },
      select: storeSelect,
    }),
  );

  return product ? serialise(product) : null;
}

/** Up to `limit` other active products, preferring the same category. */
export async function getRelatedProducts(
  slug: string,
  categoryId: string,
  limit = 4,
): Promise<StoreProductDetail[]> {
  const products = await withDbRetry(() =>
    db.product.findMany({
      where: { active: true, slug: { not: slug }, categoryId },
      select: storeSelect,
      orderBy: { name: "asc" },
      take: limit,
    }),
  );

  return products.map(serialise);
}

/** All active product slugs — used to statically generate detail pages. */
export async function getAllProductSlugs(): Promise<string[]> {
  const products = await withDbRetry(() =>
    db.product.findMany({
      where: { active: true },
      select: { slug: true },
      orderBy: { name: "asc" },
    }),
  );
  return products.map((p) => p.slug);
}
