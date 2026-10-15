import { db, withDbRetry } from "@/lib/db/prisma";
import type { ContactInput } from "@/lib/validations/contact";
import { createNotification } from "@/services/notification.service";

export async function createContactMessage(input: ContactInput) {
  // Retry on transient Neon "connection closed" errors after an idle period.
  const row = await withDbRetry(() => db.contactMessage.create({ data: input }));

  // Contact form submissions previously created NO notification row, so the
  // admin bell never chimed for them. Create one for every message.
  try {
    await createNotification({
      type: "contact",
      title: "New contact message",
      message: `${input.name} (${input.email}): ${input.subject || "Contact request"} — ${input.message.slice(0, 140)}`,
    });
  } catch (error) {
    console.error("Contact notification failed:", error);
  }

  return row;
}
