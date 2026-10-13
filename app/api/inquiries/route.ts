import { NextResponse } from 'next/server';
import { inquirySchema } from '@/lib/validations/inquiry';
import { createInquiry } from '@/services/inquiry.service';
import { getClientIp, rateLimit, rateLimitResponse } from '@/lib/security/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`inquiry:${ip}`, 5, 10 * 60 * 1000);
    if (!limit.success) return rateLimitResponse(limit.resetAt);

    const parsed = inquirySchema.safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json(
        { success: false, error: 'Please check the submitted fields.' },
        { status: 400 },
      );

    await createInquiry(parsed.data);
    return NextResponse.json(
      { success: true, data: { message: 'Inquiry received.' } },
      { status: 201 },
    );
  } catch (error) {
    console.error('Inquiry submission failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to process your inquiry.' },
      { status: 500 },
    );
  }
}
