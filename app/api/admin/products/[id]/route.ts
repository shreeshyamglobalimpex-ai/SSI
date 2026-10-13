import { NextResponse } from 'next/server';
import { db } from '@/lib/db/prisma';
import { getAdmin } from '@/lib/auth/admin';
import { productUpdateSchema } from '@/lib/validations/admin';
import { notifyLowStock } from '@/services/notification.service';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdmin()))
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );

  try {
    const { id } = await params;

    const parsed = productUpdateSchema.safeParse(await req.json());
    if (!parsed.success)
      return NextResponse.json(
        { success: false, error: 'Please check the submitted fields.' },
        { status: 400 },
      );

    const b = parsed.data;

    const p = await db.product.update({
      where: { id },
      data: {
        name: b.name,
        categoryId: b.categoryId,
        description: b.description ?? '',
        sku: b.sku || null,
        price: b.price === undefined ? undefined : (b.price ?? null),
        stock: b.stock,
        lowStockAt: b.lowStockAt,
        active: b.active,
      },
      select: { id: true, name: true, stock: true, lowStockAt: true },
    });

    if (p.stock <= p.lowStockAt) await notifyLowStock(p.name, p.stock);

    return NextResponse.json({ success: true, data: p });
  } catch (error) {
    console.error('Admin product update failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to update product.' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdmin()))
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );

  try {
    const { id } = await params;

    // Soft delete keeps historical inquiries intact while hiding it from the store.
    await db.product.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin product archive failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to archive product.' },
      { status: 500 },
    );
  }
}
