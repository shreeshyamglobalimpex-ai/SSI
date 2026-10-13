import { db } from '@/lib/db/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const image = await db.productImage.findFirst({
      where: { product: { id, active: true } },
      orderBy: { createdAt: 'desc' },
      select: { data: true, mimeType: true, size: true },
    });

    if (!image) return new Response('Not found', { status: 404 });

    return new Response(new Uint8Array(image.data), {
      headers: {
        'Content-Type': image.mimeType,
        'Content-Length': String(image.size),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Product image fetch failed:', error);
    return new Response('Server error', { status: 500 });
  }
}
