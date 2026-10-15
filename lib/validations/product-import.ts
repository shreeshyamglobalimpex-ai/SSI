import { z } from "zod";

/**
 * Schema for a single spreadsheet row used by the product import.
 *
 * Excel/CSV cells are loosely typed, so every field is coerced defensively:
 * empty strings become `undefined`, numeric strings become numbers, and a few
 * truthy/falsey spellings map to booleans. Invalid values raise a friendly
 * message instead of silently defaulting.
 */

const optionalNumber = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : value;
}, z.number().min(0, "Price cannot be negative.").optional());

const intWithDefault = (fallback: number, label: string) =>
  z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) return fallback;
    const n = Number(value);
    return Number.isFinite(n) ? Math.trunc(n) : value;
  }, z.number().int().min(0, `${label} must be 0 or more.`));

const booleanWithDefault = (fallback: boolean) =>
  z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) return fallback;
    if (typeof value === "boolean") return value;
    const s = String(value).trim().toLowerCase();
    if (["false", "0", "no", "n"].includes(s)) return false;
    if (["true", "1", "yes", "y"].includes(s)) return true;
    return value;
  }, z.boolean());

export const productImportRowSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name is required (min 2 characters).")
    .max(200),
  category: z
    .string()
    .trim()
    .min(2, "Category is required (min 2 characters).")
    .max(100),
  sku: z.string().trim().max(100).optional().or(z.literal("")),
  slug: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  manufacturer: z.string().trim().max(200).optional().or(z.literal("")),
  ingredient: z.string().trim().max(5000).optional().or(z.literal("")),
  packSizes: z.string().trim().max(1000).optional().or(z.literal("")),
  priceInr: optionalNumber,
  priceUsd: optionalNumber,
  stock: intWithDefault(0, "Stock"),
  lowStockAt: intWithDefault(5, "Low-stock threshold"),
  active: booleanWithDefault(true),
});

export type ProductImportRow = z.infer<typeof productImportRowSchema>;

/** Envelope accepted by the batch import endpoint. */
export const productImportBatchSchema = z.object({
  products: z.array(z.unknown()).min(1).max(100),
});
