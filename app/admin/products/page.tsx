"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  ImageUp,
  Package,
  Pencil,
  Plus,
  Search,
  Upload,
} from "lucide-react";
import {
  Badge,
  Card,
  EmptyState,
  PageHeader,
  Spinner,
} from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";
import { ImportProducts } from "@/components/admin/import-products";
import { Pagination } from "@/components/ui/pagination";
import { useProductsStore } from "@/store/products-store";
import type { AdminProduct } from "@/types/api";

export default function Products() {
  const items = useProductsStore((s) => s.items);
  const categories = useProductsStore((s) => s.categories);
  const loading = useProductsStore((s) => s.loading);
  const page = useProductsStore((s) => s.page);
  const pages = useProductsStore((s) => s.pages);
  const query = useProductsStore((s) => s.query);
  const fetchProducts = useProductsStore((s) => s.fetch);
  const fetchCategories = useProductsStore((s) => s.fetchCategories);
  const archive = useProductsStore((s) => s.archive);
  const bulkAction = useProductsStore((s) => s.bulkAction);
  const uploadImage = useProductsStore((s) => s.uploadImage);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Multi-select: ids of the checked rows on the current page.
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  // Debounced server-side search. Typing resets to page 1 so results stay
  // relevant; an explicit page change (via Pagination) refetches that page.
  useEffect(() => {
    const t = setTimeout(() => void fetchProducts({ q, page: 1 }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // Clear row selection whenever the search term changes so ids from a previous
  // result set never carry over.
  useEffect(() => {
    clearSelection();
  }, [q]);

  const gotoPage = useCallback(
    (p: number) => void fetchProducts({ q, page: p }),
    [fetchProducts, q],
  );

  // Refresh the current view after a create/edit so totals and rows stay true.
  const refresh = useCallback(
    () => void fetchProducts({ q, page }),
    [fetchProducts, q, page],
  );

  // With server-side search the loaded items *are* the filtered set — no
  // client-side slicing needed.
  const data = useMemo(() => items, [items]);

  // ── Multi-select helpers ──────────────────────────────────────────────
  const selectedIds = useMemo(() => Array.from(selected), [selected]);
  const allOnPageSelected =
    data.length > 0 && data.every((p) => selected.has(p.id));
  const someOnPageSelected = data.some((p) => selected.has(p.id));

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) data.forEach((p) => next.delete(p.id));
      else data.forEach((p) => next.add(p.id));
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function runBulk(action: "archive" | "delete") {
    if (selectedIds.length === 0) return;
    const label =
      action === "delete" ? "permanently delete" : "archive (hide from store)";
    if (
      !confirm(
        `${label} ${selectedIds.length} product${
          selectedIds.length === 1 ? "" : "s"
        }?`,
      )
    )
      return;

    setBulkBusy(true);
    const ok = await bulkAction(selectedIds, action);
    setBulkBusy(false);
    if (ok) {
      clearSelection();
      await fetchProducts({ q, page });
    }
  }
  // ─────────────────────────────────────────────────────────────────────

  async function upload(id: string) {
    if (!file) return;
    setUploading(id);
    const ok = await uploadImage(id, file);
    if (ok) {
      setFile(null);
      await fetchProducts({ q, page });
    }
    setUploading(null);
  }

  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title="Products & inventory"
          subtitle="Create products, manage stock and upload images."
          actions={
            <>
              <a
                href="/api/admin/export"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <Download className="size-4" /> Export
              </a>
              <button
                onClick={() => setShowImport((v) => !v)}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <Upload className="size-4" /> {showImport ? "Close import" : "Import"}
              </button>
              <button
                onClick={() => setShowForm((v) => !v)}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus className="size-4" /> {showForm ? "Close" : "New product"}
              </button>
            </>
          }
        />

        {/* Bulk import */}
        {showImport && (
          <div className="mb-8">
            <ImportProducts />
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <Card className="mb-8 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              New product
            </h2>
            <div className="mt-4">
              <ProductForm
                onDone={() => {
                  setShowForm(false);
                  refresh();
                }}
              />
            </div>
          </Card>
        )}

        {/* Edit form */}
        {editing && (
          <Card className="mb-8 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Edit product
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>
            <div className="mt-4">
              <ProductForm
                product={editing}
                onDone={() => {
                  setEditing(null);
                  refresh();
                }}
              />
            </div>
          </Card>
        )}

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or SKU…"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          {/* Bulk action bar — visible only when rows are selected */}
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-emerald-50/60 px-5 py-3">
              <p className="text-sm font-medium text-slate-700">
                {selectedIds.length} selected
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearSelection}
                  disabled={bulkBusy}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-white disabled:opacity-50"
                >
                  Clear
                </button>
                <button
                  onClick={() => runBulk("archive")}
                  disabled={bulkBusy}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
                >
                  {bulkBusy ? "Working…" : "Archive"}
                </button>
                <button
                  onClick={() => runBulk("delete")}
                  disabled={bulkBusy}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:pointer-events-none disabled:opacity-50"
                >
                  {bulkBusy ? "Working…" : "Delete"}
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
              <Spinner /> Loading products…
            </div>
          ) : data.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products found"
              hint={q ? "Try a different search term." : "Create your first product to get started."}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label="Select all on this page"
                        checked={allOnPageSelected}
                        ref={(el) => {
                          if (el)
                            el.indeterminate =
                              !allOnPageSelected && someOnPageSelected;
                        }}
                        onChange={toggleAllOnPage}
                        className="size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </th>
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Manufacturer</th>
                    <th className="px-5 py-3">Price (₹ / $)</th>
                    <th className="px-5 py-3">Stock</th>
                    <th className="px-5 py-3">Image</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((p) => {
                    const low = p.stock <= (p.lowStockAt || 5);
                    return (
                      <tr key={p.id} className="transition hover:bg-slate-50/60">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            aria-label={`Select ${p.name}`}
                            checked={selected.has(p.id)}
                            onChange={() => toggleOne(p.id)}
                            className="size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-900">{p.name}</p>
                          {p.sku && (
                            <p className="mt-0.5 text-xs text-slate-400">SKU {p.sku}</p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <Badge tone="slate">{p.category?.name}</Badge>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {p.manufacturer || <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          <div className="flex flex-col">
                            {p.priceInr && <span>₹{p.priceInr}</span>}
                            {p.priceUsd && <span className="text-slate-400">${p.priceUsd}</span>}
                            {!p.priceInr && !p.priceUsd && <span>—</span>}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <Badge tone={low ? "rose" : "emerald"}>
                            {low ? "Low · " : ""}
                            {p.stock} in stock
                          </Badge>
                        </td>
                        <td className="px-5 py-4">
                          {p.images.length > 0 ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`/api/products/${p.id}/image`}
                              alt={p.name}
                              loading="lazy"
                              decoding="async"
                              className="size-10 rounded-lg border border-slate-100 object-cover"
                            />
                          ) : (
                            <span className="grid size-10 place-items-center rounded-lg bg-slate-50 text-slate-300">
                              <ImageUp className="size-4" />
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setShowForm(false);
                                setEditing(p);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                            >
                              <Pencil className="size-3.5" /> Edit
                            </button>
                            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
                              {uploading === p.id ? (
                                <Spinner className="size-3" />
                              ) : (
                                <Upload className="size-3.5" />
                              )}
                              {file ? "Upload" : "Choose image"}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                              />
                            </label>
                            <button
                              onClick={() => upload(p.id)}
                              disabled={!file || uploading === p.id}
                              className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-40"
                            >
                              Save
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm(`Archive "${p.name}"? It will be hidden from the store.`)) return;
                                await archive(p.id);
                              }}
                              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                            >
                              Archive
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && data.length > 0 && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row">
              <p className="text-xs text-slate-400">
                Page {page} of {pages} · {query ? `${items.length} match` : ""}
                {query ? "es" : "items"} on this page
              </p>
              <Pagination page={page} pages={pages} onChange={gotoPage} />
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
