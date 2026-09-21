import { db } from "@/lib/db/prisma";
import type { InquiryInput } from "@/lib/validations/inquiry";

export async function createInquiry(input: InquiryInput) {
  return db.inquiry.create({ data: input });
}
