import { api } from "@/lib/api/client";
import type {
  AdminCategory,
  AdminProduct,
  ImportResult,
  StoreProduct,
} from "@/types/api";
import type { ProductFormValues } from "@/lib/validations/product";
import type { ProductImportRow } from "@/lib/validations/product-import";

/** Query accepted by the admin products list endpoint. */
export type ProductListParams = {
  q?: string;
  page?: number;
};

/** Normalised result for the products list (envelope also carries totals). */
export interface ProductListResult {
  items: AdminProduct[];
  total: number;
  page: number;
  pages: number;
}

/** Normalised result for the public store listing/search. */
export interface StoreListResult {
  items: StoreProduct[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

export const productService = {
  /** Public store listing (all active products). */
  list: () => api.get<AdminProduct[]>("/products"),

  /**
   * Public store search with `q`, `category`, `page`, `pageSize` query params.
   * Returns the paginated result (envelope also carries total/pages).
   */
  listStore: async (
    params: {
      q?: string;
      category?: string;
      page?: number;
      pageSize?: number;
    } = {},
  ): Promise<StoreListResult> => {
    const envelope = await api.getEnvelope<StoreProduct[]>("/store/products", {
      params,
    });
    return {
      items: envelope.data ?? [],
      total: envelope.total ?? 0,
      page: envelope.page ?? 1,
      pageSize: envelope.pageSize ?? params.pageSize ?? 12,
      pages: envelope.pages ?? 1,
    };
  },

  /** Admin listing with search + pagination metadata. */
  listAdmin: async (
    params: ProductListParams = {},
  ): Promise<ProductListResult> => {
    const envelope = await api.getEnvelope<AdminProduct[]>(
      "/admin/products",
      { params },
    );
    return {
      items: envelope.data ?? [],
      total: envelope.total ?? 0,
      page: envelope.page ?? 1,
      pages: envelope.pages ?? 1,
    };
  },

  create: (values: ProductFormValues) =>
    api.post<AdminProduct>("/admin/products", { data: values }),

  update: (id: string, values: Partial<ProductFormValues>) =>
    api.patch<AdminProduct>(`/admin/products/${id}`, { data: values }),

  /** Soft-deletes (archives) a product. */
  archive: (id: string) =>
    api.delete(`/admin/products/${id}`, {
      successMessage: "Product archived",
    }),

  /** Archives (soft-delete) or permanently deletes many products at once. */
  bulkAction: (ids: string[], action: "archive" | "delete") =>
    api.post<{ affected: number }>("/admin/products/bulk", {
      data: { ids, action },
      successMessage:
        action === "delete"
          ? `${ids.length} product${ids.length === 1 ? "" : "s"} deleted`
          : `${ids.length} product${ids.length === 1 ? "" : "s"} archived`,
    }),

  /** Uploads a product image (multipart). */
  uploadImage: (id: string, file: File) => {
    const form = new FormData();
    form.append("image", file);
    return api.post(`/admin/products/${id}/image`, {
      formData: form,
      successMessage: "Image uploaded",
    });
  },

  /**
   * Imports one batch of up to 100 validated rows. The client chunks larger
   * files into 100-row batches and calls this repeatedly.
   */
  importBatch: (products: ProductImportRow[]) =>
    api.post<ImportResult>("/admin/products/import", { data: { products } }),

  /** Downloads the current catalog as an .xlsx file. */
  exportUrl: "/api/admin/export",

  getCategories: () => api.get<AdminCategory[]>("/admin/categories"),
};

export const categoryService = {
  list: () => api.get<AdminCategory[]>("/admin/categories"),
  create: (values: { name: string; slug?: string }) =>
    api.post<AdminCategory>("/admin/categories", {
      data: values,
      successMessage: "Category created",
    }),
};
