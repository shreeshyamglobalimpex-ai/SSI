import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  company: z.string().trim().max(150).optional().or(z.literal("")),
  country: z.string().trim().min(2).max(100),
  product: z.string().trim().max(200).optional().or(z.literal("")),
  quantity: z.string().trim().max(100).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(3000),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
