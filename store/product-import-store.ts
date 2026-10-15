import { create } from "zustand";
import { productService } from "@/lib/api/services/product.service";
import { productImportRowSchema } from "@/lib/validations/product-import";
import type { ImportResult, ImportRowError } from "@/types/api";

/** Rows the client has validated and is ready to send in batches. */
export interface ValidRow {
  index: number; // position in the original sheet
  values: Record<string, unknown>;
}

export interface ImportProgress {
  batch: number;
  totalBatches: number;
  created: number;
  updated: number;
  skipped: number;
  errors: ImportRowError[];
}

interface ProductImportState {
  /** Rows that passed client-side validation. */
  validRows: ValidRow[];
  /** Rows that failed validation (shown before any upload). */
  invalidRows: ImportRowError[];
  running: boolean;
  progress: ImportProgress | null;
  done: boolean;

  /** Stores the parsed + validated rows ready for batching. */
  setRows: (valid: ValidRow[], invalid: ImportRowError[]) => void;
  /** Sends all valid rows in batches of 100 and tracks live progress. */
  start: () => Promise<void>;
  reset: () => void;
}

const BATCH_SIZE = 100;

export const useProductImportStore = create<ProductImportState>((set, get) => ({
  validRows: [],
  invalidRows: [],
  running: false,
  progress: null,
  done: false,

  setRows: (valid, invalid) =>
    set({ validRows: valid, invalidRows: invalid, progress: null, done: false }),

  start: async () => {
    const rows = get().validRows;
    if (rows.length === 0) return;

    set({ running: true, progress: { batch: 0, totalBatches: Math.ceil(rows.length / BATCH_SIZE), created: 0, updated: 0, skipped: 0, errors: [] } });

    const totals = { created: 0, updated: 0, skipped: 0, errors: [] as ImportRowError[] };

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const chunk = rows.slice(i, i + BATCH_SIZE);
      // Re-validate defensively; drop any row that fails silently so the
      // server never receives malformed data.
      const payload = chunk
        .map((r) => productImportRowSchema.safeParse(r.values))
        .filter((r) => r.success)
        .map((r) => r.data);

      try {
        const result: ImportResult = await productService.importBatch(payload);
        totals.created += result.created;
        totals.updated += result.updated;
        totals.skipped += result.skipped;
        totals.errors.push(...result.errors);
      } catch {
        // apiFetch already surfaced the toast; mark the batch as failed.
        totals.errors.push({ index: null, message: `Batch ${Math.floor(i / BATCH_SIZE) + 1} failed to send.` });
      }

      set((s) => ({
        progress: s.progress && {
          ...s.progress,
          batch: Math.floor(i / BATCH_SIZE) + 1,
          created: totals.created,
          updated: totals.updated,
          skipped: totals.skipped,
          errors: totals.errors,
        },
      }));
    }

    set({ running: false, done: true });
  },

  reset: () => set({ validRows: [], invalidRows: [], progress: null, done: false, running: false }),
}));
