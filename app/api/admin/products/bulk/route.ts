import { NextResponse } from 'next/server';
import { db, withDbRetry } from '@/lib/db/prisma';
import { getAdmin } from '@/lib/auth/admin';
import { productBulkSchema } from '@/lib/validations/admin';

/**
 * Bulk product actions for the admin table's multi-select.
 *
 * POST /api/admin/products/bulk  { ids: string[], action: 'archive' | 'delete' }
 *
 * - `archive` (default): soft-deletes by setting active=false, keeping
 *   historical inquiries intact while hiding products from the store.
 * - `delete`: permanently removes the rows (images cascade, inquiry productId
 *   is set to null via the schema relation).
 */
export async function POST(req: Request) {
  if (!(await getAdmin()))
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );

  try {
    const parsed = productBulkSchema.safeParse(await req.json());
    if (!parsed.success)
      return NextResponse.json(
        { success: false, error: 'Please choose a valid action and at least one product.' },
        { status: 400 },
      );

    const { ids, action } = parsed.data;

    if (action === 'delete') {
      await withDbRetry(() => db.product.deleteMany({ where: { id: { in: ids } } }));
      return NextResponse.json({
        success: true,
        data: { affected: ids.length },
      });
    }

    // Default: soft-delete / archive.
    await withDbRetry(() =>
      db.product.updateMany({ where: { id: { in: ids } }, data: { active: false } }),
    );
    return NextResponse.json({
      success: true,
      data: { affected: ids.length },
    });
  } catch (error) {
    console.error('Bulk product action failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to process the selected products.' },
      { status: 500 },
    );
  }
}
