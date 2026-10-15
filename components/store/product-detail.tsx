"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  ShieldCheck,
  Truck,
  Globe2,
  BadgeCheck,
} from "lucide-react";
import { InquiryModal } from "./inquiry-modal";
import { ProductImage } from "./product-image";
import { ShareButtons } from "./share-buttons";
import { EXPORT_LOCATIONS } from "@/lib/constants/export-locations";
import type { StoreProductDetail } from "@/types/api";

/** Formats a price string with a thousands separator (INR). */
function formatInr(value: string): string {
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString("en-IN") : value;
}

export function ProductDetail({
  product,
  related,
}: {
  product: StoreProductDetail;
  related: StoreProductDetail[];
}) {
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  const inStock = product.stock > 0;
  const lowStock = inStock && product.stock <= 10;

  // Absolute URL for sharing — falls back to window.location on the client so
  // the SSG page always shares the correct canonical address.
  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/store/${product.slug}`;

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link
          href="/store"
          className="inline-flex items-center gap-1.5 font-medium text-slate-600 transition hover:text-emerald-700"
        >
          <ArrowLeft className="size-4" /> Store
        </Link>
        <span className="text-slate-300">/</span>
        <Link
          href={`/store?category=${product.category.slug}`}
          className="font-medium text-slate-600 transition hover:text-emerald-700"
        >
          {product.category.name}
        </Link>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm lg:sticky lg:top-8 lg:self-start">
          <ProductImage product={product} className="h-full w-full" />
          {!inStock && (
            <span className="absolute left-4 top-4 rounded-full bg-slate-900/85 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
              Out of stock
            </span>
          )}
        </div>

        {/* Details */}
        <div>
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            {product.category.name}
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            {product.name}
          </h1>

          {/* Price */}
          <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            {product.priceInr ? (
              <span className="text-3xl font-semibold text-slate-900">
                ₹{formatInr(product.priceInr)}
              </span>
            ) : null}
            {product.priceUsd ? (
              <span className="text-xl font-semibold text-slate-500">
                ${product.priceUsd}
              </span>
            ) : null}
            {!product.priceInr && !product.priceUsd && (
              <span className="text-lg font-medium text-slate-500">
                Price on request
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="mt-4">
            {inStock ? (
              <span
                className={
                  lowStock
                    ? "inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 ring-1 ring-inset ring-amber-600/10"
                    : "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10"
                }
              >
                <BadgeCheck className="size-4" />
                {lowStock
                  ? `Low stock — only ${product.stock} left`
                  : `${product.stock} in stock`}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700 ring-1 ring-inset ring-rose-600/10">
                Out of stock
              </span>
            )}
          </div>

          {/* Meta */}
          {product.sku && (
            <p className="mt-4 text-sm text-slate-500">
              SKU: <span className="font-medium text-slate-700">{product.sku}</span>
            </p>
          )}

          {/* Specifications: manufacturer, ingredient, pack sizes */}
          {(product.manufacturer ||
            product.ingredient ||
            (product.packSizes && product.packSizes.length > 0)) && (
            <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {product.manufacturer && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Manufacturer
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {product.manufacturer}
                  </dd>
                </div>
              )}
              {product.ingredient && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Ingredient / composition
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {product.ingredient}
                  </dd>
                </div>
              )}
              {product.packSizes && product.packSizes.length > 0 && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Pack sizes
                  </dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {product.packSizes.map((size) => (
                      <span
                        key={size}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700"
                      >
                        {size}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          )}

          {/* Description */}
          <div className="mt-6 border-t border-slate-100 pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Product details
            </h2>
            {product.description ? (
              <p className="mt-3 whitespace-pre-line text-base leading-7 text-slate-600">
                {product.description}
              </p>
            ) : (
              <p className="mt-3 text-base leading-7 text-slate-400">
                No description available. Send an enquiry and our team will share
                full specifications.
              </p>
            )}
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => setEnquiryOpen(true)}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <Send className="size-4" /> Send enquiry
            </button>
            <Link
              href="/store"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Continue browsing
            </Link>
          </div>

          {/* Trust points */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3">
              <ShieldCheck className="size-5 shrink-0 text-emerald-600" />
              <span className="text-sm text-slate-600">
                Quality-assured sourcing
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3">
              <Truck className="size-5 shrink-0 text-emerald-600" />
              <span className="text-sm text-slate-600">
                Global export &amp; delivery
              </span>
            </div>
          </div>

          {/* Export / delivery locations */}
          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/40 p-5">
            <div className="flex items-center gap-2">
              <Globe2 className="size-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-slate-700">
                Global export &amp; delivery locations
              </h3>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {EXPORT_LOCATIONS.map((loc) => (
                <span
                  key={loc}
                  className="rounded-full border border-emerald-100 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {loc}
                </span>
              ))}
            </div>
          </div>

          {/* Share */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <ShareButtons
              url={shareUrl}
              title={product.name}
              description={product.description}
            />
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-16 border-t border-slate-100 pt-10">
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            More in {product.category.name}
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/store/${r.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(15,23,42,0.1)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <ProductImage
                    product={r}
                    className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-sm font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-emerald-700">
                    {r.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                    {r.description || "No description available."}
                  </p>
                  <span className="mt-3 text-sm font-semibold text-slate-900">
                    {r.priceInr
                      ? `₹${formatInr(r.priceInr)}`
                      : r.priceUsd
                        ? `$${r.priceUsd}`
                        : "Price on request"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {enquiryOpen && (
        <InquiryModal
          product={{ id: product.id, name: product.name }}
          onClose={() => setEnquiryOpen(false)}
        />
      )}
    </div>
  );
}

