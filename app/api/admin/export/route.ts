import { db } from '@/lib/db/prisma';
import { getAdmin } from '@/lib/auth/admin';
import * as XLSX from 'xlsx';

export async function GET() {
  if (!(await getAdmin())) return new Response('Unauthorized', { status: 401 });

  try {
    const rows = await db.product.findMany({
      select: {
        name: true,
        sku: true,
        description: true,
        price: true,
        stock: true,
        lowStockAt: true,
        active: true,
        category: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    });

    const data = rows.map((p) => ({
      name: p.name,
      sku: p.sku || '',
      category: p.category.name,
      description: p.description,
      price: p.price?.toString() || '',
      stock: p.stock,
      lowStockAt: p.lowStockAt,
      active: p.active,
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Products');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new Response(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="products.xlsx"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Admin export failed:', error);
    return new Response('Export failed', { status: 500 });
  }
}
