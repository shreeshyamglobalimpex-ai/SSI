import { api } from "@/lib/api/client";
import type {
  AdminContact,
  AdminInquiry,
  InquiryStatus,
} from "@/types/api";
import type { ContactInput } from "@/lib/validations/contact";
import type { InquiryInput } from "@/lib/validations/inquiry";

export const inquiryService = {
  /** Public submission from the store / contact page. */
  submit: (values: InquiryInput) =>
    api.post("/inquiries", { data: values, silent: true }),

  list: () => api.get<AdminInquiry[]>("/admin/inquiries"),

  setStatus: (id: string, status: InquiryStatus) =>
    api.patch<AdminInquiry>("/admin/inquiries", { data: { id, status } }),
};

export const contactService = {
  /** Public contact form submission. */
  submit: (values: ContactInput) =>
    api.post("/contact", { data: values, silent: true }),

  list: () => api.get<AdminContact[]>("/admin/contacts"),

  setStatus: (id: string, status: InquiryStatus) =>
    api.patch<AdminContact>("/admin/contacts", { data: { id, status } }),
};
