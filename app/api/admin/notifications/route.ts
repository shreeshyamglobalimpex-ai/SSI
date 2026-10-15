import { NextResponse } from 'next/server';
import { db } from '@/lib/db/prisma';
import { getAdmin } from '@/lib/auth/admin';
import { notificationReadSchema } from '@/lib/validations/admin';

export async function GET(req: Request) {
  if (!(await getAdmin()))
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );

  try {
    const mode = new URL(req.url).searchParams.get('mode');

    // Lightweight ping used by the header bell poller. Returns only the
    // unread count + the single newest row (tiny payload, fast query) so a
    // 15–30s poll doesn't load the DB. Full list only for the page itself.
    if (mode === 'ping') {
      const [unread, latest] = await db.$transaction([
        db.notification.count({ where: { read: false } }),
        db.notification.findFirst({
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            type: true,
            title: true,
            message: true,
            read: true,
            createdAt: true,
          },
        }),
      ]);
      return NextResponse.json({
        success: true,
        unread,
        latest,
        data: latest ? [latest] : [],
      });
    }

    const [items, unread] = await db.$transaction([
      db.notification.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      db.notification.count({ where: { read: false } }),
    ]);

    return NextResponse.json({ success: true, data: items, unread });
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
