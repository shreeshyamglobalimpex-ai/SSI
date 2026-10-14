import { create } from "zustand";
import {
  productService,
  type ProductListParams,
  type ProductListResult,
} from "@/lib/api/services/product.service";
import type { AdminCategory, AdminProduct } from "@/types/api";
import type { ProductFormValues } from "@/lib/validations/product";

interface ProductsState {
  items: AdminProduct[];
  total: number;
  page: number;
  pages: number;
  query: string;
  categories: AdminCategory[];
  loading: boolean;
  error: string;

  fetch: (params?: ProductListParams) => Promise<void>;
  fetchCategories: () => Promise<void>;
  create: (values: ProductFormValues) => Promise<boolean>;
  update: (id: string, values: Partial<ProductFormValues>) => Promise<boolean>;
  archive: (id: string) => Promise<boolean>;
  bulkAction: (ids: string[], action: "archive" | "delete") => Promise<boolean>;
  uploadImage: (id: string, file: File) => Promise<boolean>;
}

export const useProductsStore = create<ProductsState>((set) => ({
  items: [],
  total: 0,
  page: 1,
  pages: 1,
  query: "",
  categories: [],
  loading: false,
  error: "",

  fetch: async (params = {}) => {
    set({ loading: true, error: "" });
    try {
      const result: ProductListResult = await productService.listAdmin(params);
      set({
        items: result.items,
        total: result.total,
        page: result.page,
        pages: result.pages,
        query: params.q ?? "",
      });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to load products" });
    } finally {
      set({ loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const cats = await productService.getCategories();
      set({ categories: cats });
    } catch {
      // error toast already shown by apiFetch
    }
  },

  create: async (values) => {
    try {
      const created = await productService.create(values);
      // Prepend optimistically; the list refreshes from the server.
      set((s) => ({ items: [created, ...s.items], total: s.total + 1 }));
      return true;
    } catch {
      return false;
    }
  },

  update: async (id, values) => {
    try {
      await productService.update(id, values);
      return true;
    } catch {
      return false;
    }
  },

  archive: async (id) => {
    try {
      await productService.archive(id);
      set((s) => ({
        items: s.items.filter((p) => p.id !== id),
        total: Math.max(0, s.total - 1),
      }));
      return true;
    } catch {
      return false;
    }
  },

  bulkAction: async (ids, action) => {
    if (ids.length === 0) return false;
    try {
      await productService.bulkAction(ids, action);
      // Remove the affected rows from the current view; the caller refetches
      // to reconcile totals/pagination.
      const idSet = new Set(ids);
      set((s) => ({
        items: s.items.filter((p) => !idSet.has(p.id)),
        total: Math.max(0, s.total - ids.length),
      }));
      return true;
    } catch {
      return false;
    }
  },

  uploadImage: async (id, file) => {
    try {
      await productService.uploadImage(id, file);
      return true;
    } catch {
      return false;
    }
  },
}));
