import { NextResponse } from 'next/server';
import { inquirySchema } from '@/lib/validations/inquiry';
import { createInquiry } from '@/services/inquiry.service';
import { getClientIp, rateLimit, rateLimitResponse } from '@/lib/security/rate-limit';

/** Flatten Zod issues into a `{ field: message }` map for the client. */
function fieldErrors(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    // Keep the first message per field so the UI shows the most relevant one.
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`inquiry:${ip}`, 5, 10 * 60 * 1000);
    if (!limit.success) return rateLimitResponse(limit.resetAt);

    const body = await request.json().catch(() => null);
    const parsed = inquirySchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        {
          success: false,
          error: 'Please check the highlighted fields and try again.',
          fields: fieldErrors(parsed.error),
        },
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
