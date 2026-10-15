/**
 * Shared DTOs returned by the JSON API. Kept separate from the Prisma models
 * so client code depends on a stable, serialised shape (e.g. Decimal → string).
 */

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  manufacturer: string | null;
  ingredient: string | null;
  packSizes: string[];
  stock: number;
  lowStockAt: number;
  priceInr: string | null;
  priceUsd: string | null;
  description: string;
  active: boolean;
  category: { id: string; name: string; slug?: string };
  images: { id: string }[];
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  active: boolean;
}

export interface AdminInquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  country: string | null;
  deliveryLocation: string;
  productId: string | null;
  product: { id: string; name: string } | null;
  productName: string;
  quantity: string | null;
  message: string;
  status: string;
  createdAt: string;
}

export interface AdminContact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string | null;
  message: string;
  status: string;
  createdAt: string;
}

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: string;
}

/** Shape returned by the public store listing/search endpoints. */
export interface StoreProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string | null;
  manufacturer: string | null;
  ingredient: string | null;
  packSizes: string[];
  stock: number;
  priceInr: string | null;
  priceUsd: string | null;
  category: { id: string; name: string; slug: string };
  images: { id: string }[];
}

/** Full detail for a single product on its detail page. */
export interface StoreProductDetail {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  manufacturer: string | null;
  ingredient: string | null;
  packSizes: string[];
  description: string;
  stock: number;
  priceInr: string | null;
  priceUsd: string | null;
  category: { id: string; name: string; slug: string };
  images: { id: string }[];
}

/** Per-row failure reported back from a single import batch. */
export interface ImportRowError {
  /** Index within the submitted batch, or null for a batch-level failure. */
  index: number | null;
  message: string;
}

/** Aggregate result of importing one batch of up to 100 records. */
export interface ImportResult {
  processed: number;
  created: number;
  updated: number;
  skipped: number;
  errors: ImportRowError[];
}

export type InquiryStatus =
  | "new"
  | "read"
  | "archived"
  | "contacted"
  | "closed";
