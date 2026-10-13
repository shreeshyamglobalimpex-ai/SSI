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

export const productCreateSchema = z.object({
  name: z.string().trim().min(2, 'Product name is required.').max(200),
  categoryId: z.string().min(1, 'Category is required.'),
  slug: optionalText(200),
  description: optionalText(5000),
  sku: optionalText(100),
  price: optionalNumber.pipe(z.number().min(0).optional()),
  stock: optionalNumber.pipe(z.number().int().min(0).optional()),
  lowStockAt: optionalNumber.pipe(z.number().int().min(0).optional()),
  active: z
    .union([z.boolean(), z.enum(['true', 'false', '1', '0'])])
    .optional()
    .transform(v => (typeof v === 'string' ? v !== 'false' && v !== '0' : v)),
});

export const productUpdateSchema = productCreateSchema.partial();

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
