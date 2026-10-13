import { NextResponse } from 'next/server';
import { db } from '@/lib/db/prisma';
import { getAdmin } from '@/lib/auth/admin';
import { notificationReadSchema } from '@/lib/validations/admin';

export async function GET() {
  if (!(await getAdmin()))
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );

  try {
    return NextResponse.json({
      success: true,
      data: await db.notification.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    });
  } catch (error) {
    console.error('Admin notifications fetch failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to load notifications.' },
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
    const parsed = notificationReadSchema.safeParse(await req.json());
    if (!parsed.success)
      return NextResponse.json(
        { success: false, error: 'Invalid notification.' },
        { status: 400 },
      );

    await db.notification.update({
      where: { id: parsed.data.id },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin notification update failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to update notification.' },
      { status: 500 },
    );
  }
}
