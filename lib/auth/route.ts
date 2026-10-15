import { NextResponse } from 'next/server';

/** Standard JSON helpers so every API route fails consistently. */
export function unauthorized() {
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 401 },
  );
}

export function badRequest(error: string) {
  return NextResponse.json({ success: false, error }, { status: 400 });
}

export function notFound(error = 'Not found') {
  return NextResponse.json({ success: false, error }, { status: 404 });
}

export function conflict(error: string) {
  return NextResponse.json({ success: false, error }, { status: 409 });
}

export function serverError(error = 'Server error') {
  return NextResponse.json({ success: false, error }, { status: 500 });
}

/** Turns unknown thrown values into a safe, non-leaking response. */
export function handleRouteError(error: unknown, fallback = 'Server error') {
  if (error instanceof Error && error.message === 'UNAUTHORIZED') {
    return unauthorized();
  }

  console.error(error);
  return serverError(fallback);
}
