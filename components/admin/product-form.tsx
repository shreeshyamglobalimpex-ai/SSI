"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productFormSchema,
  type ProductFormValues,
} from "@/lib/validations/product";
import { useProductsStore } from "@/store/products-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { AdminProduct } from "@/types/api";

const EMPTY_DEFAULTS: ProductFormValues = {
  name: "",
  categoryId: "",
  sku: "",
  manufacturer: "",
  ingredient: "",
  packSizes: "",
  stock: "0",
  lowStockAt: "5",
  priceInr: "",
  priceUsd: "",
  description: "",
};

/**
 * Maps an existing product into the form's string-based values so the same
 * component handles both create and edit. Decimals arrive as strings from the
 * API and stock/lowStockAt as numbers, so they are coerced back to strings.
 */
function toDefaults(product: AdminProduct): ProductFormValues {
  return {
    name: product.name,
    categoryId: product.category?.id ?? "",
    sku: product.sku ?? "",
    manufacturer: product.manufacturer ?? "",
    ingredient: product.ingredient ?? "",
    packSizes: (product.packSizes ?? []).join(", "),
    stock: String(product.stock ?? 0),
    lowStockAt: String(product.lowStockAt ?? 5),
    priceInr: product.priceInr ?? "",
    priceUsd: product.priceUsd ?? "",
    description: product.description ?? "",
  };
}

/**
 * Admin product form — validation via zod + react-hook-form.
 *
 * Pass `product` to switch into edit mode (prefills values and PATCHes the
 * existing record); omit it to create a new product.
 */
export function ProductForm({
  product,
  onDone,
}: {
  product?: AdminProduct;
  onDone?: () => void;
}) {
  const categories = useProductsStore((s) => s.categories);
  const create = useProductsStore((s) => s.create);
  const update = useProductsStore((s) => s.update);

  const isEdit = Boolean(product);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product ? toDefaults(product) : EMPTY_DEFAULTS,
  });

  async function submit(values: ProductFormValues) {
    const ok = isEdit && product
      ? await update(product.id, values)
      : await create(values);
    if (ok) {
      if (!isEdit) reset(EMPTY_DEFAULTS);
      onDone?.();
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-4 md:grid-cols-4">
      <div className="md:col-span-2">
        <Label>Product name</Label>
        <Input {...register("name")} placeholder="e.g. Paracetamol 500mg" />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label>Category</Label>
        <select
          {...register("categoryId")}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="">Select…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-xs text-red-600">
            {errors.categoryId.message}
          </p>
        )}
      </div>

      <div>
        <Label>SKU</Label>
        <Input {...register("sku")} placeholder="Optional" />
      </div>

      <div>
        <Label>Manufacturer</Label>
        <Input {...register("manufacturer")} placeholder="e.g. Cipla" />
        {errors.manufacturer && (
          <p className="mt-1 text-xs text-red-600">{errors.manufacturer.message}</p>
        )}
      </div>

      <div className="md:col-span-2">
        <Label>Ingredient / composition</Label>
        <Input
          {...register("ingredient")}
          placeholder="e.g. Ivermectin 12mg"
        />
        {errors.ingredient && (
          <p className="mt-1 text-xs text-red-600">{errors.ingredient.message}</p>
        )}
      </div>

      <div className="md:col-span-2">
        <Label>Pack sizes</Label>
        <Input
          {...register("packSizes")}
          placeholder="Comma-separated, e.g. 10 tablets, 20 tablets, 100 ml"
        />
        {errors.packSizes && (
          <p className="mt-1 text-xs text-red-600">{errors.packSizes.message}</p>
        )}
      </div>

      <div>
        <Label>Stock</Label>
        <Input type="number" min={0} {...register("stock")} />
        {errors.stock && (
          <p className="mt-1 text-xs text-red-600">{errors.stock.message}</p>
        )}
      </div>

      <div>
        <Label>Price (₹ INR)</Label>
        <Input type="number" min={0} step="0.01" {...register("priceInr")} />
        {errors.priceInr && (
          <p className="mt-1 text-xs text-red-600">{errors.priceInr.message}</p>
        )}
      </div>

      <div>
        <Label>Price ($ USD)</Label>
        <Input type="number" min={0} step="0.01" {...register("priceUsd")} />
        {errors.priceUsd && (
          <p className="mt-1 text-xs text-red-600">{errors.priceUsd.message}</p>
        )}
      </div>

      <div>
        <Label>Low-stock at</Label>
        <Input type="number" min={0} {...register("lowStockAt")} />
      </div>

      <div className="md:col-span-2">
        <Label>Description</Label>
        <Textarea {...register("description")} rows={3} />
      </div>

      <div className="flex items-end md:col-span-2">
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting
            ? isEdit
              ? "Saving…"
              : "Creating…"
            : isEdit
              ? "Save changes"
              : "Create product"}
        </Button>
      </div>
    </form>
  );
}
