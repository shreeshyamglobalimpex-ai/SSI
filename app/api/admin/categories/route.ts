import { NextResponse } from 'next/server';
import { db } from '@/lib/db/prisma';
import { getAdmin } from '@/lib/auth/admin';
import { categoryCreateSchema } from '@/lib/validations/admin';
import { uniqueSlug } from '@/lib/utils/slug';

export async function GET() {
  if (!(await getAdmin()))
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );

  try {
    return NextResponse.json({
      success: true,
      data: await db.category.findMany({
        select: { id: true, name: true, slug: true, active: true },
        orderBy: { name: 'asc' },
      }),
    });
  } catch (error) {
    console.error('Admin categories fetch failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to load categories.' },
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
    const parsed = categoryCreateSchema.safeParse(await req.json());
    if (!parsed.success)
      return NextResponse.json(
        { success: false, error: 'Please provide a valid category name.' },
        { status: 400 },
      );

    const slug = await uniqueSlug(parsed.data.slug || parsed.data.name, candidate =>
      db.category
        .findUnique({ where: { slug: candidate }, select: { id: true } })
        .then(Boolean),
    );

    return NextResponse.json(
      {
        success: true,
        data: await db.category.create({
          data: { name: parsed.data.name, slug },
          select: { id: true, name: true, slug: true, active: true },
        }),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Admin category create failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to create category.' },
      { status: 500 },
    );
  }
}
