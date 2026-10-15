import { NextResponse } from 'next/server';
import { db } from '@/lib/db/prisma';
import { getAdmin } from '@/lib/auth/admin';
import { statusUpdateSchema } from '@/lib/validations/admin';

export async function GET() {
  if (!(await getAdmin()))
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );

  try {
    return NextResponse.json({
      success: true,
      data: await db.inquiry.findMany({
        include: { product: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
    });
  } catch (error) {
    console.error('Admin inquiries fetch failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to load inquiries.' },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  if (!(await getAdmin()))
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );

  try {
    const parsed = statusUpdateSchema.safeParse(await req.json());
    if (!parsed.success)
      return NextResponse.json(
        { success: false, error: 'Invalid status update.' },
        { status: 400 },
      );

    return NextResponse.json({
      success: true,
      data: await db.inquiry.update({
        where: { id: parsed.data.id },
        data: { status: parsed.data.status },
      }),
    });
  } catch (error) {
    console.error('Admin inquiry status update failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to update status.' },
      { status: 500 },
    );
  }
}
