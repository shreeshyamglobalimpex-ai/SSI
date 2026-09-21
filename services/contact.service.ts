import { db } from "@/lib/db/prisma";
import type { ContactInput } from "@/lib/validations/contact";

export async function createContactMessage(input: ContactInput) {
  return db.contactMessage.create({ data: input });
}
