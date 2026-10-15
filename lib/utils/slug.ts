/**
 * Single source of truth for slug generation so every write path
 * (admin UI, Excel import, seed script, store) produces identical slugs.
 */
export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Resolves a slug against existing rows, appending `-2`, `-3`, … on collision.
 * `exists` should return true when a slug is already taken.
 */
export async function uniqueSlug(
  value: string,
  exists: (slug: string) => Promise<boolean>,
  maxAttempts = 50,
): Promise<string> {
  const base = slugify(value) || 'item';

  if (!(await exists(base))) return base;

  for (let suffix = 2; suffix < maxAttempts + 2; suffix += 1) {
    const candidate = `${base}-${suffix}`;
    if (!(await exists(candidate))) return candidate;
  }

  return `${base}-${Date.now().toString(36)}`;
}
