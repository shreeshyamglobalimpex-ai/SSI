import { NextResponse } from 'next/server';
import { db } from '@/lib/db/prisma';

export const revalidate = 300;

export async function GET() {
  try {
    const data = await db.category.findMany({
      where: { active: true },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(
      { success: true, data },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } },
    );
  } catch (error) {
    console.error('Store categories fetch failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to load categories.' },
      { status: 500 },
    );
  }
}
