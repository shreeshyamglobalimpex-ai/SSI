import { api } from "@/lib/api/client";
import type { AdminProfile } from "@/types/api";

export const authService = {
  /**
   * Signs in and stores the session cookie. `redirectOn401: false` keeps the
   * client from bouncing to the login page on a wrong-password 401.
   */
  login: (values: { email: string; password: string }) =>
    api.post<AdminProfile>("/admin/login", {
      data: values,
      silent: true,
      redirectOn401: false,
    }),

  logout: () =>
    api.post("/admin/logout", {
      silent: true,
      successMessage: "Signed out",
    }),

  /** Returns the current admin, or null when unauthenticated. */
  me: async (): Promise<AdminProfile | null> => {
    try {
      const admin = await api.get<AdminProfile | null>("/admin/me", {
        silent: true,
        redirectOn401: false,
      });
      return admin ?? null;
    } catch {
      return null;
    }
  },
};
