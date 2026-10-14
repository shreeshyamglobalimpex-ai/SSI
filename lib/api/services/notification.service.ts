import { api } from "@/lib/api/client";
import type { AdminNotification } from "@/types/api";

export const notificationService = {
  list: () => api.get<AdminNotification[]>("/admin/notifications"),

  markRead: (id: string) =>
    api.patch("/admin/notifications", { data: { id } }),
};
