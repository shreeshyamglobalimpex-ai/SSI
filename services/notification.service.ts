import { db } from '@/lib/db/prisma';

type NotifyInput = {
  type: string;
  title: string;
  message: string;
};

/**
 * Creates a notification, collapsing duplicates: if an unread notification with
 * the same type and title already exists it is refreshed instead of duplicated.
 */
export async function createNotification({ type, title, message }: NotifyInput) {
  const existing = await db.notification.findFirst({
    where: { type, title, read: false },
    orderBy: { createdAt: 'desc' },
  });

  if (existing) {
    if (existing.message === message) return existing;
    return db.notification.update({
      where: { id: existing.id },
      data: { message },
    });
  }

  return db.notification.create({ data: { type, title, message } });
}

/** Low-stock alert helper used by product create/update routes. */
export async function notifyLowStock(productName: string, stock: number) {
  return createNotification({
    type: 'inventory',
    title: 'Low stock',
    message: `${productName} has ${stock} units remaining.`,
  });
}
