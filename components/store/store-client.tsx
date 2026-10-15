"use client";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Search, Package } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { ProductImage } from "./product-image";
import { productService } from "@/lib/api/services";
import type { StoreListResult } from "@/lib/api/services";
import { Pagination } from "@/components/ui/pagination";
import type { StoreProduct } from "@/types/api";

type P = StoreProduct;

/** Page-size choices offered in the "Per page" selector. */
const PAGE_SIZE_OPTIONS = [12, 24, 48, 96];

/** A single product card. Memoised so typing in the search box (which changes
 *  the parent's `q` state) does not re-render every unchanged card. */
const ProductCard = memo(function ProductCard({ product }: { product: P }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(15,23,42,0.1)]">
      <Link
        href={`/store/${product.slug}`}
        className="absolute inset-0 z-10"
        aria-label={`View details for ${product.name}`}
      />
      <div className="relative aspect-[4/3] overflow-hidden">
        <ProductImage
          product={product}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700 backdrop-blur">
          {product.category.name}
        </span>
        {product.stock <= 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
            Out of stock
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-base font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-emerald-700">
          {product.name}
        </h2>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {product.description || "No description available."}
        </p>
        <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {product.priceInr ? (
            <span className="text-lg font-semibold text-slate-900">
              ₹{product.priceInr}
            </span>
          ) : null}
          {product.priceUsd ? (
            <span className="text-sm font-semibold text-slate-500">
              ${product.priceUsd}
            </span>
          ) : null}
          {!product.priceInr && !product.priceUsd && (
            <span className="text-sm text-slate-400">Price on request</span>
          )}
        </div>
        <span className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-semibold text-white transition group-hover:bg-emerald-700">
          View details
        </span>
      </div>
    </article>
  );
});

export default function StoreClient({
  initialCategories,
  initialProducts,
  initialPageSize,
  initialTotal,
  initialPages,
  initialCategory = "",
  initialQuery = "",
}: {
  initialCategories: { id: string; name: string; slug: string }[];
  initialProducts: P[];
  initialPageSize: number;
  initialTotal: number;
  initialPages: number;
  initialCategory?: string;
  initialQuery?: string;
}) {
  const [items, setItems] = useState<P[] | null>(null);
  const [q, setQ] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(initialTotal);
  const [pages, setPages] = useState(initialPages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(
    async (search: string, cat: string, pageNum: number, size: number) => {
      setLoading(true);
      setError("");

      try {
        const d: StoreListResult = await productService.listStore({
          q: search,
          category: cat,
          page: pageNum,
          pageSize: size,
        });

        setItems(d.items ?? []);
        setTotal(d.total ?? 0);
        setPages(d.pages ?? 1);
      } catch {
        setError("Unable to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // The unfiltered first page at the default size is server-rendered, so it
  // never needs a request. Any other combination (filter, page, or custom
  // page size) fetches from the API.
  const isInitialView =
    q === "" && category === "" && page === 1 && pageSize === initialPageSize;

  // Changing search/category/page/pageSize refetches with the new params.
  useEffect(() => {
    if (isInitialView) return;

    const t = setTimeout(() => void load(q, category, page, pageSize), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, page, pageSize, load]);

  // Selecting a category toggles it: clicking the active one clears it.
  function pickCategory(slug: string) {
    setCategory((c) => (c === slug ? "" : slug));
    setPage(1);
  }

  // Changing page size resets to page 1 so the user never lands off the end.
  function changePageSize(size: number) {
    setPageSize(size);
    setPage(1);
  }

  // Unfiltered first page falls back to the server-rendered list; every other
  // state (filter, page, or custom size) renders the fetched result.
  const visible = isInitialView ? initialProducts : (items ?? []);
  const displayTotal = isInitialView ? initialTotal : total;
  const displayPages = isInitialView ? initialPages : pages;
  const displayPage = isInitialView ? 1 : page;

  const pills = useMemo(
    () => [
      { label: "All", slug: "" },
      ...initialCategories.map((c) => ({ label: c.name, slug: c.slug })),
    ],
    [initialCategories],
  );

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-14 text-white sm:px-12">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-10 size-64 rounded-full bg-emerald-700/20 blur-3xl" />
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
          Store
        </p>
        <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight md:text-5xl">
          Products &amp; medicines
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
          Browse our catalogue and send a product-specific requirement directly
          to our team — we respond within one business day.
        </p>
      </div>

      {/* Search + category pills */}
      <div className="mt-8 flex flex-col gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search products…"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        {/* Category pills: horizontal scroll on mobile, but wrap onto multiple
            rows on desktop so every category is always visible (no clipping). */}
        <div className="-mx-5 flex flex-wrap gap-2 px-5 lg:mx-0 lg:px-0">
          {pills.map((p) => (
            <button
              key={p.slug || "all"}
              onClick={() => pickCategory(p.slug)}
              aria-pressed={category === p.slug}
              className={clsx(
                "rounded-full border px-4 py-2 text-sm font-medium transition",
                category === p.slug
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-800",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse overflow-hidden rounded-2xl border border-slate-100 bg-white"
            >
              <div className="aspect-[4/3] bg-slate-100" />
              <div className="space-y-3 p-5">
                <div className="h-3 w-20 rounded bg-slate-100" />
                <div className="h-4 w-3/4 rounded bg-slate-100" />
                <div className="h-3 w-full rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-12 flex flex-col items-center rounded-3xl border border-rose-200 bg-rose-50 px-6 py-20 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-white text-rose-300">
            <Package className="size-6" strokeWidth={1.5} />
          </span>
          <p className="mt-4 text-sm font-medium text-rose-700">{error}</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-12 flex flex-col items-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-slate-50 text-slate-300">
            <Package className="size-6" strokeWidth={1.5} />
          </span>
          <p className="mt-4 text-sm font-medium text-slate-700">
            No products found
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Try a different search or category.
          </p>
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && visible.length > 0 && (
        <div className="mt-12 flex flex-col items-center gap-4">
          <Pagination
            page={displayPage}
            pages={displayPages}
            onChange={setPage}
          />

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
            <p className="text-xs text-slate-400">
              Showing {visible.length} of {displayTotal}{" "}
              product{displayTotal === 1 ? "" : "s"}
            </p>

            {/* Per-page selector — lets visitors load more per page. */}
            <label className="flex items-center gap-2 text-xs text-slate-500">
              Per page
              <select
                value={pageSize}
                onChange={(e) => changePageSize(Number(e.target.value))}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}
    </section>
  );
}
