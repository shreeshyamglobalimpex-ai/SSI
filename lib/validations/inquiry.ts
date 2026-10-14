import { z } from 'zod';

/**
 * Inquiry validation (shared by the public store modal, the contact page form
 * and the API route). Every field carries a human-readable message so the API
 * can return field-level errors and the UI can show them inline.
 *
 * Text inputs arrive as strings; optional fields may be omitted or sent as an
 * empty string, so both are normalised to `undefined`.
 */
const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined))
    .optional();

export const inquirySchema = z.object({
  name: z
    .string({ error: 'Please enter your name.' })
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(120, 'Name must be under 120 characters.'),
  email: z
    .string({ error: 'Please enter your email.' })
    .trim()
    .min(1, 'Please enter your email.')
    .email('Enter a valid email address.'),
  phone: optionalText(30, 'Phone must be under 30 characters.'),
  company: optionalText(120, 'Company must be under 120 characters.'),
  country: optionalText(80, 'Country must be under 80 characters.'),
  productId: optionalText(64, 'Invalid product reference.'),
  productName: z
    .string({ error: 'Please specify the product.' })
    .trim()
    .min(1, 'Please specify the product.')
    .max(200, 'Product name must be under 200 characters.'),
  deliveryLocation: z
    .string({ error: 'Please enter a delivery location.' })
    .trim()
    .min(2, 'Delivery location must be at least 2 characters.')
    .max(300, 'Delivery location must be under 300 characters.'),
  quantity: optionalText(80, 'Quantity must be under 80 characters.'),
  message: z
    .string({ error: 'Please enter a message.' })
    .trim()
    .min(5, 'Message must be at least 5 characters.')
    .max(3000, 'Message must be under 3000 characters.'),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
