import { NextResponse } from 'next/server';
import { db } from '@/lib/db/prisma';
import { getAdmin } from '@/lib/auth/admin';
import { slugify } from '@/lib/utils/slug';
import {
  productImportRowSchema,
  type ProductImportRow,
} from '@/lib/validations/product-import';
import type { ImportRowError } from '@/types/api';

/**
 * Batch product import.
 *
 * The client parses the spreadsheet, validates rows and sends them here in
 * batches of up to 100 so a large file becomes many small, independently
 * reportable requests (real progress + partial success). Each batch is applied
 * inside a single transaction so it either fully lands or fully rolls back.
 */

const MAX_BATCH = 100;

function text(value: unknown): string {
  return value === undefined || value === null ? '' : String(value).trim();
}

/** Splits a comma/pipe-separated pack-size cell into a clean string array. */
function packSizes(value: unknown): string[] {
  const raw = text(value);
  if (!raw) return [];
  const cleaned = raw
    .split(/[,|]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30);
  return Array.from(new Set(cleaned));
}

export async function POST(req: Request) {
  if (!(await getAdmin()))
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );

  try {
    const body = (await req.json()) as { products?: unknown };
    const rows = Array.isArray(body?.products) ? body.products : null;

    if (!rows || rows.length === 0)
      return NextResponse.json(
        { success: false, error: 'No rows to import.' },
        { status: 400 },
      );

    if (rows.length > MAX_BATCH)
      return NextResponse.json(
        {
          success: false,
          error: `Send at most ${MAX_BATCH} rows per batch.`,
        },
        { status: 400 },
      );

    // Validate every row up front; keep the good ones, collect per-row errors.
    const valid: ProductImportRow[] = [];
    const errors: ImportRowError[] = [];
    const seenSlugs = new Set<string>();

    rows.forEach((raw, index) => {
      const parsed = productImportRowSchema.safeParse(raw);
      if (!parsed.success) {
        const message =
          parsed.error.issues[0]?.message ?? 'Invalid row.';
        errors.push({ index, message });
        return;
      }

      const row = parsed.data;
      const slug = slugify(row.slug || row.name);

      // A slug can only appear once per batch — later duplicates would clash.
      if (seenSlugs.has(slug)) {
        errors.push({ index, message: `Duplicate product "${row.name}" in this batch.` });
        return;
      }
      seenSlugs.add(slug);
      valid.push(row);
    });

    if (valid.length === 0) {
      return NextResponse.json({
        success: true,
        data: { processed: rows.length, created: 0, updated: 0, skipped: rows.length, errors },
      });
    }

    // Resolve/upsert every referenced category once, up front.
    const categories = new Map<string, string>();
    for (const row of valid) {
      const categorySlug = slugify(row.category);
      if (categories.has(categorySlug)) continue;

      const category = await db.category.upsert({
        where: { slug: categorySlug },
        update: { name: text(row.category) },
        create: { name: text(row.category), slug: categorySlug },
        select: { id: true },
      });
      categories.set(categorySlug, category.id);
    }

    // Existing products keyed by slug so we can report created vs updated.
    const allSlugs = valid.map((r) => slugify(r.slug || r.name));
    const existing = await db.product.findMany({
      where: { slug: { in: allSlugs } },
      select: { slug: true },
    });
    const existingSlugs = new Set(existing.map((p) => p.slug));

    let created = 0;
    let updated = 0;

    // Upsert inside one transaction; a failure rolls the whole batch back.
    try {
      await db.$transaction(
        valid.map((row) => {
          const slug = slugify(row.slug || row.name);
          const data = {
            name: text(row.name),
            categoryId: categories.get(slugify(row.category))!,
            description: text(row.description),
            sku: text(row.sku) || null,
            manufacturer: text(row.manufacturer) || null,
            ingredient: text(row.ingredient) || null,
            packSizes: packSizes(row.packSizes),
            priceInr: row.priceInr ?? null,
            priceUsd: row.priceUsd ?? null,
            stock: row.stock,
            lowStockAt: row.lowStockAt,
            active: row.active,
          };

          if (existingSlugs.has(slug)) updated += 1;
          else created += 1;

          return db.product.upsert({
            where: { slug },
            update: data,
            create: { slug, ...data },
          });
        }),
      );
    } catch (error) {
      console.error('Import batch transaction failed:', error);
      // Mark every validated row as failed so the client reports the batch.
      return NextResponse.json({
        success: true,
        data: {
          processed: rows.length,
          created: 0,
          updated: 0,
          skipped: rows.length,
          errors: [
            ...errors,
            {
              index: null,
              message:
                'This batch could not be saved (a database conflict occurred). Please retry.',
            },
          ],
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        processed: rows.length,
        created,
        updated,
        skipped: rows.length - valid.length,
        errors,
      },
    });
  } catch (error) {
    console.error('Admin product import failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to import products.' },
      { status: 500 },
    );
  }
}
