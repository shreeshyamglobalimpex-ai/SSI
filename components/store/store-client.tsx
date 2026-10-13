"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Package, Send } from "lucide-react";
import clsx from "clsx";
import { InquiryModal } from "./inquiry-modal";

type P = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: { id: string; name: string; slug: string };
  stock: number;
  price: string | null;
  images: { id: string }[];
};

function ProductImage({ product, className }: { product: P; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (product.images.length === 0 || failed) {
    return (
      <div
        className={clsx(
          "grid place-items-center bg-gradient-to-br from-emerald-50 to-slate-50 text-emerald-300",
          className,
        )}
      >
        <Package className="size-10" strokeWidth={1.5} />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/products/${product.id}/image`}
      alt={product.name}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={clsx("object-cover", className)}
    />
  );
}

export default function StoreClient({
  initialCategories,
  initialProducts,
  initialPageSize,
}: {
  initialCategories: { id: string; name: string; slug: string }[];
  initialProducts: P[];
  initialPageSize: number;
}) {
  const [items, setItems] = useState<P[] | null>(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState<P | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (search: string, cat: string) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/store/products?q=${encodeURIComponent(search)}&category=${encodeURIComponent(cat)}&pageSize=${initialPageSize}`,
      );
      const d = (await res.json()) as { success: boolean; data?: P[] };

      if (!d.success) throw new Error("Request failed");

      // Tagging the result with its query keeps a slow response for an old
      // filter from ever being rendered as if it were the current one.
      setItems(d.data ?? []);
    } catch {
      setError("Unable to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [initialPageSize]);

  useEffect(() => {
    // With no filters the server-rendered page is authoritative — no request.
    if (q === "" && category === "") return;

    const t = setTimeout(() => void load(q, category), 250);
    return () => clearTimeout(t);
  }, [q, category, load]);

  // Unfiltered state always falls back to the server-rendered list.
  const visible = q === "" && category === "" ? initialProducts : (items ?? []);

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
      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-1 lg:justify-end lg:px-0">
          {pills.map((p) => (
            <button
              key={p.slug || "all"}
              onClick={() => setCategory(p.slug)}
              className={clsx(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
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
            <article
              key={p.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(15,23,42,0.1)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <ProductImage
                  product={p}
                  className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700 backdrop-blur">
                  {p.category.name}
                </span>
                {p.stock <= 0 && (
                  <span className="absolute right-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                    Out of stock
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-base font-semibold tracking-tight text-slate-900">
                  {p.name}
                </h2>
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-500">
                  {p.description || "No description available."}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  {p.price ? (
                    <span className="text-lg font-semibold text-slate-900">
                      ₹{p.price}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">Price on request</span>
                  )}
                </div>
                <button
                  onClick={() => setSelected(p)}
                  className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  <Send className="size-4" /> Send enquiry
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selected && (
        <InquiryModal product={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
