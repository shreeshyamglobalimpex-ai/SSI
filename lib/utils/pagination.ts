/**
 * Parses a query-string parameter into a bounded integer.
 * `Math.max(1, Number('abc'))` is `NaN`, which Prisma rejects — this never is.
 */
export function parseBoundedInt(
  raw: string | null,
  fallback: number,
  min: number,
  max: number,
): number {
  const parsed = Number.parseInt(raw ?? '', 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
