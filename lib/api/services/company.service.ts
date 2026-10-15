import { api } from "@/lib/api/client";
import type { Brand, Company, Market } from "@/types/company";

export interface CompanyPayload {
  company: Company;
  brands: Brand[];
  markets: Market[];
}

export const companyService = {
  get: () => api.get<CompanyPayload>("/company"),
};

export const siteContentService = {
  getAbout: () => api.get<string>("/admin/about"),
  saveAbout: (value: string) =>
    api.put("/admin/about", {
      data: { value },
      successMessage: "About page saved",
    }),
};
