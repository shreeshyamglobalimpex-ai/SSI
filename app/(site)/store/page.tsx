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

const INITIAL_PAGE_SIZE = 48;

export default async function StorePage() {
  const [categories, products] = await Promise.all([
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
        stock: true,
        price: true,
        category: { select: { id: true, name: true, slug: true } },
        images: { select: { id: true }, orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { name: 'asc' },
      take: INITIAL_PAGE_SIZE,
    }),
  ]);

  const initialProducts = products.map((p) => ({
    ...p,
    price: p.price?.toString() ?? null,
  }));

  return (
    <StoreClient
      initialCategories={categories}
      initialProducts={initialProducts}
      initialPageSize={INITIAL_PAGE_SIZE}
    />
  );
}
