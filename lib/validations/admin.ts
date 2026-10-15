import { z } from 'zod';

/** Shared pieces used by the admin product/import endpoints. */
const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal('')).transform(v => (v ? v : undefined));

const optionalNumber = z
  .union([z.number(), z.string()])
  .optional()
  .transform(v => {
    if (v === '' || v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  });

/**
 * Pack sizes accept either an array of strings (from the admin form) or a
 * comma/pipe-separated string (from spreadsheet import). Values are trimmed,
 * de-duplicated and capped so the list stays tidy.
 */
const packSizes = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .transform(v => {
    if (v === undefined || v === null || v === '') return undefined;
    const raw = Array.isArray(v) ? v : v.split(/[,|]/);
    const cleaned = raw
      .map(s => String(s).trim())
      .filter(Boolean)
      .slice(0, 30);
    return cleaned.length ? Array.from(new Set(cleaned)) : undefined;
  });

export const productCreateSchema = z.object({
  name: z.string().trim().min(2, 'Product name is required.').max(200),
  categoryId: z.string().min(1, 'Category is required.'),
  slug: optionalText(200),
  description: optionalText(5000),
  sku: optionalText(100),
  manufacturer: optionalText(200),
  ingredient: optionalText(5000),
  packSizes,
  priceInr: optionalNumber.pipe(z.number().min(0).optional()),
  priceUsd: optionalNumber.pipe(z.number().min(0).optional()),
  stock: optionalNumber.pipe(z.number().int().min(0).optional()),
  lowStockAt: optionalNumber.pipe(z.number().int().min(0).optional()),
  active: z
    .union([z.boolean(), z.enum(['true', 'false', '1', '0'])])
    .optional()
    .transform(v => (typeof v === 'string' ? v !== 'false' && v !== '0' : v)),
});

export const productUpdateSchema = productCreateSchema.partial();

/** Bulk action payload for selecting many products at once in the admin. */
export const productBulkSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'Select at least one product.').max(500),
  action: z.enum(['archive', 'delete']),
});

export const statusUpdateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['new', 'read', 'archived', 'contacted', 'closed']),
});

export const notificationReadSchema = z.object({
  id: z.string().min(1),
});

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(2, 'Category name is required.').max(100),
  slug: optionalText(100),
});

export const siteContentSchema = z.object({
  value: z.string().trim().min(1, 'Content cannot be empty.').max(20000),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().min(3).max(200),
  password: z.string().min(1, 'Password is required.').max(200),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
