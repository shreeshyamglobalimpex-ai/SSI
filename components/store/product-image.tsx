"use client";
import { memo, useState } from "react";
import { Package } from "lucide-react";
import clsx from "clsx";

/**
 * Product thumbnail with a graceful fallback.
 *
 * Shared by the store grid and the product detail page so both render images
 * identically. Falls back to a placeholder icon when the product has no image
 * or the image fails to load. Memoised because the grid renders many of these.
 */
export const ProductImage = memo(function ProductImage({
  product,
  className,
}: {
  product: { id: string; name: string; images: { id: string }[] };
  className?: string;
}) {
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
});
