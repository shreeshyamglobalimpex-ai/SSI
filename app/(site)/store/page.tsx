import { db } from '@/lib/db/prisma';
import StoreClient from '@/components/store/store-client';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata(
  'Pharmaceutical Store',
  'Browse pharmaceutical products by category and submit product enquiries.',
  '/store',
);

// Catalogue pages are static-optimised and refreshed in the background so the
// first paint never waits on the database.
export const revalidate = 60;

const INITIAL_PAGE_SIZE = 12;

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  // Deep links from the product detail breadcrumb pass ?category= so the store
  // opens pre-filtered on the right category.
  const { category, q } = await searchParams;

  const [categories, products, total] = await Promise.all([
    db.category.findMany({
      where: { active: true },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    }),
    db.product.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        sku: true,
        manufacturer: true,
        ingredient: true,
        packSizes: true,
        stock: true,
        priceInr: true,
        priceUsd: true,
        category: { select: { id: true, name: true, slug: true } },
        images: { select: { id: true }, orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { name: 'asc' },
      take: INITIAL_PAGE_SIZE,
    }),
    db.product.count({ where: { active: true } }),
  ]);

  const initialProducts = products.map((p) => ({
    ...p,
    priceInr: p.priceInr?.toString() ?? null,
    priceUsd: p.priceUsd?.toString() ?? null,
  }));

  const initialPages = Math.max(1, Math.ceil(total / INITIAL_PAGE_SIZE));

  return (
    <StoreClient
      initialCategories={categories}
      initialProducts={initialProducts}
      initialPageSize={INITIAL_PAGE_SIZE}
      initialTotal={total}
      initialPages={initialPages}
      initialCategory={category ?? ''}
      initialQuery={q ?? ''}
    />
  );
}
