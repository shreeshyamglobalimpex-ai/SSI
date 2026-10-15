import { db } from '@/lib/db/prisma';

type NotifyInput = {
  type: string;
  title: string;
  message: string;
};

/**
 * Creates a fresh notification row for every event.
 *
 * Each inquiry / contact / inventory event gets its own row (new id) so the
 * admin bell + polling can detect "brand new id" reliably and chime. We
 * intentionally do NOT collapse duplicates — collapsing reused the same id,
 * which made the bell think nothing new arrived.
 */
export async function createNotification({ type, title, message }: NotifyInput) {
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

