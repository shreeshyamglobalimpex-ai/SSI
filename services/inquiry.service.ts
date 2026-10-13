import { db } from '@/lib/db/prisma';
import type { InquiryInput } from '@/lib/validations/inquiry';
import { sendAdminMail } from '@/lib/mail/zoho';
import { createNotification } from '@/services/notification.service';

export async function createInquiry(input: InquiryInput) {
  // The inquiry row is the source of truth — persist it first.
  const row = await db.inquiry.create({ data: input });

  // Side effects (alert + email) must never fail a successful submission.
  try {
    await createNotification({
      type: 'inquiry',
      title: 'New product inquiry',
      message: `${input.name} requested ${input.productName}.`,
    });
  } catch (error) {
    console.error('Inquiry notification failed:', error);
  }

  try {
    await sendAdminMail(
      `New product inquiry: ${input.productName}`,
      [
        `Name: ${input.name}`,
        `Email: ${input.email}`,
        `Phone: ${input.phone || '-'}`,
        `Delivery: ${input.deliveryLocation}`,
        `Quantity: ${input.quantity || '-'}`,
        `Message: ${input.message}`,
      ].join('\n'),
    );
  } catch (error) {
    console.error('Inquiry email failed:', error);
  }

  return row;
}

