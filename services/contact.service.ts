import { db, withDbRetry } from "@/lib/db/prisma";
import type { ContactInput } from "@/lib/validations/contact";

export async function createContactMessage(input: ContactInput) {
  // Retry on transient Neon "connection closed" errors after an idle period.
  return withDbRetry(() => db.contactMessage.create({ data: input }));
}
