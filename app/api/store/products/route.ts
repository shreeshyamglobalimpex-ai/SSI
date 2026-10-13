import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db/prisma';
import { parseBoundedInt } from '@/lib/utils/pagination';

// Search results depend on query params, so this route is always dynamic.
// CDN caching is handled per-response via the Cache-Control header below.
export async function GET(req: Request) {
  try {
    const u = new URL(req.url);
    const q = (u.searchParams.get('q') || '').trim().slice(0, 120);
    const category = (u.searchParams.get('category') || '').trim().slice(0, 100);
    const page = parseBoundedInt(u.searchParams.get('page'), 1, 1, 1000);
    const pageSize = parseBoundedInt(u.searchParams.get('pageSize'), 12, 1, 48);

    const where: Prisma.ProductWhereInput = {
      active: true,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(category ? { category: { slug: category } } : {}),
    };

    const [items, total] = await db.$transaction([
      db.product.findMany({
        where,
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
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: items,
        total,
        page,
        pageSize,
        pages: Math.ceil(total / pageSize),
      },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } },
    );
  } catch (error) {
    console.error('Store products fetch failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to load products.' },
      { status: 500 },
    );
  }
}
