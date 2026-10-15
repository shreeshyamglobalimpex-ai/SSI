import { NextResponse } from 'next/server';
import { db } from '@/lib/db/prisma';
import { getAdmin } from '@/lib/auth/admin';
import { siteContentSchema } from '@/lib/validations/admin';

export async function GET() {
  if (!(await getAdmin()))
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );

  try {
    const content = await db.siteContent.findUnique({ where: { key: 'about' } });
    return NextResponse.json({ success: true, data: content?.value || '' });
  } catch (error) {
    console.error('Admin about fetch failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to load content.' },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  if (!(await getAdmin()))
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );

  try {
    const parsed = siteContentSchema.safeParse(await req.json());
    if (!parsed.success)
      return NextResponse.json(
        { success: false, error: 'Content cannot be empty.' },
        { status: 400 },
      );

    return NextResponse.json({
      success: true,
      data: await db.siteContent.upsert({
        where: { key: 'about' },
        update: { value: parsed.data.value },
        create: { key: 'about', value: parsed.data.value },
      }),
    });
  } catch (error) {
    console.error('Admin about save failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to save content.' },
      { status: 500 },
    );
  }
}
