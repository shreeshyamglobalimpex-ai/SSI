import { NextResponse } from 'next/server';
import { db } from '@/lib/db/prisma';
import { verifyPassword, createAdminToken } from '@/lib/auth/admin';
import { adminLoginSchema } from '@/lib/validations/admin';
import { getClientIp, rateLimit, rateLimitResponse } from '@/lib/security/rate-limit';

const SESSION_COOKIE = 'ssi_admin';

export async function POST(req: Request) {
  try {
    // Throttle credential stuffing: 10 attempts per IP per 10 minutes.
    const limit = rateLimit(`login:${getClientIp(req)}`, 10, 10 * 60 * 1000);
    if (!limit.success) return rateLimitResponse(limit.resetAt);

    const parsed = adminLoginSchema.safeParse(await req.json());
    if (!parsed.success)
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 },
      );

    const { email, password } = parsed.data;
    const admin = await db.admin.findFirst({
      where: { email: email.toLowerCase(), active: true },
    });

    if (!admin || !(await verifyPassword(password, admin.passwordHash)))
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 },
      );

    const token = await createAdminToken(admin.id, admin.email);

    const days = Number(process.env.ADMIN_SESSION_DAYS);
    const maxAge = Number.isFinite(days) && days > 0 ? days * 86400 : 7 * 86400;

    const res = NextResponse.json({
      success: true,
      data: { id: admin.id, email: admin.email, name: admin.name },
    });

    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    return res;
  } catch (error) {
    console.error('Admin login failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to login' },
      { status: 500 },
    );
  }
}
