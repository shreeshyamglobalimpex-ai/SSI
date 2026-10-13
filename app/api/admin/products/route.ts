import { NextResponse } from 'next/server';
import { db } from '@/lib/db/prisma';
import { getAdmin } from '@/lib/auth/admin';
import { productCreateSchema } from '@/lib/validations/admin';
import { uniqueSlug } from '@/lib/utils/slug';
import { parseBoundedInt } from '@/lib/utils/pagination';
import { notifyLowStock } from '@/services/notification.service';

export async function GET(req: Request) {
  if (!(await getAdmin()))
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );

  try {
    const u = new URL(req.url);
    const q = (u.searchParams.get('q') || '').trim().slice(0, 120);
    const page = parseBoundedInt(u.searchParams.get('page'), 1, 1, 5000);
    const take = 20;

    const where = q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' as const } },
            { sku: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [items, total] = await db.$transaction([
      db.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          stock: true,
          lowStockAt: true,
          price: true,
          active: true,
          category: { select: { id: true, name: true } },
          images: { select: { id: true }, orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * take,
        take,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      total,
      page,
      pages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error('Admin products fetch failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to load products.' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  if (!(await getAdmin()))
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );

  try {
    const parsed = productCreateSchema.safeParse(await req.json());
    if (!parsed.success)
      return NextResponse.json(
        { success: false, error: 'Please provide a valid product name and category.' },
        { status: 400 },
      );

    const b = parsed.data;
    const slug = await uniqueSlug(b.slug || b.name, candidate =>
      db.product.findUnique({ where: { slug: candidate }, select: { id: true } }).then(Boolean),
    );

    const p = await db.product.create({
      data: {
        name: b.name,
        slug,
        categoryId: b.categoryId,
        description: b.description || '',
        sku: b.sku || null,
        price: b.price ?? null,
        stock: b.stock ?? 0,
        lowStockAt: b.lowStockAt ?? 5,
        active: b.active ?? true,
      },
      select: { id: true, name: true, slug: true, stock: true, lowStockAt: true },
    });

    if (p.stock <= p.lowStockAt) await notifyLowStock(p.name, p.stock);

    return NextResponse.json({ success: true, data: p }, { status: 201 });
  } catch (error) {
    console.error('Admin product create failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to create product.' },
      { status: 500 },
    );
  }
}
