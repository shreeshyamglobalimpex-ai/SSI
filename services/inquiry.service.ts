import { db, withDbRetry } from '@/lib/db/prisma';
import type { InquiryInput } from '@/lib/validations/inquiry';
import { sendAdminMail } from '@/lib/mail/zoho';
import { createNotification } from '@/services/notification.service';

export async function createInquiry(input: InquiryInput) {
  // The inquiry row is the source of truth — persist it first. Wrapped in a
  // retry so a transient Neon "connection closed" after an idle period doesn't
  // reject a valid submission.
  const row = await withDbRetry(() => db.inquiry.create({ data: input }));

  // Build a rich, single-line summary so the in-app notification (and any
  // mail-failure fallback) carries everything the admin needs at a glance.
  const details = [
    `Email: ${input.email}`,
    input.phone ? `Phone: ${input.phone}` : null,
    input.company ? `Company: ${input.company}` : null,
    input.country ? `Country: ${input.country}` : null,
    `Delivery: ${input.deliveryLocation}`,
    input.quantity ? `Quantity: ${input.quantity}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const message = `${input.name} requested ${input.productName}. ${details}`;

  // Email is best-effort. Track success so we can flag the notification when
  // the admin should rely on the in-app alert instead of their inbox.
  let mailSent = false;
  try {
    mailSent = await sendAdminMail(
      `New product inquiry: ${input.productName}`,
      [
        `Name: ${input.name}`,
        `Email: ${input.email}`,
        `Phone: ${input.phone || '-'}`,
        `Company: ${input.company || '-'}`,
        `Country: ${input.country || '-'}`,
        `Product: ${input.productName}`,
        `Delivery: ${input.deliveryLocation}`,
        `Quantity: ${input.quantity || '-'}`,
        '',
        `Message: ${input.message}`,
      ].join('\n'),
    );
  } catch (error) {
    console.error('Inquiry email failed:', error);
  }

  // Always create an in-app notification so the admin is alerted in-app even
  // when email is disabled or fails. Prefix makes the delivery state explicit.
  try {
    await createNotification({
      type: 'inquiry',
      title: mailSent
        ? 'New product inquiry'
        : 'New product inquiry (email not sent)',
      message,
    });
  } catch (error) {
    console.error('Inquiry notification failed:', error);
  }

  return { row, mailSent };
}

