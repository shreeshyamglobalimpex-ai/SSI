import { z } from "zod";

/**
 * Product form schema (react-hook-form + zodResolver).
 *
 * Numbers arrive as strings from text inputs; the server coerces them, so the
 * client only guards that they are *parseable* — keeping UX errors local.
 */
const priceField = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine(
    (v) => v === "" || v === undefined || !Number.isNaN(Number(v)),
    "Enter a valid price.",
  );

export const productFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name is required.")
    .max(200, "Keep the name under 200 characters."),
  categoryId: z.string().min(1, "Please select a category."),
  sku: z.string().trim().max(100).optional().or(z.literal("")),
  manufacturer: z.string().trim().max(200).optional().or(z.literal("")),
  ingredient: z.string().trim().max(5000).optional().or(z.literal("")),
  // Entered as a comma-separated list (e.g. "10 tabs, 20 tabs, 100 ml").
  packSizes: z.string().trim().max(1000).optional().or(z.literal("")),
  priceInr: priceField,
  priceUsd: priceField,
  stock: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => v === "" || v === undefined || Number.isInteger(Number(v)),
      "Enter a whole number of units.",
    ),
  lowStockAt: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
